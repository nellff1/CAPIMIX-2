let selectedForMatch = [];

function renderAdminLobby() {
  const container = document.getElementById("adminPlayers");
  dbPlayers.forEach(p => {
    const div = document.createElement("div");
    div.className = "player-card";
    div.innerHTML = `<span>${p.nome}</span>`;
    div.onclick = () => toggleAdminPlayer(p, div);
    container.appendChild(div);
  });
}

function toggleAdminPlayer(player, element) {
  const idx = selectedForMatch.findIndex(p => p.nome === player.nome);
  if (idx > -1) {
    selectedForMatch.splice(idx, 1);
    element.classList.remove("selected");
  } else {
    if (selectedForMatch.length >= 10) return alert("Já tem 10!");
    selectedForMatch.push(player);
    element.classList.add("selected");
  }
  
  document.getElementById("adminCount").textContent = `${selectedForMatch.length}/10 Selecionados`;
  
  if (selectedForMatch.length === 10) {
    document.getElementById("statsPanel").style.display = "block";
    renderInputTables();
  } else {
    document.getElementById("statsPanel").style.display = "none";
  }
}

function renderInputTables() {
  const bodyA = document.querySelector("#tableTimeA tbody");
  const bodyB = document.querySelector("#tableTimeB tbody");
  bodyA.innerHTML = ""; bodyB.innerHTML = "";

  selectedForMatch.forEach((p, index) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${p.nome}</td>
      <td><input type="number" id="k_${p.nome}" style="width: 50px; background: #333; color: white; border: none; padding: 5px;"></td>
      <td><input type="number" id="d_${p.nome}" style="width: 50px; background: #333; color: white; border: none; padding: 5px;"></td>
      <td><input type="number" id="r_${p.nome}" step="0.01" style="width: 60px; background: #333; color: white; border: none; padding: 5px;"></td>
    `;
    if (index < 5) bodyA.appendChild(tr);
    else bodyB.appendChild(tr);
  });
}

document.getElementById("btnGerarCodigo").addEventListener("click", () => {
  const winner = document.querySelector('input[name="winner"]:checked').value;
  
  // Fazer uma cópia profunda do banco atual
  let newDb = JSON.parse(JSON.stringify(dbPlayers));

  selectedForMatch.forEach((p, index) => {
    let kills = parseInt(document.getElementById(`k_${p.nome}`).value) || 0;
    let deaths = parseInt(document.getElementById(`d_${p.nome}`).value) || 0;
    let rating = parseFloat(document.getElementById(`r_${p.nome}`).value) || (kills/ (deaths || 1)); // Usa K/D como rating base se não preencher
    
    let isTeamA = index < 5;
    let won = (isTeamA && winner === "A") || (!isTeamA && winner === "B");

    let dbPlayer = newDb.find(dbP => dbP.nome === p.nome);
    dbPlayer.kills += kills;
    dbPlayer.deaths += deaths;
    dbPlayer.sumRating += rating;
    dbPlayer.partidas += 1;
    if(won) dbPlayer.vitorias += 1;
    else dbPlayer.derrotas += 1;
  });

  // Gerar o texto formatado
  let jsCode = `// data.js\nconst dbPlayers = [\n`;
  newDb.forEach(p => {
    jsCode += `  { nome: "${p.nome}", steamId: "${p.steamId}", lvl: ${p.lvl}, partidas: ${p.partidas}, vitorias: ${p.vitorias}, derrotas: ${p.derrotas}, kills: ${p.kills}, deaths: ${p.deaths}, sumRating: ${p.sumRating.toFixed(1)} },\n`;
  });
  jsCode += `];`;

  document.getElementById("resultPanel").style.display = "block";
  document.getElementById("codigoGerado").value = jsCode;
});

renderAdminLobby();