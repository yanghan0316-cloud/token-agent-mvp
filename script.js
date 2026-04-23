const player = {
    token: 100,
    ownedAgents: [],
    rentedAgents: [],
    logs: [],
    notice: {
        type: "info",
        text: "System ready. Buy or rent an agent, then assign a task."
    }
};

const specialtyLabels = {
    collect: "Collect",
    craft: "Craft",
    transport: "Transport"
};

const statusLabels = {
    idle: "Idle",
    working: "Working"
};

const agents = [
    {
        id: 1,
        name: "Collector",
        buyPrice: 40,
        rentPrice: 15,
        specialty: "collect",
        bonus: 1.2,
        status: "idle",
        owned: false,
        rented: false,
        currentTaskId: null,
        taskEndsAt: null
    },
    {
        id: 2,
        name: "Crafter",
        buyPrice: 55,
        rentPrice: 20,
        specialty: "craft",
        bonus: 1.25,
        status: "idle",
        owned: false,
        rented: false,
        currentTaskId: null,
        taskEndsAt: null
    },
    {
        id: 3,
        name: "Courier",
        buyPrice: 35,
        rentPrice: 12,
        specialty: "transport",
        bonus: 1.15,
        status: "idle",
        owned: false,
        rented: false,
        currentTaskId: null,
        taskEndsAt: null
    }
];

const tasks = [
    {
        id: 1,
        name: "Gather Wood",
        type: "collect",
        duration: 10,
        output: 5,
        exchangeRate: 2
    },
    {
        id: 2,
        name: "Assemble Parts",
        type: "craft",
        duration: 15,
        output: 6,
        exchangeRate: 3
    },
    {
        id: 3,
        name: "Deliver Cargo",
        type: "transport",
        duration: 8,
        output: 4,
        exchangeRate: 2.5
    }
];

let progressTimer = null;

function setNotice(type, text) {
    player.notice = { type, text };
}

function addLog(text) {
    const time = new Date().toLocaleTimeString("en-GB", {
        hour12: false
    });
    player.logs.push(`[${time}] ${text}`);
}

function getAgentOwnershipLabel(agent) {
    if (agent.owned) {
        return "Owned";
    }
    if (agent.rented) {
        return "Rented";
    }
    return "Locked";
}

function getAgentCurrentTask(agent) {
    return tasks.find(task => task.id === agent.currentTaskId) || null;
}

function getRemainingSeconds(agent) {
    if (!agent.taskEndsAt) {
        return 0;
    }
    return Math.max(0, Math.ceil((agent.taskEndsAt - Date.now()) / 1000));
}

function getTaskProgress(agent) {
    const task = getAgentCurrentTask(agent);
    if (!task || !agent.taskEndsAt) {
        return 0;
    }

    const elapsed = task.duration - getRemainingSeconds(agent);
    return Math.min(100, Math.max(0, Math.round((elapsed / task.duration) * 100)));
}

function ensureProgressTimer() {
    const hasActiveTask = agents.some(agent => agent.status === "working");

    if (hasActiveTask && !progressTimer) {
        progressTimer = setInterval(() => {
            render();
        }, 1000);
    }

    if (!hasActiveTask && progressTimer) {
        clearInterval(progressTimer);
        progressTimer = null;
    }
}

function buyAgent(agentId) {
    const agent = agents.find(a => a.id === agentId);
    if (!agent || agent.owned) {
        return;
    }

    if (player.token < agent.buyPrice) {
        setNotice("error", `Not enough Token to buy ${agent.name}.`);
        addLog(`Buy failed: ${agent.name} costs ${agent.buyPrice} Token, current balance is ${player.token}.`);
        render();
        return;
    }

    player.token -= agent.buyPrice;
    agent.owned = true;
    agent.rented = false;
    if (!player.ownedAgents.includes(agent.id)) {
        player.ownedAgents.push(agent.id);
    }

    setNotice("success", `${agent.name} purchased for ${agent.buyPrice} Token.`);
    addLog(`Bought ${agent.name} for ${agent.buyPrice} Token.`);
    render();
}

function rentAgent(agentId) {
    const agent = agents.find(a => a.id === agentId);
    if (!agent || agent.owned || agent.rented) {
        return;
    }

    if (player.token < agent.rentPrice) {
        setNotice("error", `Not enough Token to rent ${agent.name}.`);
        addLog(`Rent failed: ${agent.name} costs ${agent.rentPrice} Token, current balance is ${player.token}.`);
        render();
        return;
    }

    player.token -= agent.rentPrice;
    agent.rented = true;
    if (!player.rentedAgents.includes(agent.id)) {
        player.rentedAgents.push(agent.id);
    }

    setNotice("success", `${agent.name} rented for ${agent.rentPrice} Token.`);
    addLog(`Rented ${agent.name} for ${agent.rentPrice} Token.`);
    render();
}

function calculateReward(agent, task) {
    let coefficient = 1.0;

    if (agent.specialty === task.type) {
        coefficient = agent.bonus;
    } else {
        coefficient = 0.85;
    }

    return Math.floor(task.output * task.exchangeRate * coefficient);
}

function startTask(agentId, taskId) {
    const agent = agents.find(a => a.id === agentId);
    const task = tasks.find(t => t.id === taskId);

    if (!agent || !task) {
        return;
    }

    const usable = agent.owned || agent.rented;
    if (!usable) {
        setNotice("error", `${agent.name} is locked. Buy or rent first.`);
        addLog(`Task start failed: ${agent.name} is not available yet.`);
        render();
        return;
    }

    if (agent.status === "working") {
        setNotice("warning", `${agent.name} is already working.`);
        addLog(`Task start blocked: ${agent.name} is busy.`);
        render();
        return;
    }

    agent.status = "working";
    agent.currentTaskId = task.id;
    agent.taskEndsAt = Date.now() + task.duration * 1000;

    setNotice("info", `${agent.name} started "${task.name}". ETA: ${task.duration}s.`);
    addLog(`${agent.name} started task: ${task.name}.`);
    ensureProgressTimer();
    render();

    setTimeout(() => {
        const reward = calculateReward(agent, task);
        player.token += reward;
        agent.status = "idle";
        agent.currentTaskId = null;
        agent.taskEndsAt = null;

        setNotice("success", `${agent.name} finished "${task.name}" and earned ${reward} Token.`);
        addLog(`${agent.name} completed ${task.name} and earned ${reward} Token.`);
        ensureProgressTimer();
        render();
    }, task.duration * 1000);
}

function render() {
    const workingCount = agents.filter(agent => agent.status === "working").length;

    document.getElementById("token-panel").innerHTML = `
    <section class="panel panel-highlight">
      <h2>Account Status</h2>
      <div class="stats-grid">
        <div class="stat-card">
          <span class="stat-label">Current Token</span>
          <strong class="stat-value">${player.token}</strong>
        </div>
        <div class="stat-card">
          <span class="stat-label">Owned Agents</span>
          <strong class="stat-value">${player.ownedAgents.length}</strong>
        </div>
        <div class="stat-card">
          <span class="stat-label">Rented Agents</span>
          <strong class="stat-value">${player.rentedAgents.length}</strong>
        </div>
        <div class="stat-card">
          <span class="stat-label">Active Tasks</span>
          <strong class="stat-value">${workingCount}</strong>
        </div>
      </div>
      <div class="notice notice-${player.notice.type}">
        <span class="notice-label">Status Message</span>
        <p>${player.notice.text}</p>
      </div>
    </section>
  `;

    document.getElementById("agent-panel").innerHTML = `
    <section class="panel">
      <h2>Agent List</h2>
      <div class="agent-list">
        ${agents.map(agent => {
            const currentTask = getAgentCurrentTask(agent);
            const remaining = getRemainingSeconds(agent);
            const progress = getTaskProgress(agent);
            const canUse = agent.owned || agent.rented;
            const isWorking = agent.status === "working";

            return `
            <article class="agent-card ${isWorking ? "agent-working" : ""}">
              <div class="agent-header">
                <strong>${agent.name}</strong>
                <span class="badge badge-${isWorking ? "working" : "idle"}">${statusLabels[agent.status]}</span>
              </div>
              <p>Ownership: ${getAgentOwnershipLabel(agent)}</p>
              <p>Specialty: ${specialtyLabels[agent.specialty]} | Bonus: x${agent.bonus}</p>
              <p>Buy: ${agent.buyPrice} Token | Rent: ${agent.rentPrice} Token</p>
              <p class="agent-task-text">
                ${isWorking
                    ? `Current task: ${currentTask.name}, ${remaining}s remaining`
                    : canUse
                        ? "Current task: none, ready for assignment."
                        : "Current task: unavailable until unlocked."}
              </p>
              <div class="progress-wrap ${isWorking ? "" : "progress-hidden"}">
                <div class="progress-bar">
                  <div class="progress-fill" style="width: ${progress}%"></div>
                </div>
                <span class="progress-text">${progress}%</span>
              </div>
              <div class="button-row">
                <button onclick="buyAgent(${agent.id})" ${agent.owned ? "disabled" : ""}>Buy</button>
                <button onclick="rentAgent(${agent.id})" ${(agent.owned || agent.rented) ? "disabled" : ""}>Rent</button>
                ${tasks.map(task => `
                  <button onclick="startTask(${agent.id}, ${task.id})" ${(!canUse || isWorking) ? "disabled" : ""}>
                    ${task.name}
                  </button>
                `).join("")}
              </div>
            </article>
          `;
        }).join("")}
      </div>
    </section>
  `;

    document.getElementById("task-panel").innerHTML = `
    <section class="panel">
      <h2>Task Overview</h2>
      <div class="task-list">
        ${tasks.map(task => `
          <article class="task-card">
            <strong>${task.name}</strong>
            <p>Type: ${specialtyLabels[task.type]}</p>
            <p>Duration: ${task.duration}s</p>
            <p>Output: ${task.output} | Rate: ${task.exchangeRate}</p>
          </article>
        `).join("")}
      </div>
    </section>
  `;

    document.getElementById("log-panel").innerHTML = `
    <section class="panel">
      <h2>Activity Log</h2>
      <ul class="log-list">
        ${player.logs.length
            ? player.logs.slice().reverse().map(log => `<li>${log}</li>`).join("")
            : "<li>No logs yet. Your first action will appear here.</li>"}
      </ul>
    </section>
  `;
}

render();
