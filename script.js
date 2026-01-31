let players = [];
let currentRound = 1;
let maxRounds = 10;
let gameData = [];

function addPlayer() {
    const input = document.getElementById('playerName');
    const name = input.value.trim();
    
    if (name) {
        players.push(name);
        input.value = '';
        updatePlayersList();
    }
}

function updatePlayersList() {
    const list = document.getElementById('playersList');
    list.innerHTML = '<h3>Players:</h3>';
    players.forEach((player, index) => {
        list.innerHTML += `<div>${index + 1}. ${player} <button onclick="removePlayer(${index})" style="background-color: #dc3545; padding: 4px 8px;">Remove</button></div>`;
    });
}

function removePlayer(index) {
    players.splice(index, 1);
    updatePlayersList();
}

function startGame() {
    if (players.length < 2) {
        alert('Please add at least 2 players!');
        return;
    }
    
    // Initialize game data
    gameData = players.map(player => ({
        name: player,
        rounds: []
    }));
    
    currentRound = 1;
    document.getElementById('setup').style.display = 'none';
    document.getElementById('game').style.display = 'block';
    
    renderScoreTable();
}

function renderScoreTable() {
    const container = document.getElementById('scoreTable');
    let html = '<table>';
    
    // Header
    html += '<tr><th>Round</th>';
    players.forEach(player => {
        html += `<th colspan="3">${player}</th>`;
    });
    html += '</tr>';
    
    html += '<tr><th></th>';
    players.forEach(() => {
        html += '<th>Bid</th><th>Tricks</th><th>Score</th>';
    });
    html += '</tr>';
    
    // Rounds
    for (let round = 1; round <= currentRound; round++) {
        html += `<tr><td class="round-header">Round ${round}</td>`;
        
        players.forEach((player, pIndex) => {
            const roundData = gameData[pIndex].rounds[round - 1] || { bid: null, tricks: null, score: 0 };
            
            // Bid input
            html += `<td><input type="number" class="bid-input" min="0" max="${round}" 
                value="${roundData.bid !== null ? roundData.bid : ''}" 
                onchange="setBid(${pIndex}, ${round}, this.value)"></td>`;
            
            // Tricks input
            html += `<td><input type="number" class="trick-input" min="0" max="${round}" 
                value="${roundData.tricks !== null ? roundData.tricks : ''}" 
                onchange="setTricks(${pIndex}, ${round}, this.value)"></td>`;
            
            // Score
            html += `<td class="score-cell">${roundData.score || 0}</td>`;
        });
        
        html += '</tr>';
    }
    
    // Total row
    html += '<tr class="total-row"><td>Total</td>';
    players.forEach((player, pIndex) => {
        const total = gameData[pIndex].rounds.reduce((sum, r) => sum + (r.score || 0), 0);
        html += `<td colspan="3">${total}</td>`;
    });
    html += '</tr>';
    
    html += '</table>';
    container.innerHTML = html;
}

function setBid(playerIndex, round, value) {
    const bid = value === '' ? null : parseInt(value);
    ensureRoundExists(playerIndex, round);
    gameData[playerIndex].rounds[round - 1].bid = bid;
    calculateScore(playerIndex, round);
    renderScoreTable();
}

function setTricks(playerIndex, round, value) {
    const tricks = value === '' ? null : parseInt(value);
    
    // Validate that total tricks don't exceed round number
    if (tricks !== null) {
        let totalTricks = tricks;
        players.forEach((player, pIndex) => {
            if (pIndex !== playerIndex) {
                const otherRound = gameData[pIndex].rounds[round - 1];
                if (otherRound && otherRound.tricks !== null) {
                    totalTricks += otherRound.tricks;
                }
            }
        });
        
        if (totalTricks > round) {
            alert(`Total tricks (${totalTricks}) cannot exceed the round number (${round})!`);
            renderScoreTable(); // Reset the input
            return;
        }
    }
    
    ensureRoundExists(playerIndex, round);
    gameData[playerIndex].rounds[round - 1].tricks = tricks;
    calculateScore(playerIndex, round);
    renderScoreTable();
}

function ensureRoundExists(playerIndex, round) {
    while (gameData[playerIndex].rounds.length < round) {
        gameData[playerIndex].rounds.push({ bid: null, tricks: null, score: 0 });
    }
}

function calculateScore(playerIndex, round) {
    const roundData = gameData[playerIndex].rounds[round - 1];
    
    if (roundData.bid === null || roundData.tricks === null) {
        roundData.score = 0;
        return;
    }
    
    // Wizard scoring rules:
    // Made bid exactly: 20 + 10 * tricks
    // Missed bid: -10 * difference
    if (roundData.bid === roundData.tricks) {
        roundData.score = 20 + (10 * roundData.tricks);
    } else {
        const difference = Math.abs(roundData.bid - roundData.tricks);
        roundData.score = -10 * difference;
    }
}

function nextRound() {
    if (currentRound < maxRounds) {
        currentRound++;
        renderScoreTable();
    } else {
        alert('Maximum rounds reached!');
    }
}

function resetGame() {
    if (confirm('Are you sure you want to reset the game?')) {
        document.getElementById('setup').style.display = 'block';
        document.getElementById('game').style.display = 'none';
        players = [];
        gameData = [];
        currentRound = 1;
        updatePlayersList();
    }
}
