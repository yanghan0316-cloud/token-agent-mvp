const RENT_DURATION_SECONDS = 30;
const AGENT_CREATION_COST = 40;
const PLATFORM_FEE_RATIO = 0.5;
let currentLanguage = "en";

const i18n = {
    en: {
        appTitle: "Token Agent Flow Simulator",
        languageChanged: "Language switched to English.",
        languageChangedLog: "Language switched to English.",
        systemReady: "System ready. Buy or rent an agent, then assign a task.",
        sections: {
            account: "Account Status",
            guide: "How to Play",
            create: "Create Agent",
            platform: "Platform Revenue",
            agents: "Agent List",
            market: "Player-Created Agent Market",
            offers: "Client Offers",
            tasks: "Task Overview",
            logs: "Activity Log"
        },
        stats: {
            token: "Current Token",
            owned: "Owned Agents",
            rented: "Rented Agents",
            activeTasks: "Active Tasks",
            created: "Created Agents",
            listings: "Market Listings",
            platformRevenue: "Accumulated Platform Revenue",
            pendingOffers: "Pending Client Offers"
        },
        guide: [
            {
                title: "1. Unlock Agents",
                text: "Use Token to buy or rent official system agents. Official agents can run tasks, but cannot be sold or rented out."
            },
            {
                title: "2. Create Your Own",
                text: `Spend ${AGENT_CREATION_COST} Token to create a player-owned agent. Created agents can run tasks and enter the player market.`
            },
            {
                title: "3. List and Trade",
                text: "List player-created agents for sale or rent, generate client offers, then accept or reject each deal."
            },
            {
                title: "4. Split Revenue",
                text: "When a deal closes, the platform takes 50% and the player receives 50%. Sale deals remove the agent; rental deals only settle once."
            }
        ],
        specialty: {
            collect: "Collect",
            craft: "Craft",
            transport: "Transport"
        },
        status: {
            idle: "Idle",
            working: "Working"
        },
        source: {
            system: "System",
            userCreated: "Player Created"
        },
        ownership: {
            playerOwned: "Player-owned",
            owned: "Owned",
            rented: "Rented",
            locked: "Locked"
        },
        actions: {
            buy: "Buy",
            rent: "Rent",
            rentFromSystem: "Rent from System",
            createAgent: "Create Agent",
            listForSale: "List for Sale",
            listForRent: "List for Rent",
            generateOffer: "Generate Random Offer",
            accept: "Accept",
            reject: "Reject",
            english: "EN",
            chinese: "中文"
        },
        labels: {
            statusMessage: "Status Message",
            agentName: "Agent Name",
            agentType: "Agent Type",
            status: "Status",
            source: "Source",
            ownership: "Ownership",
            specialty: "Specialty",
            bonus: "Bonus",
            buy: "Buy",
            rent: "Rent",
            creator: "Creator",
            listing: "Listing",
            marketRights: "Market Rights",
            noSell: "No Sell",
            noRentOut: "No Rent Out",
            sell: "Sell",
            rentOut: "Rent Out",
            type: "Type",
            salePrice: "Sale Price",
            rentPrice: "Rent Price",
            targetAgent: "Target Agent",
            preferredType: "Preferred Type",
            offerPrice: "Offer Price",
            duration: "Duration",
            output: "Output",
            rate: "Rate",
            player: "Player",
            unknown: "Unknown"
        },
        createDescription: `Create a player-owned agent for ${AGENT_CREATION_COST} Token. New agents can run tasks and enter the client market.`,
        createPlaceholder: "e.g. River Runner",
        currentTaskWorking: (taskName, seconds) => `Current task: ${taskName}, ${seconds}s remaining`,
        currentTaskReady: "Current task: none, ready for assignment.",
        currentTaskUnavailable: "Current task: unavailable until unlocked.",
        permanentOwnership: "Ownership term: permanent.",
        rentalLeft: seconds => `Rental time left: ${seconds}s`,
        rentalTerm: seconds => `Rental term: ${seconds}s`,
        listingSelling: price => `Selling at ${price} Token`,
        listingRenting: price => `Renting at ${price} Token`,
        listingNone: "Not listed",
        marketHintBusy: "Finish the current task before changing this listing.",
        marketHintReady: "Set a price to list this agent for sale or for rent.",
        noCreatedAgents: "No player-created agents yet. Create one to open the market.",
        noOffers: "No client offers yet. List a player-created agent and generate an offer.",
        offerTargetUnavailable: "Target agent is unavailable. Reject to clear this offer.",
        offerAgentBusy: name => `${name} is busy. Accept after the task finishes.`,
        offerReady: "Ready for a player decision.",
        offerListingChanged: "Listing changed. Reject to clear this expired offer.",
        noLogs: "No logs yet. Your first action will appear here.",
        clientAction: {
            buy: "Buy",
            rent: "Rent"
        },
        agentNames: {
            1: "Collector",
            2: "Crafter",
            3: "Courier"
        },
        taskNames: {
            1: "Gather Wood",
            2: "Assemble Parts",
            3: "Deliver Cargo"
        },
        notices: {
            rentalExpired: names => `${names} rental expired.`,
            buyNotSystem: name => `${name} is player-created and cannot be bought from the system.`,
            buyNoToken: (name, price, token) => `Not enough Token to buy ${name}.`,
            buySuccess: (name, price) => `${name} purchased for ${price} Token.`,
            rentNotSystem: name => `${name} cannot be rented from the system.`,
            rentNoToken: name => `Not enough Token to rent ${name}.`,
            rentSuccess: (name, price, seconds) => `${name} rented for ${price} Token for ${seconds}s.`,
            taskLocked: name => `${name} is locked. Buy or rent first.`,
            taskBusy: name => `${name} is already working.`,
            taskRentTooShort: (name, taskName) => `${name} rental expires before "${taskName}" can finish.`,
            taskStarted: (name, taskName, seconds) => `${name} started "${taskName}". ETA: ${seconds}s.`,
            taskFinished: (name, taskName, reward) => `${name} finished "${taskName}" and earned ${reward} Token.`,
            createMissingName: "Create Agent failed: please enter an agent name.",
            createInvalidType: "Create Agent failed: invalid agent type.",
            createNoToken: name => `Not enough Token to create ${name}.`,
            createSuccess: name => `${name} created for ${AGENT_CREATION_COST} Token.`,
            saleNotAllowed: name => `${name} cannot be listed for sale.`,
            rentOutNotAllowed: name => `${name} cannot be listed for rent.`,
            listingBusy: name => `${name} is busy and cannot change listing right now.`,
            saleInvalidPrice: name => `Please enter a valid sale price for ${name}.`,
            rentInvalidPrice: name => `Please enter a valid rental price for ${name}.`,
            saleListed: (name, price) => `${name} is now listed for sale at ${price} Token.`,
            rentListed: (name, price) => `${name} is now listed for rent at ${price} Token.`,
            noListedAgent: "No player-created agent is currently listed for sale or rent.",
            listedAgentsBusy: "All listed agents are busy. Wait for their tasks to finish before generating offers.",
            offerGenerated: (client, price, action, name) => `${client} offered ${price} Token to ${action} ${name}.`,
            offerTargetGone: client => `${client}'s offer expired because the target agent is no longer available.`,
            acceptBusy: name => `${name} is busy. Finish the current task before accepting offers.`,
            offerExpired: (client, name, action) => `${client}'s offer expired because ${name} is no longer listed for ${action}.`,
            sold: (name, client, playerShare, platformShare) => `${name} sold to ${client}. Player +${playerShare} Token, platform +${platformShare} Token.`,
            rentedToClient: (client, name, playerShare, platformShare) => `${client} rented ${name}. Player +${playerShare} Token, platform +${platformShare} Token.`,
            rejected: (client, name) => `${client}'s offer for ${name} was rejected.`
        }
    },
    zh: {
        appTitle: "Token 与 Agent 流通模拟系统",
        languageChanged: "语言已切换为中文。",
        languageChangedLog: "语言切换为中文。",
        systemReady: "系统已就绪。购买或租借 Agent 后即可分配任务。",
        sections: {
            account: "账户状态",
            guide: "玩法说明",
            create: "创建 Agent",
            platform: "平台收入",
            agents: "Agent 列表",
            market: "用户自建 Agent 市场",
            offers: "客户报价",
            tasks: "任务概览",
            logs: "活动日志"
        },
        stats: {
            token: "当前 Token",
            owned: "已拥有 Agent",
            rented: "租借中 Agent",
            activeTasks: "进行中任务",
            created: "自建 Agent",
            listings: "挂牌数量",
            platformRevenue: "平台累计收入",
            pendingOffers: "待处理客户报价"
        },
        guide: [
            {
                title: "1. 解锁官方 Agent",
                text: "使用 Token 购买或从系统租借官方 Agent。官方 Agent 可以执行任务，但不能被出售或出租给客户。"
            },
            {
                title: "2. 创建自建 Agent",
                text: `花费 ${AGENT_CREATION_COST} Token 创建玩家自己的 Agent。自建 Agent 可以执行任务，也可以进入玩家市场。`
            },
            {
                title: "3. 挂牌并处理报价",
                text: "将自建 Agent 挂牌出售或出租，生成随机客户报价，然后选择接受或拒绝。"
            },
            {
                title: "4. 成交后分账",
                text: "每次成交平台抽取 50%，玩家获得 50%。出售会移除 Agent，出租只结算一次收益。"
            }
        ],
        specialty: {
            collect: "采集",
            craft: "制造",
            transport: "运输"
        },
        status: {
            idle: "空闲",
            working: "工作中"
        },
        source: {
            system: "官方",
            userCreated: "玩家自建"
        },
        ownership: {
            playerOwned: "玩家拥有",
            owned: "已拥有",
            rented: "租借中",
            locked: "未解锁"
        },
        actions: {
            buy: "购买",
            rent: "租借",
            rentFromSystem: "从系统租借",
            createAgent: "创建 Agent",
            listForSale: "挂牌出售",
            listForRent: "挂牌出租",
            generateOffer: "生成随机报价",
            accept: "接受",
            reject: "拒绝",
            english: "EN",
            chinese: "中文"
        },
        labels: {
            statusMessage: "状态提示",
            agentName: "Agent 名称",
            agentType: "Agent 类型",
            status: "状态",
            source: "来源",
            ownership: "归属",
            specialty: "专长",
            bonus: "加成",
            buy: "购买",
            rent: "租借",
            creator: "创建者",
            listing: "挂牌状态",
            marketRights: "市场权限",
            noSell: "不可出售",
            noRentOut: "不可出租",
            sell: "可出售",
            rentOut: "可出租",
            type: "类型",
            salePrice: "出售价格",
            rentPrice: "出租价格",
            targetAgent: "目标 Agent",
            preferredType: "偏好类型",
            offerPrice: "报价金额",
            duration: "耗时",
            output: "产出",
            rate: "汇率",
            player: "玩家",
            unknown: "未知"
        },
        createDescription: `花费 ${AGENT_CREATION_COST} Token 创建一个玩家拥有的 Agent。新 Agent 可以执行任务，并进入客户市场。`,
        createPlaceholder: "例如：河道搬运员",
        currentTaskWorking: (taskName, seconds) => `当前任务：${taskName}，剩余 ${seconds} 秒`,
        currentTaskReady: "当前任务：无，可分配任务。",
        currentTaskUnavailable: "当前任务：未解锁，暂不可用。",
        permanentOwnership: "拥有期限：永久。",
        rentalLeft: seconds => `租借剩余时间：${seconds} 秒`,
        rentalTerm: seconds => `租借期限：${seconds} 秒`,
        listingSelling: price => `出售中，价格 ${price} Token`,
        listingRenting: price => `出租中，价格 ${price} Token`,
        listingNone: "未挂牌",
        marketHintBusy: "当前任务结束后才能修改挂牌。",
        marketHintReady: "设置价格后，可以将该 Agent 挂牌出售或出租。",
        noCreatedAgents: "还没有自建 Agent。先创建一个来开启市场。",
        noOffers: "暂无客户报价。先挂牌一个自建 Agent，再生成报价。",
        offerTargetUnavailable: "目标 Agent 不可用。拒绝可清除此报价。",
        offerAgentBusy: name => `${name} 正在工作。任务结束后可接受报价。`,
        offerReady: "可以做出玩家决策。",
        offerListingChanged: "挂牌状态已变化。拒绝可清除此过期报价。",
        noLogs: "暂无日志。你的第一次操作会显示在这里。",
        clientAction: {
            buy: "购买",
            rent: "租借"
        },
        agentNames: {
            1: "采集者",
            2: "制造者",
            3: "运输员"
        },
        taskNames: {
            1: "采集木材",
            2: "组装零件",
            3: "运输货物"
        },
        notices: {
            rentalExpired: names => `${names} 的租借已到期。`,
            buyNotSystem: name => `${name} 是玩家自建 Agent，不能从系统购买。`,
            buyNoToken: name => `Token 不足，无法购买 ${name}。`,
            buySuccess: (name, price) => `${name} 已以 ${price} Token 购买成功。`,
            rentNotSystem: name => `${name} 不能从系统租借。`,
            rentNoToken: name => `Token 不足，无法租借 ${name}。`,
            rentSuccess: (name, price, seconds) => `${name} 已以 ${price} Token 租借 ${seconds} 秒。`,
            taskLocked: name => `${name} 尚未解锁。请先购买或租借。`,
            taskBusy: name => `${name} 已经在工作中。`,
            taskRentTooShort: (name, taskName) => `${name} 的租借时间不足，无法完成“${taskName}”。`,
            taskStarted: (name, taskName, seconds) => `${name} 已开始“${taskName}”。预计 ${seconds} 秒。`,
            taskFinished: (name, taskName, reward) => `${name} 完成“${taskName}”，获得 ${reward} Token。`,
            createMissingName: "创建失败：请输入 Agent 名称。",
            createInvalidType: "创建失败：Agent 类型无效。",
            createNoToken: name => `Token 不足，无法创建 ${name}。`,
            createSuccess: name => `${name} 创建成功，花费 ${AGENT_CREATION_COST} Token。`,
            saleNotAllowed: name => `${name} 不能挂牌出售。`,
            rentOutNotAllowed: name => `${name} 不能挂牌出租。`,
            listingBusy: name => `${name} 正在工作，暂时不能修改挂牌。`,
            saleInvalidPrice: name => `请输入 ${name} 的有效出售价格。`,
            rentInvalidPrice: name => `请输入 ${name} 的有效出租价格。`,
            saleListed: (name, price) => `${name} 已以 ${price} Token 挂牌出售。`,
            rentListed: (name, price) => `${name} 已以 ${price} Token 挂牌出租。`,
            noListedAgent: "当前没有已挂牌的自建 Agent。",
            listedAgentsBusy: "所有已挂牌 Agent 都在工作中。请等待任务完成后再生成报价。",
            offerGenerated: (client, price, action, name) => `${client} 出价 ${price} Token，想要${action} ${name}。`,
            offerTargetGone: client => `${client} 的报价已过期：目标 Agent 已不可用。`,
            acceptBusy: name => `${name} 正在工作。请在任务完成后再接受报价。`,
            offerExpired: (client, name, action) => `${client} 的报价已过期：${name} 已不再挂牌${action}。`,
            sold: (name, client, playerShare, platformShare) => `${name} 已出售给 ${client}。玩家 +${playerShare} Token，平台 +${platformShare} Token。`,
            rentedToClient: (client, name, playerShare, platformShare) => `${client} 租借了 ${name}。玩家 +${playerShare} Token，平台 +${platformShare} Token。`,
            rejected: (client, name) => `已拒绝 ${client} 对 ${name} 的报价。`
        }
    }
};

const player = {
    token: 100,
    platformRevenue: 0,
    createdAgents: [],
    logs: [],
    notice: {
        type: "info",
        text: i18n.en.systemReady
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

const defaultAgentBonuses = {
    collect: 1.2,
    craft: 1.25,
    transport: 1.15
};

const uiState = {
    createAgentName: "",
    createAgentType: "collect",
    salePrices: {},
    rentPrices: {}
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
        rentEndsAt: null,
        source: "system",
        canSell: false,
        canRentOut: false,
        creator: null,
        listingStatus: "none",
        listingPrice: null
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
        rentEndsAt: null,
        source: "system",
        canSell: false,
        canRentOut: false,
        creator: null,
        listingStatus: "none",
        listingPrice: null
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
        rentEndsAt: null,
        source: "system",
        canSell: false,
        canRentOut: false,
        creator: null,
        listingStatus: "none",
        listingPrice: null
    }
];

const clients = [];

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

let nextAgentId = Math.max(...agents.map(agent => agent.id)) + 1;
let nextClientId = 1;
let uiTimer = null;

function escapeHtml(value) {
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

function formatToken(amount) {
    const normalized = Math.round(amount * 10) / 10;
    return Number.isInteger(normalized) ? String(normalized) : normalized.toFixed(1);
}

function setNotice(type, text) {
    player.notice = { type, text };
}

function addLog(text) {
    const time = new Date().toLocaleTimeString("en-GB", {
        hour12: false
    });
    player.logs.push(`[${time}] ${text}`);
}

function text() {
    return i18n[currentLanguage];
}

function getSpecialtyLabel(type) {
    return text().specialty[type] || type;
}

function getStatusLabel(status) {
    return text().status[status] || status;
}

function getTaskDisplayName(task) {
    return text().taskNames[task.id] || task.name;
}

function getAgentDisplayName(agent) {
    if (agent.source === "system") {
        return text().agentNames[agent.id] || agent.name;
    }

    return agent.name;
}

function getClientActionLabel(action) {
    return text().clientAction[action] || action;
}

function switchLanguage(language) {
    captureUiState();
    currentLanguage = language;
    setNotice("info", text().languageChanged);
    addLog(text().languageChangedLog);
    render(false);
}

function captureUiState() {
    const createNameInput = document.getElementById("create-agent-name");
    if (createNameInput) {
        uiState.createAgentName = createNameInput.value;
    }

    const createTypeInput = document.getElementById("create-agent-type");
    if (createTypeInput) {
        uiState.createAgentType = createTypeInput.value;
    }

    document.querySelectorAll("[data-sale-price-for]").forEach(input => {
        uiState.salePrices[input.dataset.salePriceFor] = input.value;
    });

    document.querySelectorAll("[data-rent-price-for]").forEach(input => {
        uiState.rentPrices[input.dataset.rentPriceFor] = input.value;
    });
}

function isValidSpecialty(type) {
    return Object.prototype.hasOwnProperty.call(specialtyLabels, type);
}

function normalizePrice(rawValue) {
    const parsedValue = Math.floor(Number(rawValue));
    if (!Number.isFinite(parsedValue) || parsedValue <= 0) {
        return null;
    }
    return parsedValue;
}

function getAgentById(agentId) {
    return agents.find(agent => agent.id === agentId) || null;
}

function getClientById(clientId) {
    return clients.find(client => client.id === clientId) || null;
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

function getCreatedAgents() {
    return agents.filter(agent => agent.source === "userCreated");
}

function getListedCreatedAgents() {
    return agents.filter(agent => (
        agent.source === "userCreated"
        && agent.owned
        && agent.listingStatus !== "none"
    ));
}

function getOfferEligibleAgents() {
    return getListedCreatedAgents().filter(agent => agent.status === "idle");
}

function getAgentOwnershipLabel(agent) {
    if (agent.source === "userCreated") {
        return text().ownership.playerOwned;
    }
    if (agent.owned) {
        return text().ownership.owned;
    }
    if (agent.rented) {
        return text().ownership.rented;
    }
    return text().ownership.locked;
}

function getAgentSourceLabel(agent) {
    return text().source[agent.source] || agent.source;
}

function getListingLabel(agent) {
    if (agent.listingStatus === "selling" && agent.listingPrice !== null) {
        return text().listingSelling(formatToken(agent.listingPrice));
    }

    if (agent.listingStatus === "renting" && agent.listingPrice !== null) {
        return text().listingRenting(formatToken(agent.listingPrice));
    }

    return text().listingNone;
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

function clearDraftPrices(agentId) {
    delete uiState.salePrices[agentId];
    delete uiState.rentPrices[agentId];
}

function clearListing(agent) {
    agent.listingStatus = "none";
    agent.listingPrice = null;
    clearDraftPrices(agent.id);
}

function removeClientById(clientId) {
    const index = clients.findIndex(client => client.id === clientId);
    if (index === -1) {
        return null;
    }

    return clients.splice(index, 1)[0];
}

function removeClientOffersForAgent(agentId, excludedClientId = null) {
    let removedCount = 0;

    for (let index = clients.length - 1; index >= 0; index -= 1) {
        const client = clients[index];
        if (client.targetAgentId === agentId && client.id !== excludedClientId) {
            clients.splice(index, 1);
            removedCount += 1;
        }
    }

    return removedCount;
}

function releaseExpiredRentals() {
    const expiredAgents = agents.filter(agent => agent.rented && getRentRemainingSeconds(agent) === 0);

    expiredAgents.forEach(agent => {
        const agentName = getAgentDisplayName(agent);
        agent.rented = false;
        agent.rentEndsAt = null;

        if (agent.status === "working") {
            agent.status = "idle";
            agent.currentTaskId = null;
            agent.taskEndsAt = null;
        }

        addLog(currentLanguage === "zh" ? `${agentName} 的租借已到期。` : `Rental expired for ${agentName}.`);
    });

    if (expiredAgents.length > 0) {
        setNotice("warning", text().notices.rentalExpired(expiredAgents.map(getAgentDisplayName).join(", ")));
    }
}

function ensureUiTimer() {
    const hasTimedState = agents.some(agent => agent.status === "working" || agent.rented);

    if (hasTimedState && !uiTimer) {
        uiTimer = setInterval(() => {
            releaseExpiredRentals();
            render(true, { skipCreatePanel: true });
        }, 1000);
    }

    if (!hasTimedState && uiTimer) {
        clearInterval(uiTimer);
        uiTimer = null;
    }
}

function buyAgent(agentId) {
    captureUiState();
    const agent = getAgentById(agentId);
    if (!agent || agent.owned) {
        return;
    }

    const agentName = getAgentDisplayName(agent);
    if (agent.source !== "system") {
        setNotice("error", text().notices.buyNotSystem(agentName));
        addLog(currentLanguage === "zh" ? `购买失败：${agentName} 不是官方 Agent。` : `Buy failed: ${agentName} is not a system agent.`);
        render();
        return;
    }

    if (player.token < agent.buyPrice) {
        setNotice("error", text().notices.buyNoToken(agentName, formatToken(agent.buyPrice), formatToken(player.token)));
        addLog(currentLanguage === "zh" ? `购买失败：${agentName} 需要 ${formatToken(agent.buyPrice)} Token，当前余额 ${formatToken(player.token)}。` : `Buy failed: ${agentName} costs ${formatToken(agent.buyPrice)} Token, current balance is ${formatToken(player.token)}.`);
        render();
        return;
    }

    player.token -= agent.buyPrice;
    agent.owned = true;
    agent.rented = false;
    agent.rentEndsAt = null;

    setNotice("success", text().notices.buySuccess(agentName, formatToken(agent.buyPrice)));
    addLog(currentLanguage === "zh" ? `已购买 ${agentName}，花费 ${formatToken(agent.buyPrice)} Token。` : `Bought ${agentName} for ${formatToken(agent.buyPrice)} Token.`);
    ensureUiTimer();
    render();
}

function rentAgent(agentId) {
    captureUiState();
    const agent = getAgentById(agentId);
    if (!agent || agent.owned || agent.rented) {
        return;
    }

    const agentName = getAgentDisplayName(agent);
    if (agent.source !== "system") {
        setNotice("error", text().notices.rentNotSystem(agentName));
        addLog(currentLanguage === "zh" ? `租借失败：${agentName} 不是官方 Agent。` : `Rent failed: ${agentName} is not a system agent.`);
        render();
        return;
    }

    if (player.token < agent.rentPrice) {
        setNotice("error", text().notices.rentNoToken(agentName));
        addLog(currentLanguage === "zh" ? `租借失败：${agentName} 需要 ${formatToken(agent.rentPrice)} Token，当前余额 ${formatToken(player.token)}。` : `Rent failed: ${agentName} costs ${formatToken(agent.rentPrice)} Token, current balance is ${formatToken(player.token)}.`);
        render();
        return;
    }

    player.token -= agent.rentPrice;
    agent.rented = true;
    agent.rentEndsAt = Date.now() + RENT_DURATION_SECONDS * 1000;

    setNotice("success", text().notices.rentSuccess(agentName, formatToken(agent.rentPrice), RENT_DURATION_SECONDS));
    addLog(currentLanguage === "zh" ? `已租借 ${agentName}，花费 ${formatToken(agent.rentPrice)} Token，时长 ${RENT_DURATION_SECONDS} 秒。` : `Rented ${agentName} for ${formatToken(agent.rentPrice)} Token. Duration: ${RENT_DURATION_SECONDS}s.`);
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
    captureUiState();
    const agent = getAgentById(agentId);
    const task = tasks.find(item => item.id === taskId);

    if (!agent || !task) {
        return;
    }

    const agentName = getAgentDisplayName(agent);
    const taskName = getTaskDisplayName(task);
    const usable = agent.owned || agent.rented;
    if (!usable) {
        setNotice("error", text().notices.taskLocked(agentName));
        addLog(currentLanguage === "zh" ? `任务启动失败：${agentName} 尚不可用。` : `Task start failed: ${agentName} is not available yet.`);
        render();
        return;
    }

    if (agent.status === "working") {
        setNotice("warning", text().notices.taskBusy(agentName));
        addLog(currentLanguage === "zh" ? `任务启动受阻：${agentName} 正忙。` : `Task start blocked: ${agentName} is busy.`);
        render();
        return;
    }

    if (agent.rented && getRentRemainingSeconds(agent) < task.duration) {
        setNotice("error", text().notices.taskRentTooShort(agentName, taskName));
        addLog(currentLanguage === "zh" ? `任务启动失败：${agentName} 只剩 ${getRentRemainingSeconds(agent)} 秒租借时间。` : `Task start failed: ${agentName} has only ${getRentRemainingSeconds(agent)}s rental time left.`);
        render();
        return;
    }

    agent.status = "working";
    agent.currentTaskId = task.id;
    agent.taskEndsAt = Date.now() + task.duration * 1000;

    setNotice("info", text().notices.taskStarted(agentName, taskName, task.duration));
    addLog(currentLanguage === "zh" ? `${agentName} 开始任务：${taskName}。` : `${agentName} started task: ${taskName}.`);
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

        const latestAgentName = getAgentDisplayName(agent);
        const latestTaskName = getTaskDisplayName(task);
        setNotice("success", text().notices.taskFinished(latestAgentName, latestTaskName, formatToken(reward)));
        addLog(currentLanguage === "zh" ? `${latestAgentName} 完成 ${latestTaskName}，获得 ${formatToken(reward)} Token。` : `${latestAgentName} completed ${latestTaskName} and earned ${formatToken(reward)} Token.`);
        ensureUiTimer();
        render();
    }, task.duration * 1000);
}

function createAgent(name, type) {
    captureUiState();
    const trimmedName = String(name || "").trim();

    if (!trimmedName) {
        setNotice("error", text().notices.createMissingName);
        addLog(currentLanguage === "zh" ? "创建失败：缺少 Agent 名称。" : "Create Agent failed: missing agent name.");
        render();
        return;
    }

    if (!isValidSpecialty(type)) {
        setNotice("error", text().notices.createInvalidType);
        addLog(currentLanguage === "zh" ? `创建失败：无效类型“${type}”。` : `Create Agent failed: invalid type "${type}".`);
        render();
        return;
    }

    if (player.token < AGENT_CREATION_COST) {
        setNotice("error", text().notices.createNoToken(trimmedName));
        addLog(currentLanguage === "zh" ? `创建失败：${trimmedName} 需要 ${AGENT_CREATION_COST} Token，当前余额 ${formatToken(player.token)}。` : `Create Agent failed: ${trimmedName} needs ${AGENT_CREATION_COST} Token, current balance is ${formatToken(player.token)}.`);
        render();
        return;
    }

    const newAgent = {
        id: nextAgentId,
        name: trimmedName,
        buyPrice: null,
        rentPrice: null,
        specialty: type,
        bonus: defaultAgentBonuses[type],
        status: "idle",
        owned: true,
        rented: false,
        currentTaskId: null,
        taskEndsAt: null,
        rentEndsAt: null,
        source: "userCreated",
        canSell: true,
        canRentOut: true,
        creator: "player",
        listingStatus: "none",
        listingPrice: null
    };

    nextAgentId += 1;
    player.token -= AGENT_CREATION_COST;
    agents.push(newAgent);
    player.createdAgents.push(newAgent.id);
    uiState.createAgentName = "";

    setNotice("success", text().notices.createSuccess(newAgent.name));
    addLog(currentLanguage === "zh" ? `创建 ${newAgent.name}（${getSpecialtyLabel(type)}），花费 ${AGENT_CREATION_COST} Token。` : `Created ${newAgent.name} (${getSpecialtyLabel(type)}) for ${AGENT_CREATION_COST} Token.`);
    ensureUiTimer();
    render(false);
}

function listAgentForSale(agentId, price) {
    captureUiState();
    const agent = getAgentById(agentId);
    if (!agent) {
        return;
    }

    const normalizedPrice = normalizePrice(price);
    const agentName = getAgentDisplayName(agent);

    if (agent.source !== "userCreated" || !agent.canSell) {
        setNotice("error", text().notices.saleNotAllowed(agentName));
        addLog(currentLanguage === "zh" ? `挂牌出售失败：${agentName} 不是可出售的自建 Agent。` : `List for sale failed: ${agentName} is not a sellable player-created agent.`);
        render();
        return;
    }

    if (agent.status === "working") {
        setNotice("warning", text().notices.listingBusy(agentName));
        addLog(currentLanguage === "zh" ? `挂牌出售受阻：${agentName} 正在工作。` : `List for sale blocked: ${agentName} is currently working.`);
        render();
        return;
    }

    if (!normalizedPrice) {
        setNotice("error", text().notices.saleInvalidPrice(agentName));
        addLog(currentLanguage === "zh" ? `挂牌出售失败：${agentName} 的价格无效。` : `List for sale failed: invalid price entered for ${agentName}.`);
        render();
        return;
    }

    const removedOffers = removeClientOffersForAgent(agent.id);
    agent.listingStatus = "selling";
    agent.listingPrice = normalizedPrice;
    uiState.salePrices[agent.id] = String(normalizedPrice);
    delete uiState.rentPrices[agent.id];

    setNotice("success", text().notices.saleListed(agentName, formatToken(normalizedPrice)));
    addLog(currentLanguage === "zh" ? `已将 ${agentName} 以 ${formatToken(normalizedPrice)} Token 挂牌出售。${removedOffers ? `已清除 ${removedOffers} 个旧报价。` : ""}` : `Listed ${agentName} for sale at ${formatToken(normalizedPrice)} Token.${removedOffers ? ` Cleared ${removedOffers} old offer(s).` : ""}`);
    render(false);
}

function listAgentForRent(agentId, price) {
    captureUiState();
    const agent = getAgentById(agentId);
    if (!agent) {
        return;
    }

    const normalizedPrice = normalizePrice(price);
    const agentName = getAgentDisplayName(agent);

    if (agent.source !== "userCreated" || !agent.canRentOut) {
        setNotice("error", text().notices.rentOutNotAllowed(agentName));
        addLog(currentLanguage === "zh" ? `挂牌出租失败：${agentName} 不是可出租的自建 Agent。` : `List for rent failed: ${agentName} is not a rentable player-created agent.`);
        render();
        return;
    }

    if (agent.status === "working") {
        setNotice("warning", text().notices.listingBusy(agentName));
        addLog(currentLanguage === "zh" ? `挂牌出租受阻：${agentName} 正在工作。` : `List for rent blocked: ${agentName} is currently working.`);
        render();
        return;
    }

    if (!normalizedPrice) {
        setNotice("error", text().notices.rentInvalidPrice(agentName));
        addLog(currentLanguage === "zh" ? `挂牌出租失败：${agentName} 的价格无效。` : `List for rent failed: invalid price entered for ${agentName}.`);
        render();
        return;
    }

    const removedOffers = removeClientOffersForAgent(agent.id);
    agent.listingStatus = "renting";
    agent.listingPrice = normalizedPrice;
    uiState.rentPrices[agent.id] = String(normalizedPrice);
    delete uiState.salePrices[agent.id];

    setNotice("success", text().notices.rentListed(agentName, formatToken(normalizedPrice)));
    addLog(currentLanguage === "zh" ? `已将 ${agentName} 以 ${formatToken(normalizedPrice)} Token 挂牌出租。${removedOffers ? `已清除 ${removedOffers} 个旧报价。` : ""}` : `Listed ${agentName} for rent at ${formatToken(normalizedPrice)} Token.${removedOffers ? ` Cleared ${removedOffers} old offer(s).` : ""}`);
    render(false);
}

function generateRandomClientOffer() {
    captureUiState();
    const listedAgents = getListedCreatedAgents();
    const eligibleAgents = getOfferEligibleAgents();

    if (listedAgents.length === 0) {
        setNotice("warning", text().notices.noListedAgent);
        addLog(currentLanguage === "zh" ? "生成报价失败：没有已挂牌的自建 Agent。" : "Generate offer failed: there is no listed player-created agent.");
        render();
        return;
    }

    if (eligibleAgents.length === 0) {
        setNotice("warning", text().notices.listedAgentsBusy);
        addLog(currentLanguage === "zh" ? "生成报价受阻：已挂牌 Agent 都在工作中。" : "Generate offer blocked: listed agents are currently busy.");
        render();
        return;
    }

    const targetAgent = eligibleAgents[Math.floor(Math.random() * eligibleAgents.length)];
    const multiplier = 0.8 + Math.random() * 0.4;
    const offerPrice = Math.max(1, Math.round(targetAgent.listingPrice * multiplier));
    const clientId = nextClientId;
    const client = {
        id: clientId,
        name: `Client_${String(clientId).padStart(2, "0")}`,
        action: targetAgent.listingStatus === "selling" ? "buy" : "rent",
        preferredType: targetAgent.specialty,
        offerPrice,
        targetAgentId: targetAgent.id
    };

    nextClientId += 1;
    clients.push(client);

    const agentName = getAgentDisplayName(targetAgent);
    const actionLabel = getClientActionLabel(client.action).toLowerCase();
    setNotice("info", text().notices.offerGenerated(client.name, formatToken(offerPrice), actionLabel, agentName));
    addLog(currentLanguage === "zh" ? `${client.name} 出价 ${formatToken(offerPrice)} Token，想要${actionLabel} ${agentName}。` : `${client.name} offered ${formatToken(offerPrice)} Token to ${actionLabel} ${agentName}.`);
    render();
}

function acceptOffer(clientId) {
    captureUiState();
    const client = getClientById(clientId);
    if (!client) {
        return;
    }

    const agent = getAgentById(client.targetAgentId);
    if (!agent) {
        removeClientById(clientId);
        setNotice("warning", text().notices.offerTargetGone(client.name));
        addLog(currentLanguage === "zh" ? `报价已过期：${client.name} 的目标 Agent 不可用。` : `Offer expired: ${client.name} targeted an unavailable agent.`);
        render();
        return;
    }

    const agentName = getAgentDisplayName(agent);
    if (agent.status === "working") {
        setNotice("warning", text().notices.acceptBusy(agentName));
        addLog(currentLanguage === "zh" ? `接受报价受阻：${agentName} 正在工作。` : `Accept offer blocked: ${agentName} is currently working.`);
        render();
        return;
    }

    const expectedListingStatus = client.action === "buy" ? "selling" : "renting";
    if (agent.listingStatus !== expectedListingStatus) {
        removeClientById(clientId);
        setNotice("warning", text().notices.offerExpired(client.name, agentName, getClientActionLabel(client.action)));
        addLog(currentLanguage === "zh" ? `报价已过期：${client.name} 的${getClientActionLabel(client.action)}报价不再匹配 ${agentName} 的挂牌。` : `Offer expired: ${client.name}'s ${client.action} offer no longer matches ${agentName}'s listing.`);
        render();
        return;
    }

    const playerShare = client.offerPrice * (1 - PLATFORM_FEE_RATIO);
    const platformShare = client.offerPrice * PLATFORM_FEE_RATIO;
    const clearedCompetingOffers = removeClientOffersForAgent(agent.id, client.id);

    player.token += playerShare;
    player.platformRevenue += platformShare;
    removeClientById(clientId);

    if (client.action === "buy") {
        const agentIndex = agents.findIndex(item => item.id === agent.id);
        if (agentIndex !== -1) {
            agents.splice(agentIndex, 1);
        }
        player.createdAgents = player.createdAgents.filter(id => id !== agent.id);
        clearDraftPrices(agent.id);

        setNotice("success", text().notices.sold(agentName, client.name, formatToken(playerShare), formatToken(platformShare)));
        addLog(currentLanguage === "zh" ? `接受 ${client.name} 对 ${agentName} 的出售报价。玩家获得 ${formatToken(playerShare)} Token，平台获得 ${formatToken(platformShare)} Token。${clearedCompetingOffers ? `已清除 ${clearedCompetingOffers} 个竞争报价。` : ""}` : `Accepted sale offer from ${client.name} for ${agentName}. Player received ${formatToken(playerShare)} Token, platform received ${formatToken(platformShare)} Token.${clearedCompetingOffers ? ` Cleared ${clearedCompetingOffers} competing offer(s).` : ""}`);
    } else {
        clearListing(agent);

        setNotice("success", text().notices.rentedToClient(client.name, agentName, formatToken(playerShare), formatToken(platformShare)));
        addLog(currentLanguage === "zh" ? `接受 ${client.name} 对 ${agentName} 的出租报价。玩家获得 ${formatToken(playerShare)} Token，平台获得 ${formatToken(platformShare)} Token。${clearedCompetingOffers ? `已清除 ${clearedCompetingOffers} 个竞争报价。` : ""}` : `Accepted rental offer from ${client.name} for ${agentName}. Player received ${formatToken(playerShare)} Token, platform received ${formatToken(platformShare)} Token.${clearedCompetingOffers ? ` Cleared ${clearedCompetingOffers} competing offer(s).` : ""}`);
    }

    ensureUiTimer();
    render(false);
}

function rejectOffer(clientId) {
    captureUiState();
    const client = getClientById(clientId);
    if (!client) {
        return;
    }

    const targetAgent = getAgentById(client.targetAgentId);
    removeClientById(clientId);

    const agentName = targetAgent ? getAgentDisplayName(targetAgent) : (currentLanguage === "zh" ? "不可用的 Agent" : "the unavailable agent");
    setNotice("warning", text().notices.rejected(client.name, agentName));
    addLog(currentLanguage === "zh" ? `已拒绝 ${client.name} 对 ${agentName} 的${getClientActionLabel(client.action)}报价。` : `Rejected ${client.action} offer from ${client.name} for ${agentName}.`);
    render();
}

function handleCreateAgent() {
    captureUiState();
    createAgent(uiState.createAgentName, uiState.createAgentType);
}

function handleListAgentForSale(agentId) {
    captureUiState();
    listAgentForSale(agentId, uiState.salePrices[agentId]);
}

function handleListAgentForRent(agentId) {
    captureUiState();
    listAgentForRent(agentId, uiState.rentPrices[agentId]);
}

function renderLanguagePanel() {
    return `
      <div class="language-switch" aria-label="Language switch">
        <button onclick="switchLanguage('en')" class="${currentLanguage === "en" ? "active" : ""}">${text().actions.english}</button>
        <button onclick="switchLanguage('zh')" class="${currentLanguage === "zh" ? "active" : ""}">${text().actions.chinese}</button>
      </div>
    `;
}

function renderGuidePanel() {
    return `
    <section class="panel">
      <h2>${text().sections.guide}</h2>
      <div class="guide-list">
        ${text().guide.map(item => `
          <article class="guide-card">
            <strong>${escapeHtml(item.title)}</strong>
            <p>${escapeHtml(item.text)}</p>
          </article>
        `).join("")}
      </div>
    </section>
  `;
}

function renderStatsPanel() {
    const ownedCount = getOwnedAgents().length;
    const rentedCount = getRentedAgents().length;
    const workingCount = getWorkingAgents().length;
    const createdCount = getCreatedAgents().length;
    const listedCount = getListedCreatedAgents().length;

    return `
    <section class="panel panel-highlight">
      <h2>${text().sections.account}</h2>
      <div class="stats-grid">
        <div class="stat-card">
          <span class="stat-label">${text().stats.token}</span>
          <strong class="stat-value">${formatToken(player.token)}</strong>
        </div>
        <div class="stat-card">
          <span class="stat-label">${text().stats.owned}</span>
          <strong class="stat-value">${ownedCount}</strong>
        </div>
        <div class="stat-card">
          <span class="stat-label">${text().stats.rented}</span>
          <strong class="stat-value">${rentedCount}</strong>
        </div>
        <div class="stat-card">
          <span class="stat-label">${text().stats.activeTasks}</span>
          <strong class="stat-value">${workingCount}</strong>
        </div>
        <div class="stat-card">
          <span class="stat-label">${text().stats.created}</span>
          <strong class="stat-value">${createdCount}</strong>
        </div>
        <div class="stat-card">
          <span class="stat-label">${text().stats.listings}</span>
          <strong class="stat-value">${listedCount}</strong>
        </div>
      </div>
      <div class="notice notice-${player.notice.type}">
        <span class="notice-label">${text().labels.statusMessage}</span>
        <p>${escapeHtml(player.notice.text)}</p>
      </div>
    </section>
  `;
}

function renderPlatformPanel() {
    return `
    <section class="panel">
      <h2>${text().sections.platform}</h2>
      <div class="stats-grid">
        <div class="stat-card">
          <span class="stat-label">${text().stats.platformRevenue}</span>
          <strong class="stat-value">${formatToken(player.platformRevenue)}</strong>
        </div>
        <div class="stat-card">
          <span class="stat-label">${text().stats.pendingOffers}</span>
          <strong class="stat-value">${clients.length}</strong>
        </div>
      </div>
    </section>
  `;
}

function renderCreatePanel() {
    return `
    <section class="panel">
      <h2>${text().sections.create}</h2>
      <div class="create-card">
        <p>${text().createDescription}</p>
        <div class="form-grid">
          <div class="form-field">
            <label for="create-agent-name">${text().labels.agentName}</label>
            <input id="create-agent-name" type="text" maxlength="24" placeholder="${escapeHtml(text().createPlaceholder)}" value="${escapeHtml(uiState.createAgentName)}" />
          </div>
          <div class="form-field">
            <label for="create-agent-type">${text().labels.agentType}</label>
            <select id="create-agent-type">
              <option value="collect" ${uiState.createAgentType === "collect" ? "selected" : ""}>${getSpecialtyLabel("collect")}</option>
              <option value="craft" ${uiState.createAgentType === "craft" ? "selected" : ""}>${getSpecialtyLabel("craft")}</option>
              <option value="transport" ${uiState.createAgentType === "transport" ? "selected" : ""}>${getSpecialtyLabel("transport")}</option>
            </select>
          </div>
          <div class="form-field">
            <button onclick="handleCreateAgent()" ${player.token < AGENT_CREATION_COST ? "disabled" : ""}>${text().actions.createAgent}</button>
          </div>
        </div>
      </div>
    </section>
  `;
}

function renderAgentTaskText(agent, isWorking, canUse) {
    if (isWorking) {
        const currentTask = getAgentCurrentTask(agent);
        return text().currentTaskWorking(getTaskDisplayName(currentTask), getTaskRemainingSeconds(agent));
    }

    if (canUse) {
        return text().currentTaskReady;
    }

    return text().currentTaskUnavailable;
}

function renderAgentRentalText(agent) {
    if (agent.source === "userCreated") {
        return `${text().labels.creator}: ${agent.creator === "player" ? text().labels.player : text().labels.unknown} | ${text().labels.listing}: ${getListingLabel(agent)}.`;
    }

    if (agent.owned) {
        return text().permanentOwnership;
    }

    if (agent.rented) {
        return text().rentalLeft(getRentRemainingSeconds(agent));
    }

    return text().rentalTerm(RENT_DURATION_SECONDS);
}

function renderTaskButtons(agent, canUse, isWorking) {
    return tasks.map(task => {
        const disabled = !canUse || isWorking || (agent.rented && getRentRemainingSeconds(agent) < task.duration);
        return `
          <button onclick="startTask(${agent.id}, ${task.id})" ${disabled ? "disabled" : ""}>
            ${escapeHtml(getTaskDisplayName(task))}
          </button>
        `;
    }).join("");
}

function renderAgentCard(agent) {
    const canUse = agent.owned || agent.rented;
    const isWorking = agent.status === "working";
    const progress = getTaskProgress(agent);
    const buyDisabled = agent.owned || player.token < agent.buyPrice;
    const rentDisabled = agent.owned || agent.rented || player.token < agent.rentPrice;

    return `
      <article class="agent-card ${isWorking ? "agent-working" : ""}">
        <div class="agent-header">
          <strong>${escapeHtml(getAgentDisplayName(agent))}</strong>
          <span class="badge badge-${isWorking ? "working" : "idle"}">${getStatusLabel(agent.status)}</span>
        </div>
        <p>${text().labels.source}: ${getAgentSourceLabel(agent)} | ${text().labels.ownership}: ${getAgentOwnershipLabel(agent)}</p>
        <p>${text().labels.specialty}: ${getSpecialtyLabel(agent.specialty)} | ${text().labels.bonus}: x${agent.bonus}</p>
        <p>${agent.source === "system"
            ? `${text().labels.buy}: ${formatToken(agent.buyPrice)} Token | ${text().labels.rent}: ${formatToken(agent.rentPrice)} Token`
            : `${text().labels.marketRights}: ${agent.canSell ? text().labels.sell : text().labels.noSell} / ${agent.canRentOut ? text().labels.rentOut : text().labels.noRentOut}`
        }</p>
        <p>${renderAgentRentalText(agent)}</p>
        <p class="agent-task-text">${escapeHtml(renderAgentTaskText(agent, isWorking, canUse))}</p>
        <div class="progress-wrap ${isWorking ? "" : "progress-hidden"}">
          <div class="progress-bar">
            <div class="progress-fill" style="width: ${progress}%"></div>
          </div>
          <span class="progress-text">${progress}%</span>
        </div>
        <div class="button-row">
          ${agent.source === "system" ? `<button onclick="buyAgent(${agent.id})" ${buyDisabled ? "disabled" : ""}>${text().actions.buy}</button>` : ""}
          ${agent.source === "system" ? `<button onclick="rentAgent(${agent.id})" ${rentDisabled ? "disabled" : ""}>${text().actions.rentFromSystem}</button>` : ""}
          ${renderTaskButtons(agent, canUse, isWorking)}
        </div>
      </article>
    `;
}

function renderAgentPanel() {
    return `
    <section class="panel">
      <h2>${text().sections.agents}</h2>
      <div class="agent-list">
        ${agents.map(renderAgentCard).join("")}
      </div>
    </section>
  `;
}

function renderMarketCard(agent) {
    const saleValue = uiState.salePrices[agent.id] !== undefined
        ? uiState.salePrices[agent.id]
        : agent.listingStatus === "selling" && agent.listingPrice !== null
            ? String(agent.listingPrice)
            : "";
    const rentValue = uiState.rentPrices[agent.id] !== undefined
        ? uiState.rentPrices[agent.id]
        : agent.listingStatus === "renting" && agent.listingPrice !== null
            ? String(agent.listingPrice)
            : "";
    const listingLocked = agent.status === "working";

    return `
      <article class="market-card ${listingLocked ? "agent-working" : ""}">
        <div class="agent-header">
          <strong>${escapeHtml(getAgentDisplayName(agent))}</strong>
          <span class="badge badge-${agent.status === "working" ? "working" : "idle"}">${getStatusLabel(agent.status)}</span>
        </div>
        <p>${text().labels.type}: ${getSpecialtyLabel(agent.specialty)}</p>
        <p>${text().labels.status}: ${getStatusLabel(agent.status)}</p>
        <p>${text().labels.listing}: ${getListingLabel(agent)}</p>
        <p class="muted-text">${listingLocked ? text().marketHintBusy : text().marketHintReady}</p>
        <div class="market-actions">
          <div class="form-field">
            <label for="sale-price-${agent.id}">${text().labels.salePrice}</label>
            <div class="input-row">
              <input id="sale-price-${agent.id}" data-sale-price-for="${agent.id}" type="number" min="1" step="1" value="${escapeHtml(saleValue)}" />
              <button onclick="handleListAgentForSale(${agent.id})" ${listingLocked ? "disabled" : ""}>${text().actions.listForSale}</button>
            </div>
          </div>
          <div class="form-field">
            <label for="rent-price-${agent.id}">${text().labels.rentPrice}</label>
            <div class="input-row">
              <input id="rent-price-${agent.id}" data-rent-price-for="${agent.id}" type="number" min="1" step="1" value="${escapeHtml(rentValue)}" />
              <button onclick="handleListAgentForRent(${agent.id})" ${listingLocked ? "disabled" : ""}>${text().actions.listForRent}</button>
            </div>
          </div>
        </div>
      </article>
    `;
}

function renderMarketPanel() {
    const createdAgents = getCreatedAgents();

    return `
    <section class="panel">
      <h2>${text().sections.market}</h2>
      ${createdAgents.length
          ? `<div class="market-list">${createdAgents.map(renderMarketCard).join("")}</div>`
          : `<p class="empty-state">${text().noCreatedAgents}</p>`}
    </section>
  `;
}

function renderOfferCard(client) {
    const targetAgent = getAgentById(client.targetAgentId);
    const agentBusy = targetAgent ? targetAgent.status === "working" : false;
    const listingMatches = targetAgent
        ? targetAgent.listingStatus === (client.action === "buy" ? "selling" : "renting")
        : false;
    const acceptDisabled = !targetAgent || agentBusy || !listingMatches;
    const targetName = targetAgent ? getAgentDisplayName(targetAgent) : (currentLanguage === "zh" ? "不可用 Agent" : "Unavailable Agent");

    return `
      <article class="offer-card ${acceptDisabled ? "offer-card-muted" : ""}">
        <div class="agent-header">
          <strong>${escapeHtml(client.name)}</strong>
          <span class="badge badge-idle">${getClientActionLabel(client.action)}</span>
        </div>
        <p>${text().labels.targetAgent}: ${escapeHtml(targetName)}</p>
        <p>${text().labels.preferredType}: ${getSpecialtyLabel(client.preferredType)}</p>
        <p>${text().labels.offerPrice}: ${formatToken(client.offerPrice)} Token</p>
        <p class="muted-text">${!targetAgent
            ? text().offerTargetUnavailable
            : agentBusy
                ? text().offerAgentBusy(getAgentDisplayName(targetAgent))
                : listingMatches
                    ? text().offerReady
                    : text().offerListingChanged}</p>
        <div class="button-row">
          <button onclick="acceptOffer(${client.id})" ${acceptDisabled ? "disabled" : ""}>${text().actions.accept}</button>
          <button onclick="rejectOffer(${client.id})">${text().actions.reject}</button>
        </div>
      </article>
    `;
}

function renderOfferPanel() {
    return `
    <section class="panel">
      <div class="panel-header">
        <h2>${text().sections.offers}</h2>
        <button onclick="generateRandomClientOffer()" ${getOfferEligibleAgents().length === 0 ? "disabled" : ""}>${text().actions.generateOffer}</button>
      </div>
      ${clients.length
          ? `<div class="offer-list">${clients.map(renderOfferCard).join("")}</div>`
          : `<p class="empty-state">${text().noOffers}</p>`}
    </section>
  `;
}

function renderTaskPanel() {
    return `
    <section class="panel">
      <h2>${text().sections.tasks}</h2>
      <div class="task-list">
        ${tasks.map(task => `
          <article class="task-card">
            <strong>${escapeHtml(getTaskDisplayName(task))}</strong>
            <p>${text().labels.type}: ${getSpecialtyLabel(task.type)}</p>
            <p>${text().labels.duration}: ${task.duration}s</p>
            <p>${text().labels.output}: ${task.output} | ${text().labels.rate}: ${task.exchangeRate}</p>
          </article>
        `).join("")}
      </div>
    </section>
  `;
}

function renderLogPanel() {
    return `
    <section class="panel">
      <h2>${text().sections.logs}</h2>
      <ul class="log-list">
        ${player.logs.length
            ? player.logs.slice().reverse().map(log => `<li>${escapeHtml(log)}</li>`).join("")
            : `<li>${text().noLogs}</li>`}
      </ul>
    </section>
  `;
}

function render(shouldCaptureUiState = true, options = {}) {
    if (shouldCaptureUiState) {
        captureUiState();
    }

    document.title = text().appTitle;
    document.documentElement.lang = currentLanguage === "zh" ? "zh-CN" : "en";
    document.getElementById("app-title").textContent = text().appTitle;
    document.getElementById("language-panel").innerHTML = renderLanguagePanel();
    document.getElementById("token-panel").innerHTML = renderStatsPanel();
    document.getElementById("guide-panel").innerHTML = renderGuidePanel();
    if (!options.skipCreatePanel) {
        document.getElementById("create-panel").innerHTML = renderCreatePanel();
    }
    document.getElementById("platform-panel").innerHTML = renderPlatformPanel();
    document.getElementById("agent-panel").innerHTML = renderAgentPanel();
    document.getElementById("market-panel").innerHTML = renderMarketPanel();
    document.getElementById("offer-panel").innerHTML = renderOfferPanel();
    document.getElementById("task-panel").innerHTML = renderTaskPanel();
    document.getElementById("log-panel").innerHTML = renderLogPanel();
}

render();
