const player = {
    token: 100,
    ownedAgents: [],
    rentedAgents: [],
    logs: []
};

const agents = [
    {
        id: 1,
        name: "采集者",
        buyPrice: 40,
        rentPrice: 15,
        specialty: "collect",
        bonus: 1.2,
        status: "idle",
        owned: false,
        rented: false
    },
    {
        id: 2,
        name: "工匠",
        buyPrice: 55,
        rentPrice: 20,
        specialty: "craft",
        bonus: 1.25,
        status: "idle",
        owned: false,
        rented: false
    },
    {
        id: 3,
        name: "快递员",
        buyPrice: 35,
        rentPrice: 12,
        specialty: "transport",
        bonus: 1.15,
        status: "idle",
        owned: false,
        rented: false
    }
];

const tasks = [
    {
        id: 1,
        name: "采集木材",
        type: "collect",
        duration: 10,
        output: 5,
        exchangeRate: 2
    },
    {
        id: 2,
        name: "加工零件",
        type: "craft",
        duration: 15,
        output: 6,
        exchangeRate: 3
    },
    {
        id: 3,
        name: "运输货物",
        type: "transport",
        duration: 8,
        output: 4,
        exchangeRate: 2.5
    }
];

//购买agent
function buyAgent(agentId) {
    const agent = agents.find(a => a.id === agentId);
    if (!agent || agent.owned) return;

    if (player.token < agent.buyPrice) {
        alert("Token 不足，无法购买！");
        return;
    }

    player.token -= agent.buyPrice;
    agent.owned = true;
    player.ownedAgents.push(agent.id);
    player.logs.push(`购买了 ${agent.name}，花费 ${agent.buyPrice} Token`);
    render();
}

//租借agent
function rentAgent(agentId) {
    const agent = agents.find(a => a.id === agentId);
    if (!agent || agent.owned || agent.rented) return;

    if (player.token < agent.rentPrice) {
        alert("Token 不足，无法租借！");
        return;
    }

    player.token -= agent.rentPrice;
    agent.rented = true;
    player.rentedAgents.push(agent.id);
    player.logs.push(`租借了 ${agent.name}，花费 ${agent.rentPrice} Token`);
    render();
}

//计算收益
function calculateReward(agent, task) {
    let coefficient = 1.0;

    if (agent.specialty === task.type) {
        coefficient = agent.bonus;
    } else {
        coefficient = 0.85;
    }

    return Math.floor(task.output * task.exchangeRate * coefficient);
}

//开始任务
function startTask(agentId, taskId) {
    const agent = agents.find(a => a.id === agentId);
    const task = tasks.find(t => t.id === taskId);

    if (!agent || !task) return;

    const usable = agent.owned || agent.rented;
    if (!usable) {
        alert("这个 Agent 还未拥有或租借！");
        return;
    }

    if (agent.status === "working") {
        alert("该 Agent 正在工作中！");
        return;
    }

    agent.status = "working";
    player.logs.push(`${agent.name} 开始执行任务：${task.name}`);
    render();

    setTimeout(() => {
        const reward = calculateReward(agent, task);
        player.token += reward;
        agent.status = "idle";
        player.logs.push(`${agent.name} 完成任务 ${task.name}，获得 ${reward} Token`);
        render();
    }, task.duration * 1000);
}

function render() {
    document.getElementById("token-panel").innerHTML = `
    <h2>账户</h2>
    <p>当前 Token：${player.token}</p>
  `;

    document.getElementById("agent-panel").innerHTML = `
    <h2>Agent 列表</h2>
    ${agents.map(agent => `
      <div>
        <strong>${agent.name}</strong>
        <p>购买价：${agent.buyPrice} | 租金：${agent.rentPrice}</p>
        <p>擅长：${agent.specialty} | 状态：${agent.status}</p>
        <button onclick="buyAgent(${agent.id})">购买</button>
        <button onclick="rentAgent(${agent.id})">租借</button>
        <button onclick="startTask(${agent.id}, 1)">任务1</button>
        <button onclick="startTask(${agent.id}, 2)">任务2</button>
        <button onclick="startTask(${agent.id}, 3)">任务3</button>
      </div>
      <hr>
    `).join("")}
  `;

    document.getElementById("task-panel").innerHTML = `
    <h2>任务说明</h2>
    ${tasks.map(task => `
      <div>
        <strong>${task.name}</strong>
        <p>类型：${task.type} | 时长：${task.duration}s | 产出：${task.output} | 汇率：${task.exchangeRate}</p>
      </div>
    `).join("")}
  `;

    document.getElementById("log-panel").innerHTML = `
    <h2>日志</h2>
    <ul>
      ${player.logs.slice().reverse().map(log => `<li>${log}</li>`).join("")}
    </ul>
  `;
}

render();