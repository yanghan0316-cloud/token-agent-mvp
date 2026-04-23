const RENT_DURATION_SECONDS = 30;

const player = {
    token: 100,
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
        taskEndsAt: null,
        rentEndsAt: null
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
        taskEndsAt: null,
        rentEndsAt: null
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
        taskEndsAt: null,
        rentEndsAt: null
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

let uiTimer = null;

function setNotice(type, text) {
    player.notice = { type, text };
}

function addLog(text) {
    const time = new Date().toLocaleTimeString("en-GB", {
        hour12: false
    });
    player.logs.push(`[${time}] ${text}`);
}

function getOwnedAgents() {
    return agents.filter(agent => agent.owned);
}

function getRentedAgents() {
    return agents.filter(agent => agent.rented);
}

function getWorkingAgents() {
    return agents.filter(agent => agent.status === "working");
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

function getRemainingSeconds(endTime) {
    if (!endTime) {
        return 0;
    }
    return Math.max(0, Math.ceil((endTime - Date.now()) / 1000));
}

function getTaskRemainingSeconds(agent) {
    return getRemainingSeconds(agent.taskEndsAt);
}

function getRentRemainingSeconds(agent) {
    return getRemainingSeconds(agent.rentEndsAt);
}

function getTaskProgress(agent) {
    const task = getAgentCurrentTask(agent);
    if (!task || !agent.taskEndsAt) {
        return 0;
    }

    const elapsed = task.duration - getTaskRemainingSeconds(agent);
    return Math.min(100, Math.max(0, Math.round((elapsed / task.duration) * 100)));
}

function releaseExpiredRentals() {
    const expiredAgents = agents.filter(agent => agent.rented && getRentRemainingSeconds(agent) === 0);

    expiredAgents.forEach(agent => {
        agent.rented = false;
        agent.rentEndsAt = null;

        if (agent.status === "working") {
            agent.status = "idle";
            agent.currentTaskId = null;
            agent.taskEndsAt = null;
        }

        addLog(`Rental expired for ${agent.name}.`);
    });

    if (expiredAgents.length > 0) {
        setNotice("warning", `${expiredAgents.map(agent => agent.name).join(", ")} rental expired.`);
    }
}

function ensureUiTimer() {
    const hasTimedState = agents.some(agent => agent.status === "working" || agent.rented);

    if (hasTimedState && !uiTimer) {
        uiTimer = setInterval(() => {
            releaseExpiredRentals();
            render();
        }, 1000);
    }

    if (!hasTimedState && uiTimer) {
        clearInterval(uiTimer);
        uiTimer = null;
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
    agent.rentEndsAt = null;

    setNotice("success", `${agent.name} purchased for ${agent.buyPrice} Token.`);
    addLog(`Bought ${agent.name} for ${agent.buyPrice} Token.`);
    ensureUiTimer();
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
    agent.rentEndsAt = Date.now() + RENT_DURATION_SECONDS * 1000;

    setNotice("success", `${agent.name} rented for ${agent.rentPrice} Token for ${RENT_DURATION_SECONDS}s.`);
    addLog(`Rented ${agent.name} for ${agent.rentPrice} Token. Duration: ${RENT_DURATION_SECONDS}s.`);
    ensureUiTimer();
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

    if (agent.rented && getRentRemainingSeconds(agent) < task.duration) {
        setNotice("error", `${agent.name} rental expires before "${task.name}" can finish.`);
        addLog(`Task start failed: ${agent.name} has only ${getRentRemainingSeconds(agent)}s rental time left.`);
        render();
        return;
    }

    agent.status = "working";
    agent.currentTaskId = task.id;
    agent.taskEndsAt = Date.now() + task.duration * 1000;

    setNotice("info", `${agent.name} started "${task.name}". ETA: ${task.duration}s.`);
    addLog(`${agent.name} started task: ${task.name}.`);
    ensureUiTimer();
    render();

    setTimeout(() => {
        if (agent.status !== "working" || agent.currentTaskId !== task.id) {
            ensureUiTimer();
            render();
            return;
        }

        const reward = calculateReward(agent, task);
        player.token += reward;
        agent.status = "idle";
        agent.currentTaskId = null;
        agent.taskEndsAt = null;

        setNotice("success", `${agent.name} finished "${task.name}" and earned ${reward} Token.`);
        addLog(`${agent.name} completed ${task.name} and earned ${reward} Token.`);
        ensureUiTimer();
        render();
    }, task.duration * 1000);
}

function renderStatsPanel() {
    const ownedCount = getOwnedAgents().length;
    const rentedCount = getRentedAgents().length;
    const workingCount = getWorkingAgents().length;

    return `
    <section class="panel panel-highlight">
      <h2>Account Status</h2>
      <div class="stats-grid">
        <div class="stat-card">
          <span class="stat-label">Current Token</span>
          <strong class="stat-value">${player.token}</strong>
        </div>
        <div class="stat-card">
          <span class="stat-label">Owned Agents</span>
          <strong class="stat-value">${ownedCount}</strong>
        </div>
        <div class="stat-card">
          <span class="stat-label">Rented Agents</span>
          <strong class="stat-value">${rentedCount}</strong>
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
}

function renderAgentTaskText(agent, isWorking, canUse) {
    if (isWorking) {
        const currentTask = getAgentCurrentTask(agent);
        return `Current task: ${currentTask.name}, ${getTaskRemainingSeconds(agent)}s remaining`;
    }

    if (canUse) {
        return "Current task: none, ready for assignment.";
    }

    return "Current task: unavailable until unlocked.";
}

function renderAgentRentalText(agent) {
    if (agent.owned) {
        return "Ownership term: permanent.";
    }

    if (agent.rented) {
        return `Rental time left: ${getRentRemainingSeconds(agent)}s`;
    }

    return `Rental term: ${RENT_DURATION_SECONDS}s`;
}

function renderAgentCard(agent) {
    const canUse = agent.owned || agent.rented;
    const isWorking = agent.status === "working";
    const progress = getTaskProgress(agent);

    return `
      <article class="agent-card ${isWorking ? "agent-working" : ""}">
        <div class="agent-header">
          <strong>${agent.name}</strong>
          <span class="badge badge-${isWorking ? "working" : "idle"}">${statusLabels[agent.status]}</span>
        </div>
        <p>Ownership: ${getAgentOwnershipLabel(agent)}</p>
        <p>Specialty: ${specialtyLabels[agent.specialty]} | Bonus: x${agent.bonus}</p>
        <p>Buy: ${agent.buyPrice} Token | Rent: ${agent.rentPrice} Token</p>
        <p>${renderAgentRentalText(agent)}</p>
        <p class="agent-task-text">${renderAgentTaskText(agent, isWorking, canUse)}</p>
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
}

function renderAgentPanel() {
    return `
    <section class="panel">
      <h2>Agent List</h2>
      <div class="agent-list">
        ${agents.map(renderAgentCard).join("")}
      </div>
    </section>
  `;
}

function renderTaskPanel() {
    return `
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
}

function renderLogPanel() {
    return `
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

function render() {
    document.getElementById("token-panel").innerHTML = renderStatsPanel();
    document.getElementById("agent-panel").innerHTML = renderAgentPanel();
    document.getElementById("task-panel").innerHTML = renderTaskPanel();
    document.getElementById("log-panel").innerHTML = renderLogPanel();
}

render();
