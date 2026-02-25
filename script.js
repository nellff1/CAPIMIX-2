let selectedPlayers = [];

// Sistema de Cores por Nível
function getLvlColor(lvl) {
  if (lvl <= 3) return "var(--lvl-green)";
  if (lvl <= 7) return "var(--lvl-yellow)";
  if (lvl <= 9) return "var(--lvl-orange)";
  return "var(--lvl-red)";
}

// 1. RENDERIZAR JOGADORES NO LOBBY
function renderLobby() {
  const container = document.getElementById("playerRoster");
  container.innerHTML = "";
  
  // dbPlayers vem do arquivo data.js
  dbPlayers.forEach(p => {
    const div = document.createElement("div");
    div.className = "player-card";
    div.innerHTML = `
      <span>${p.nome}</span>
      <div class="lvl-badge" style="background: ${getLvlColor(p.lvl)}">${p.lvl}</div>
    `;
    div.onclick = () => togglePlayer(p, div);
    container.appendChild(div);
  });
}

// New function for players.html
function renderPlayersPage() {
  const playerDetailGrid = document.getElementById("playerDetailGrid");
  if (!playerDetailGrid) return; // Only run if on players.html

  playerDetailGrid.innerHTML = ""; // Clear existing content

  dbPlayers.forEach(p => {
    const card = document.createElement("div");
    card.className = "player-detail-card";

    // Calculate stats
    const kdr = p.deaths > 0 ? (p.kills / p.deaths).toFixed(2) : p.kills.toFixed(2);
    const winRate = p.partidas > 0 ? ((p.vitorias / p.partidas) * 100).toFixed(0) : 0;
    const avgRating = p.partidas > 0 ? (p.sumRating / p.partidas).toFixed(2) : 0;

    // Placeholder image - you'd replace 'placeholder_player.jpg' with actual player images
    // You might add a 'photo' property to your dbPlayers objects: { nome: "nell", ..., photo: "nell.jpg" }
    // For now, using a generic placeholder. You should create an 'images/placeholder_player.jpg'
    const imageSrc = `images/placeholder_player.jpg`; 

    card.innerHTML = `
      <div class="player-detail-header">${p.nome}</div>
      <div class="player-detail-image-container">
        <img src="${imageSrc}" alt="${p.nome}">
        <div class="player-detail-image-overlay"></div>
        <div class="player-detail-lvl-badge" style="background: ${getLvlColor(p.lvl)};">${p.lvl}</div>
      </div>
      <div class="player-detail-stats">
        <div class="stat-item"><span class="stat-label">Vitórias</span><span class="stat-value">${p.vitorias}</span></div>
        <div class="stat-item"><span class="stat-label">Derrotas</span><span class="stat-value">${p.derrotas}</span></div>
        <div class="stat-item"><span class="stat-label">Win %</span><span class="stat-value">${winRate}%</span></div>
        <div class="stat-item"><span class="stat-label">KDR</span><span class="stat-value">${kdr}</span></div>
        <div class="stat-item"><span class="stat-label">Rating 2.0</span><span class="stat-value">${avgRating}</span></div>
        <div class="stat-item"><span class="stat-label">Partidas</span><span class="stat-value">${p.partidas}</span></div>
      </div>
    `;
    playerDetailGrid.appendChild(card);
  });
}


function togglePlayer(player, element) {
  const index = selectedPlayers.findIndex(p => p.nome === player.nome);
  if (index > -1) {
    selectedPlayers.splice(index, 1);
    element.classList.remove("selected");
  } else {
    if (selectedPlayers.length >= 10) return alert("Você já selecionou 10 jogadores!");
    selectedPlayers.push(player);
    element.classList.add("selected");
  }
  
  document.getElementById("playerCount").textContent = `${selectedPlayers.length}/10 Selecionados`;
  document.getElementById("btnGerarEquipas").disabled = selectedPlayers.length !== 10;
}

// Fisher-Yates (Knuth) shuffle algorithm
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// New function to generate and render teams
function generateAndRenderTeams() {
  const teamsContainer = document.querySelector(".teams-container"); // Container principal das equipas
  const teamAList = document.getElementById("equipa1List");
  const teamBList = document.getElementById("equipa2List");

  // 1. Adiciona uma classe para iniciar a animação de fade-out do container
  teamsContainer.classList.add("teams-shuffling");

  // 2. Atrasar a geração e renderização das equipas para permitir que a animação de fade-out seja visível
  setTimeout(() => {
    let playersToDistribute = shuffleArray([...selectedPlayers]);
    let teamA = [], teamB = [];
    let sumA = 0, sumB = 0;

    // Lógica de balanceamento de equipas
    playersToDistribute.forEach(p => {
      if (sumA <= sumB && teamA.length < 5) {
        teamA.push(p);
        sumA += p.lvl;
      } else if (teamB.length < 5) {
        teamB.push(p);
        sumB += p.lvl;
      } else {
        // Caso de fallback, embora com 10 jogadores e 5 por equipa, deve ser raro
        teamA.push(p);
        sumA += p.lvl;
      }
    });

    const renderTeam = (team, elementId) => {
      const listElement = document.getElementById(elementId);
      listElement.innerHTML = team.map((p, index) => 
        // Adiciona a classe 'team-item-entry' e um 'animation-delay' inline para um efeito escalonado
        // O atraso é baseado no índice do jogador na lista
        `<li class="team-item-entry" style="animation-delay: ${index * 50}ms;">${p.nome} <span style="color: ${getLvlColor(p.lvl)}">Lvl ${p.lvl}</span></li>`
      ).join("");
    };

    renderTeam(teamA, "equipa1List");
    renderTeam(teamB, "equipa2List");

    // Remove a classe para iniciar a animação de fade-in
    teamsContainer.classList.remove("teams-shuffling");
  }, 300); // 300ms de atraso para a animação
}

// 2. GERAR EQUIPAS BALANCEADAS
document.getElementById("btnGerarEquipas").addEventListener("click", () => {
  // Garante que os painéis estão visíveis antes de iniciar a animação
  document.getElementById("teamsPanel").style.display = "block";
  document.getElementById("vetoPanel").style.display = "block";

  // First, shuffle the selected players to ensure different team compositions on reshuffle
  generateAndRenderTeams(); // Call the new function
  
  iniciarVeto();

  // Add Reshuffle button
  const teamControls = document.getElementById("teamControls");
  if (teamControls) { // Ensure the div exists
    let reshuffleBtn = document.getElementById("btnReshuffle");
    if (!reshuffleBtn) { // Create only if it doesn't exist
      reshuffleBtn = document.createElement("button");
      reshuffleBtn.id = "btnReshuffle";
      reshuffleBtn.className = "btn-primary";
      reshuffleBtn.textContent = "Reshuffle Teams";
      reshuffleBtn.style.marginRight = "10px"; // Add some spacing
      teamControls.appendChild(reshuffleBtn);
    }
    reshuffleBtn.onclick = generateAndRenderTeams; // Attach handler
  }
});

// 3. SISTEMA DE VETO DE MAPAS
const mapPool = ["Inferno", "Mirage", "Dust II", "Overpass", "Nuke", "Vertigo", "Ancient", "Anubis"];
const vetoOrder = [
  { action: "BAN", team: "Time A" },
  { action: "BAN", team: "Time B" },
  { action: "PICK", team: "Time A" }, // Team A picks a map
  { action: "PICK", team: "Time B" }, // Team B picks a map
  { action: "BAN", team: "Time A" }, { action: "BAN", team: "Time B" },
  { action: "BAN", team: "Time A" },
  { action: "SOBRA", team: "Decider" }
];
let currentVetoStep = 0;

function iniciarVeto() {
  currentVetoStep = 0;
  const container = document.getElementById("mapsGrid");
  container.innerHTML = "";
  
  mapPool.forEach(mapa => {
    const div = document.createElement("div");
    div.className = "map-card";
    div.innerHTML = `<span>${mapa}</span>`;
    div.onclick = () => processarTurnoVeto(div, mapa);
    container.appendChild(div);
  });
  atualizarStatusVeto();
}

function atualizarStatusVeto() {
  const statusEl = document.getElementById("vetoStatus");
  if (currentVetoStep >= vetoOrder.length - 1) {
    statusEl.textContent = "Veto Concluído!";
    return;
  }
  const turno = vetoOrder[currentVetoStep];
  statusEl.textContent = `Turno do ${turno.team}: ${turno.action} MAPA`;
}

function processarTurnoVeto(element, mapaNome) {
  if (element.classList.contains("banned") || element.classList.contains("picked")) return;
  
  const turno = vetoOrder[currentVetoStep];
  
  if (turno.action === "BAN") {
    element.classList.add("banned");
  } else if (turno.action === "PICK") {
    element.classList.add("picked");
  }

  currentVetoStep++;
  
  if (currentVetoStep === vetoOrder.length - 1) {
    const mapasRestantes = document.querySelectorAll(".map-card:not(.banned):not(.picked)");
    if(mapasRestantes.length > 0) mapasRestantes[0].classList.add("picked");
  }
  
  atualizarStatusVeto();
}

// New function to reset the entire application state
function resetApp() {
  // Reset selected players
  selectedPlayers = [];
  document.getElementById("playerCount").textContent = "0/10 Selecionados";
  document.getElementById("btnGerarEquipas").disabled = true;

  // Reset player cards in lobby
  document.querySelectorAll(".player-card").forEach(card => {
    card.classList.remove("selected");
  });

  // Hide panels
  document.getElementById("teamsPanel").style.display = "none";
  document.getElementById("vetoPanel").style.display = "none";

  // Clear team lists
  document.getElementById("equipa1List").innerHTML = "";
  document.getElementById("equipa2List").innerHTML = "";

  // Clear maps grid and veto status
  document.getElementById("mapsGrid").innerHTML = "";
  document.getElementById("vetoStatus").textContent = "";
  currentVetoStep = 0; // Reset veto step

  // Remove reshuffle button if it exists
  const reshuffleBtn = document.getElementById("btnReshuffle");
  if (reshuffleBtn && reshuffleBtn.parentNode) {
    reshuffleBtn.parentNode.removeChild(reshuffleBtn);
  }
}


// 4. RANKINGS (TABS)
function showTab(type, event) {
  if (event) {
    document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
    event.target.classList.add("active");
  }

  const head = document.getElementById("tableHeader");
  const body = document.getElementById("tableBody");
  
  let rankingData = [...dbPlayers]; 
  
  // Helper para formatar o rank
  const getRankHTML = (index) => {
    if (index === 0) return { cls: "rank-1", txt: "🥇 1º" };
    if (index === 1) return { cls: "rank-2", txt: "🥈 2º" };
    if (index === 2) return { cls: "rank-3", txt: "🥉 3º" };
    return { cls: "", txt: `${index + 1}º` };
  };

  if (type === 'winloss') {
    head.innerHTML = `<th>#</th><th>Jogador</th><th>Vitórias</th><th>Derrotas</th><th>Win %</th>`;
    rankingData.sort((a,b) => b.vitorias - a.vitorias);
    body.innerHTML = rankingData.map((r, i) => {
      const rank = getRankHTML(i);
      let winrate = r.vitorias + r.derrotas > 0 ? Math.round((r.vitorias/(r.vitorias+r.derrotas))*100) : 0;
      return `<tr class="${rank.cls}"><td class="rank-cell">${rank.txt}</td><td>${r.nome}</td><td>${r.vitorias}</td><td>${r.derrotas}</td><td>${winrate}%</td></tr>`;
    }).join("");
  } else if (type === 'kdr') {
    head.innerHTML = `<th>#</th><th>Jogador</th><th>KDR</th>`;
    // Calculando KDR dinamicamente se não existir na base, ou assumindo que existe (no data.js original não tem campo kdr explícito, calculamos aqui)
    rankingData.sort((a,b) => (b.kills/b.deaths) - (a.kills/a.deaths));
    body.innerHTML = rankingData.map((r, i) => {
      const rank = getRankHTML(i);
      return `<tr class="${rank.cls}"><td class="rank-cell">${rank.txt}</td><td>${r.nome}</td><td>${(r.kills/r.deaths).toFixed(2)}</td></tr>`;
    }).join("");
  } else {
    head.innerHTML = `<th>#</th><th>Jogador</th><th>Rating Médio</th>`;
    rankingData.sort((a,b) => (b.sumRating/b.partidas) - (a.sumRating/a.partidas));
    body.innerHTML = rankingData.map((r, i) => {
      const rank = getRankHTML(i);
      return `<tr class="${rank.cls}"><td class="rank-cell">${rank.txt}</td><td>${r.nome}</td><td>${(r.sumRating/r.partidas).toFixed(2)}</td></tr>`;
    }).join("");
  }
}

// Iniciar a aplicação
document.addEventListener("DOMContentLoaded", () => {
  const resetButton = document.getElementById("btnReset");

  // Logic for index.html
  if (document.getElementById("playerRoster")) {
    renderLobby();
    showTab('winloss');
    if (resetButton) {
      resetButton.addEventListener("click", resetApp); // Call specific resetApp for index.html
    }
  }
  // Logic for players.html
  else if (document.getElementById("playerDetailGrid")) { // Use else if to ensure only one branch runs
    renderPlayersPage();
    if (resetButton) {
      resetButton.addEventListener("click", () => location.reload()); // Simple reload for players.html
    }
  }
});