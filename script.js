const RENT_DURATION_SECONDS = 30;
const AGENT_CREATION_COST = 40;
const PLATFORM_FEE_RATIO = 0.5;

const player = {
    token: 100,
    platformRevenue: 0,
    createdAgents: [],
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
        return "Player-owned";
    }
    if (agent.owned) {
        return "Owned";
    }
    if (agent.rented) {
        return "Rented";
    }
    return "Locked";
}

function getAgentSourceLabel(agent) {
    return agent.source === "system" ? "System" : "Player Created";
}

function getListingLabel(agent) {
    if (agent.listingStatus === "selling" && agent.listingPrice !== null) {
        return `Selling at ${formatToken(agent.listingPrice)} Token`;
    }

    if (agent.listingStatus === "renting" && agent.listingPrice !== null) {
        return `Renting at ${formatToken(agent.listingPrice)} Token`;
    }

    return "Not listed";
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

    if (agent.source !== "system") {
        setNotice("error", `${agent.name} is player-created and cannot be bought from the system.`);
        addLog(`Buy failed: ${agent.name} is not a system agent.`);
        render();
        return;
    }

    if (player.token < agent.buyPrice) {
        setNotice("error", `Not enough Token to buy ${agent.name}.`);
        addLog(`Buy failed: ${agent.name} costs ${formatToken(agent.buyPrice)} Token, current balance is ${formatToken(player.token)}.`);
        render();
        return;
    }

    player.token -= agent.buyPrice;
    agent.owned = true;
    agent.rented = false;
    agent.rentEndsAt = null;

    setNotice("success", `${agent.name} purchased for ${formatToken(agent.buyPrice)} Token.`);
    addLog(`Bought ${agent.name} for ${formatToken(agent.buyPrice)} Token.`);
    ensureUiTimer();
    render();
}

function rentAgent(agentId) {
    captureUiState();
    const agent = getAgentById(agentId);
    if (!agent || agent.owned || agent.rented) {
        return;
    }

    if (agent.source !== "system") {
        setNotice("error", `${agent.name} cannot be rented from the system.`);
        addLog(`Rent failed: ${agent.name} is not a system agent.`);
        render();
        return;
    }

    if (player.token < agent.rentPrice) {
        setNotice("error", `Not enough Token to rent ${agent.name}.`);
        addLog(`Rent failed: ${agent.name} costs ${formatToken(agent.rentPrice)} Token, current balance is ${formatToken(player.token)}.`);
        render();
        return;
    }

    player.token -= agent.rentPrice;
    agent.rented = true;
    agent.rentEndsAt = Date.now() + RENT_DURATION_SECONDS * 1000;

    setNotice("success", `${agent.name} rented for ${formatToken(agent.rentPrice)} Token for ${RENT_DURATION_SECONDS}s.`);
    addLog(`Rented ${agent.name} for ${formatToken(agent.rentPrice)} Token. Duration: ${RENT_DURATION_SECONDS}s.`);
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

        setNotice("success", `${agent.name} finished "${task.name}" and earned ${formatToken(reward)} Token.`);
        addLog(`${agent.name} completed ${task.name} and earned ${formatToken(reward)} Token.`);
        ensureUiTimer();
        render();
    }, task.duration * 1000);
}

function createAgent(name, type) {
    captureUiState();
    const trimmedName = String(name || "").trim();

    if (!trimmedName) {
        setNotice("error", "Create Agent failed: please enter an agent name.");
        addLog("Create Agent failed: missing agent name.");
        render();
        return;
    }

    if (!isValidSpecialty(type)) {
        setNotice("error", "Create Agent failed: invalid agent type.");
        addLog(`Create Agent failed: invalid type "${type}".`);
        render();
        return;
    }

    if (player.token < AGENT_CREATION_COST) {
        setNotice("error", `Not enough Token to create ${trimmedName}.`);
        addLog(`Create Agent failed: ${trimmedName} needs ${AGENT_CREATION_COST} Token, current balance is ${formatToken(player.token)}.`);
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

    setNotice("success", `${newAgent.name} created for ${AGENT_CREATION_COST} Token.`);
    addLog(`Created ${newAgent.name} (${specialtyLabels[type]}) for ${AGENT_CREATION_COST} Token.`);
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

    if (agent.source !== "userCreated" || !agent.canSell) {
        setNotice("error", `${agent.name} cannot be listed for sale.`);
        addLog(`List for sale failed: ${agent.name} is not a sellable player-created agent.`);
        render();
        return;
    }

    if (agent.status === "working") {
        setNotice("warning", `${agent.name} is busy and cannot change listing right now.`);
        addLog(`List for sale blocked: ${agent.name} is currently working.`);
        render();
        return;
    }

    if (!normalizedPrice) {
        setNotice("error", `Please enter a valid sale price for ${agent.name}.`);
        addLog(`List for sale failed: invalid price entered for ${agent.name}.`);
        render();
        return;
    }

    const removedOffers = removeClientOffersForAgent(agent.id);
    agent.listingStatus = "selling";
    agent.listingPrice = normalizedPrice;
    uiState.salePrices[agent.id] = String(normalizedPrice);
    delete uiState.rentPrices[agent.id];

    setNotice("success", `${agent.name} is now listed for sale at ${formatToken(normalizedPrice)} Token.`);
    addLog(`Listed ${agent.name} for sale at ${formatToken(normalizedPrice)} Token.${removedOffers ? ` Cleared ${removedOffers} old offer(s).` : ""}`);
    render(false);
}

function listAgentForRent(agentId, price) {
    captureUiState();
    const agent = getAgentById(agentId);
    if (!agent) {
        return;
    }

    const normalizedPrice = normalizePrice(price);

    if (agent.source !== "userCreated" || !agent.canRentOut) {
        setNotice("error", `${agent.name} cannot be listed for rent.`);
        addLog(`List for rent failed: ${agent.name} is not a rentable player-created agent.`);
        render();
        return;
    }

    if (agent.status === "working") {
        setNotice("warning", `${agent.name} is busy and cannot change listing right now.`);
        addLog(`List for rent blocked: ${agent.name} is currently working.`);
        render();
        return;
    }

    if (!normalizedPrice) {
        setNotice("error", `Please enter a valid rental price for ${agent.name}.`);
        addLog(`List for rent failed: invalid price entered for ${agent.name}.`);
        render();
        return;
    }

    const removedOffers = removeClientOffersForAgent(agent.id);
    agent.listingStatus = "renting";
    agent.listingPrice = normalizedPrice;
    uiState.rentPrices[agent.id] = String(normalizedPrice);
    delete uiState.salePrices[agent.id];

    setNotice("success", `${agent.name} is now listed for rent at ${formatToken(normalizedPrice)} Token.`);
    addLog(`Listed ${agent.name} for rent at ${formatToken(normalizedPrice)} Token.${removedOffers ? ` Cleared ${removedOffers} old offer(s).` : ""}`);
    render(false);
}

function generateRandomClientOffer() {
    captureUiState();
    const listedAgents = getListedCreatedAgents();
    const eligibleAgents = getOfferEligibleAgents();

    if (listedAgents.length === 0) {
        setNotice("warning", "No player-created agent is currently listed for sale or rent.");
        addLog("Generate offer failed: there is no listed player-created agent.");
        render();
        return;
    }

    if (eligibleAgents.length === 0) {
        setNotice("warning", "All listed agents are busy. Wait for their tasks to finish before generating offers.");
        addLog("Generate offer blocked: listed agents are currently busy.");
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

    setNotice("info", `${client.name} offered ${formatToken(offerPrice)} Token to ${client.action} ${targetAgent.name}.`);
    addLog(`${client.name} offered ${formatToken(offerPrice)} Token to ${client.action} ${targetAgent.name}.`);
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
        setNotice("warning", `${client.name}'s offer expired because the target agent is no longer available.`);
        addLog(`Offer expired: ${client.name} targeted an unavailable agent.`);
        render();
        return;
    }

    if (agent.status === "working") {
        setNotice("warning", `${agent.name} is busy. Finish the current task before accepting offers.`);
        addLog(`Accept offer blocked: ${agent.name} is currently working.`);
        render();
        return;
    }

    const expectedListingStatus = client.action === "buy" ? "selling" : "renting";
    if (agent.listingStatus !== expectedListingStatus) {
        removeClientById(clientId);
        setNotice("warning", `${client.name}'s offer expired because ${agent.name} is no longer listed for ${client.action}.`);
        addLog(`Offer expired: ${client.name}'s ${client.action} offer no longer matches ${agent.name}'s listing.`);
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

        setNotice("success", `${agent.name} sold to ${client.name}. Player +${formatToken(playerShare)} Token, platform +${formatToken(platformShare)} Token.`);
        addLog(`Accepted sale offer from ${client.name} for ${agent.name}. Player received ${formatToken(playerShare)} Token, platform received ${formatToken(platformShare)} Token.${clearedCompetingOffers ? ` Cleared ${clearedCompetingOffers} competing offer(s).` : ""}`);
    } else {
        clearListing(agent);

        setNotice("success", `${client.name} rented ${agent.name}. Player +${formatToken(playerShare)} Token, platform +${formatToken(platformShare)} Token.`);
        addLog(`Accepted rental offer from ${client.name} for ${agent.name}. Player received ${formatToken(playerShare)} Token, platform received ${formatToken(platformShare)} Token.${clearedCompetingOffers ? ` Cleared ${clearedCompetingOffers} competing offer(s).` : ""}`);
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

    const agentName = targetAgent ? targetAgent.name : "the unavailable agent";
    setNotice("warning", `${client.name}'s offer for ${agentName} was rejected.`);
    addLog(`Rejected ${client.action} offer from ${client.name} for ${agentName}.`);
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

function renderStatsPanel() {
    const ownedCount = getOwnedAgents().length;
    const rentedCount = getRentedAgents().length;
    const workingCount = getWorkingAgents().length;
    const createdCount = getCreatedAgents().length;
    const listedCount = getListedCreatedAgents().length;

    return `
    <section class="panel panel-highlight">
      <h2>Account Status</h2>
      <div class="stats-grid">
        <div class="stat-card">
          <span class="stat-label">Current Token</span>
          <strong class="stat-value">${formatToken(player.token)}</strong>
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
        <div class="stat-card">
          <span class="stat-label">Created Agents</span>
          <strong class="stat-value">${createdCount}</strong>
        </div>
        <div class="stat-card">
          <span class="stat-label">Market Listings</span>
          <strong class="stat-value">${listedCount}</strong>
        </div>
      </div>
      <div class="notice notice-${player.notice.type}">
        <span class="notice-label">Status Message</span>
        <p>${escapeHtml(player.notice.text)}</p>
      </div>
    </section>
  `;
}

function renderPlatformPanel() {
    return `
    <section class="panel">
      <h2>Platform Revenue</h2>
      <div class="stats-grid">
        <div class="stat-card">
          <span class="stat-label">Accumulated Platform Revenue</span>
          <strong class="stat-value">${formatToken(player.platformRevenue)}</strong>
        </div>
        <div class="stat-card">
          <span class="stat-label">Pending Client Offers</span>
          <strong class="stat-value">${clients.length}</strong>
        </div>
      </div>
    </section>
  `;
}

function renderCreatePanel() {
    return `
    <section class="panel">
      <h2>Create Agent</h2>
      <div class="create-card">
        <p>Create a player-owned agent for ${AGENT_CREATION_COST} Token. New agents can run tasks and enter the client market.</p>
        <div class="form-grid">
          <div class="form-field">
            <label for="create-agent-name">Agent Name</label>
            <input id="create-agent-name" type="text" maxlength="24" placeholder="e.g. River Runner" value="${escapeHtml(uiState.createAgentName)}" />
          </div>
          <div class="form-field">
            <label for="create-agent-type">Agent Type</label>
            <select id="create-agent-type">
              <option value="collect" ${uiState.createAgentType === "collect" ? "selected" : ""}>Collect</option>
              <option value="craft" ${uiState.createAgentType === "craft" ? "selected" : ""}>Craft</option>
              <option value="transport" ${uiState.createAgentType === "transport" ? "selected" : ""}>Transport</option>
            </select>
          </div>
          <div class="form-field">
            <button onclick="handleCreateAgent()" ${player.token < AGENT_CREATION_COST ? "disabled" : ""}>Create Agent</button>
          </div>
        </div>
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
    if (agent.source === "userCreated") {
        return `Creator: ${agent.creator === "player" ? "Player" : "Unknown"} | Listing: ${getListingLabel(agent)}.`;
    }

    if (agent.owned) {
        return "Ownership term: permanent.";
    }

    if (agent.rented) {
        return `Rental time left: ${getRentRemainingSeconds(agent)}s`;
    }

    return `Rental term: ${RENT_DURATION_SECONDS}s`;
}

function renderTaskButtons(agent, canUse, isWorking) {
    return tasks.map(task => {
        const disabled = !canUse || isWorking || (agent.rented && getRentRemainingSeconds(agent) < task.duration);
        return `
          <button onclick="startTask(${agent.id}, ${task.id})" ${disabled ? "disabled" : ""}>
            ${escapeHtml(task.name)}
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
          <strong>${escapeHtml(agent.name)}</strong>
          <span class="badge badge-${isWorking ? "working" : "idle"}">${statusLabels[agent.status]}</span>
        </div>
        <p>Source: ${getAgentSourceLabel(agent)} | Ownership: ${getAgentOwnershipLabel(agent)}</p>
        <p>Specialty: ${specialtyLabels[agent.specialty]} | Bonus: x${agent.bonus}</p>
        <p>${agent.source === "system"
            ? `Buy: ${formatToken(agent.buyPrice)} Token | Rent: ${formatToken(agent.rentPrice)} Token`
            : `Market Rights: ${agent.canSell ? "Sell" : "No Sell"} / ${agent.canRentOut ? "Rent Out" : "No Rent Out"}`
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
          ${agent.source === "system" ? `<button onclick="buyAgent(${agent.id})" ${buyDisabled ? "disabled" : ""}>Buy</button>` : ""}
          ${agent.source === "system" ? `<button onclick="rentAgent(${agent.id})" ${rentDisabled ? "disabled" : ""}>Rent from System</button>` : ""}
          ${renderTaskButtons(agent, canUse, isWorking)}
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
          <strong>${escapeHtml(agent.name)}</strong>
          <span class="badge badge-${agent.status === "working" ? "working" : "idle"}">${statusLabels[agent.status]}</span>
        </div>
        <p>Type: ${specialtyLabels[agent.specialty]}</p>
        <p>Status: ${statusLabels[agent.status]}</p>
        <p>Listing: ${getListingLabel(agent)}</p>
        <p class="muted-text">${listingLocked ? "Finish the current task before changing this listing." : "Set a price to list this agent for sale or for rent."}</p>
        <div class="market-actions">
          <div class="form-field">
            <label for="sale-price-${agent.id}">Sale Price</label>
            <div class="input-row">
              <input id="sale-price-${agent.id}" data-sale-price-for="${agent.id}" type="number" min="1" step="1" value="${escapeHtml(saleValue)}" />
              <button onclick="handleListAgentForSale(${agent.id})" ${listingLocked ? "disabled" : ""}>List for Sale</button>
            </div>
          </div>
          <div class="form-field">
            <label for="rent-price-${agent.id}">Rent Price</label>
            <div class="input-row">
              <input id="rent-price-${agent.id}" data-rent-price-for="${agent.id}" type="number" min="1" step="1" value="${escapeHtml(rentValue)}" />
              <button onclick="handleListAgentForRent(${agent.id})" ${listingLocked ? "disabled" : ""}>List for Rent</button>
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
      <h2>Player-Created Agent Market</h2>
      ${createdAgents.length
          ? `<div class="market-list">${createdAgents.map(renderMarketCard).join("")}</div>`
          : '<p class="empty-state">No player-created agents yet. Create one to open the market.</p>'}
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
    const targetName = targetAgent ? targetAgent.name : "Unavailable Agent";

    return `
      <article class="offer-card ${acceptDisabled ? "offer-card-muted" : ""}">
        <div class="agent-header">
          <strong>${escapeHtml(client.name)}</strong>
          <span class="badge badge-idle">${client.action === "buy" ? "Buy" : "Rent"}</span>
        </div>
        <p>Target Agent: ${escapeHtml(targetName)}</p>
        <p>Preferred Type: ${specialtyLabels[client.preferredType]}</p>
        <p>Offer Price: ${formatToken(client.offerPrice)} Token</p>
        <p class="muted-text">${!targetAgent
            ? "Target agent is unavailable. Reject to clear this offer."
            : agentBusy
                ? `${targetAgent.name} is busy. Accept after the task finishes.`
                : listingMatches
                    ? "Ready for a player decision."
                    : "Listing changed. Reject to clear this expired offer."}</p>
        <div class="button-row">
          <button onclick="acceptOffer(${client.id})" ${acceptDisabled ? "disabled" : ""}>Accept</button>
          <button onclick="rejectOffer(${client.id})">Reject</button>
        </div>
      </article>
    `;
}

function renderOfferPanel() {
    return `
    <section class="panel">
      <div class="panel-header">
        <h2>Client Offers</h2>
        <button onclick="generateRandomClientOffer()" ${getOfferEligibleAgents().length === 0 ? "disabled" : ""}>Generate Random Offer</button>
      </div>
      ${clients.length
          ? `<div class="offer-list">${clients.map(renderOfferCard).join("")}</div>`
          : '<p class="empty-state">No client offers yet. List a player-created agent and generate an offer.</p>'}
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
            <strong>${escapeHtml(task.name)}</strong>
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
            ? player.logs.slice().reverse().map(log => `<li>${escapeHtml(log)}</li>`).join("")
            : "<li>No logs yet. Your first action will appear here.</li>"}
      </ul>
    </section>
  `;
}

function render(shouldCaptureUiState = true, options = {}) {
    if (shouldCaptureUiState) {
        captureUiState();
    }

    document.getElementById("token-panel").innerHTML = renderStatsPanel();
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
