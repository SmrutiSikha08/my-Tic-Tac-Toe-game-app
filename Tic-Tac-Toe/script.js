// Tic Tac Toe Pro - Fixed and Enhanced Game Logic

// Game State & Configuration
const gameConfig = {
    currentPlayer: 'X',
    gameActive: true,
    gameStarted: false,
    moveCount: 0,
    roundCount: 1,
    gameMode: 'friend', // 'friend' or 'computer'
    aiDifficulty: 'medium', // 'easy', 'medium', 'hard'
    turnTimer: 30,
    turnTimerInterval: null,
    soundEnabled: true,
    vibrationEnabled: true,
    theme: 'default',
    moveHistory: [],
    scores: {
        xWins: 0,
        oWins: 0,
        draws: 0
    },
    achievements: {
        firstWin: false,
        winStreak: 0,
        bestStreak: 0,
        bestScore: 0
    },
    playerNames: {
        x: 'Player X',
        o: 'Player O'
    },
    playerAvatars: {
        x: 'fas fa-times',
        o: 'far fa-circle'
    }
};

// Board State
let board = ['', '', '', '', '', '', '', '', ''];

// Winning Patterns
const winningPatterns = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
    [0, 4, 8], [2, 4, 6]             // Diagonals
];

// Available Avatars
const avatars = [
    'fas fa-times',
    'far fa-circle',
    'fas fa-skull',
    'fas fa-ghost',
    'fas fa-dragon',
    'fas fa-robot',
    'fas fa-crown',
    'fas fa-bolt',
    'fas fa-fire',
    'fas fa-star',
    'fas fa-heart',
    'fas fa-moon',
    'fas fa-sun',
    'fas fa-rocket',
    'fas fa-gamepad'
];

// Sound Effects with proper URLs
const sounds = {
    click: new Audio('data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAZGF0YQQAAAAA'),
    move: new Audio('data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAZGF0YQQAAAAA'),
    win: new Audio('data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAZGF0YQQAAAAA'),
    draw: new Audio('data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAZGF0YQQAAAAA'),
    reset: new Audio('data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAZGF0YQQAAAAA'),
    hover: new Audio('data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAZGF0YQQAAAAA'),
    error: new Audio('data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAZGF0YQQAAAAA'),
    achievement: new Audio('data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAZGF0YQQAAAAA'),
    notification: new Audio('data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAZGF0YQQAAAAA')
};

// Create simple sound effects using Web Audio API
function createSound(frequency, duration, type) {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = frequency;
    oscillator.type = type || 'sine';
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration);
}

// Initialize sounds with Web Audio API
function initSounds() {
    sounds.click = { play: () => createSound(800, 0.1, 'sine') };
    sounds.move = { play: () => createSound(600, 0.2, 'sine') };
    sounds.win = { play: () => {
        createSound(523.25, 0.3, 'sine');
        setTimeout(() => createSound(659.25, 0.3, 'sine'), 300);
        setTimeout(() => createSound(783.99, 0.5, 'sine'), 600);
    }};
    sounds.draw = { play: () => {
        createSound(392, 0.3, 'sine');
        setTimeout(() => createSound(349.23, 0.5, 'sine'), 300);
    }};
    sounds.reset = { play: () => createSound(400, 0.2, 'square') };
    sounds.hover = { play: () => createSound(500, 0.1, 'sine') };
    sounds.error = { play: () => {
        createSound(200, 0.1, 'square');
        setTimeout(() => createSound(150, 0.2, 'square'), 100);
    }};
    sounds.achievement = { play: () => {
        createSound(1046.50, 0.2, 'sine');
        setTimeout(() => createSound(1318.51, 0.2, 'sine'), 200);
        setTimeout(() => createSound(1567.98, 0.3, 'sine'), 400);
    }};
    sounds.notification = { play: () => createSound(1000, 0.2, 'triangle') };
}

// DOM Elements
const dom = {
    // Network
    networkStatus: document.getElementById('network-status'),
    
    // Game Mode
    modeFriend: document.getElementById('mode-friend'),
    modeComputer: document.getElementById('mode-computer'),
    difficultySelector: document.getElementById('difficulty-selector'),
    
    // Players
    playerX: document.getElementById('player-x'),
    playerO: document.getElementById('player-o'),
    playerXName: document.getElementById('player-x-name'),
    playerOName: document.getElementById('player-o-name'),
    playerXTimer: document.getElementById('player-x-timer'),
    playerOTimer: document.getElementById('player-o-timer'),
    winStreak: document.getElementById('win-streak'),
    
    // Game Board
    cells: document.querySelectorAll('.board-cell'),
    boardGrid: document.getElementById('board-grid'),
    winningLine: document.getElementById('winning-line'),
    
    // Stats
    moveCount: document.getElementById('move-count'),
    roundCount: document.getElementById('round-count'),
    turnTimer: document.getElementById('turn-timer'),
    bestScore: document.getElementById('best-score'),
    
    // Game Status
    status: document.getElementById('game-status'),
    currentTurnBadge: document.getElementById('current-turn-badge'),
    
    // Scores
    xWins: document.getElementById('x-wins'),
    oWins: document.getElementById('o-wins'),
    draws: document.getElementById('draws'),
    
    // History
    moveHistory: document.getElementById('move-history'),
    historyToggleIcon: document.getElementById('history-toggle-icon'),
    
    // Controls
    undoBtn: document.getElementById('undo-btn'),
    soundToggle: document.getElementById('sound-toggle'),
    newGameBtn: document.getElementById('new-game-btn'),
    settingsBtn: document.getElementById('settings-btn'),
    shareBtn: document.getElementById('share-btn'),
    
    // Overlays
    winOverlay: document.getElementById('win-overlay'),
    winMessage: document.getElementById('win-message'),
    winDetails: document.getElementById('win-details'),
    winIcon: document.getElementById('win-icon'),
    currentStreak: document.getElementById('current-streak'),
    confettiContainer: document.getElementById('confetti-container'),
    
    // Share
    sharePanel: document.getElementById('share-panel'),
    
    // Settings
    settingsPanel: document.getElementById('settings-panel'),
    aiDifficultySlider: document.getElementById('ai-difficulty'),
    enableTimer: document.getElementById('enable-timer'),
    timerSeconds: document.getElementById('timer-seconds'),
    playerXSetting: document.getElementById('player-x-setting'),
    playerOSetting: document.getElementById('player-o-setting'),
    
    // Modals
    instructionsModal: document.getElementById('instructions-modal'),
    avatarModal: document.getElementById('avatar-modal'),
    avatarOptions: document.getElementById('avatar-options'),
    
    // Footer links
    howToPlayBtn: null,
    aboutBtn: null,
    
    // Offline
    offlineWarning: document.getElementById('offline-warning')
};

// Notification System
const notificationSystem = {
    container: null,
    
    init() {
        // Create notification container if it doesn't exist
        this.container = document.querySelector('.notification-container');
        if (!this.container) {
            this.container = document.createElement('div');
            this.container.className = 'notification-container';
            document.body.appendChild(this.container);
        }
    },
    
    show(title, message, type = 'info', duration = 3000) {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        
        const icon = type === 'success' ? 'fas fa-check-circle' : 
                     type === 'error' ? 'fas fa-exclamation-circle' : 
                     'fas fa-info-circle';
        
        notification.innerHTML = `
            <i class="${icon}"></i>
            <div class="notification-content">
                <div class="notification-title">${title}</div>
                <div class="notification-message">${message}</div>
            </div>
            <button class="notification-close">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        this.container.appendChild(notification);
        
        // Trigger animation
        setTimeout(() => notification.classList.add('show'), 10);
        
        // Play notification sound
        playSound('notification');
        
        // Auto remove after duration
        const autoRemove = setTimeout(() => {
            this.remove(notification);
        }, duration);
        
        // Close button
        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.addEventListener('click', () => {
            clearTimeout(autoRemove);
            this.remove(notification);
        });
        
        return notification;
    },
    
    remove(notification) {
        notification.classList.remove('show');
        notification.classList.add('hide');
        setTimeout(() => {
            if (notification.parentNode === this.container) {
                this.container.removeChild(notification);
            }
        }, 300);
    },
    
    success(title, message, duration = 3000) {
        return this.show(title, message, 'success', duration);
    },
    
    error(title, message, duration = 3000) {
        return this.show(title, message, 'error', duration);
    },
    
    info(title, message, duration = 3000) {
        return this.show(title, message, 'info', duration);
    }
};

// Initialize Game
function initGame() {
    // Initialize notification system
    notificationSystem.init();
    
    // Initialize sounds
    initSounds();
    
    // Check network status
    checkNetworkStatus();
    window.addEventListener('online', checkNetworkStatus);
    window.addEventListener('offline', checkNetworkStatus);
    
    // Load saved data
    loadGameData();
    
    // Set up event listeners
    setupEventListeners();
    
    // Initialize UI
    updateUI();
    
    // Show welcome notification
    setTimeout(() => {
        notificationSystem.success('Welcome!', 'Game loaded successfully. Have fun playing!');
    }, 1000);
    
    // Show instructions on first load
    setTimeout(() => {
        if (!localStorage.getItem('ticTacToeProInstructionsSeen')) {
            showInstructions();
            localStorage.setItem('ticTacToeProInstructionsSeen', 'true');
        }
    }, 1500);
}

// Check Network Status
function checkNetworkStatus() {
    const isOnline = navigator.onLine;
    
    if (isOnline) {
        dom.networkStatus.innerHTML = '<i class="fas fa-wifi"></i><span>Online</span>';
        dom.networkStatus.className = 'network-status';
        dom.offlineWarning.classList.remove('visible');
    } else {
        dom.networkStatus.innerHTML = '<i class="fas fa-wifi-slash"></i><span>Offline</span>';
        dom.networkStatus.className = 'network-status offline';
        dom.offlineWarning.classList.add('visible');
        notificationSystem.error('Offline', 'Please check your internet connection');
    }
}

// Setup Event Listeners
function setupEventListeners() {
    // Board cells
    dom.cells.forEach(cell => {
        cell.addEventListener('click', handleCellClick);
        cell.addEventListener('mouseenter', handleCellHover);
        cell.addEventListener('mouseleave', handleCellLeave);
        cell.addEventListener('touchstart', handleCellTouchStart);
    });
    
    // Game mode buttons
    dom.modeFriend.addEventListener('click', () => setGameMode('friend'));
    dom.modeComputer.addEventListener('click', () => setGameMode('computer'));
    
    // Difficulty buttons
    document.querySelectorAll('.diff-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const difficulty = e.currentTarget.dataset.difficulty;
            setAIDifficulty(difficulty);
            notificationSystem.success('Difficulty Set', `${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} mode activated`);
        });
    });
    
    // Player name inputs
    dom.playerXName.addEventListener('change', () => {
        gameConfig.playerNames.x = dom.playerXName.value || 'Player X';
        updatePlayerIndicators();
        saveGameData();
        notificationSystem.success('Name Updated', `Player X name changed to ${gameConfig.playerNames.x}`);
    });
    
    dom.playerOName.addEventListener('change', () => {
        gameConfig.playerNames.o = dom.playerOName.value || 'Player O';
        updatePlayerIndicators();
        saveGameData();
        notificationSystem.success('Name Updated', `Player O name changed to ${gameConfig.playerNames.o}`);
    });
    
    // Control buttons
    dom.undoBtn.addEventListener('click', undoMove);
    dom.soundToggle.addEventListener('click', toggleSound);
    dom.newGameBtn.addEventListener('click', resetGame);
    dom.settingsBtn.addEventListener('click', openSettings);
    dom.shareBtn.addEventListener('click', openSharePanel);
    
    // Settings inputs
    dom.aiDifficultySlider.addEventListener('input', updateAIDifficulty);
    dom.enableTimer.addEventListener('change', toggleTimer);
    dom.timerSeconds.addEventListener('change', updateTimerSeconds);
    dom.playerXSetting.addEventListener('change', updatePlayerName);
    dom.playerOSetting.addEventListener('change', updatePlayerName);
    
    // Find footer links
    dom.howToPlayBtn = document.querySelector('.footer-link:nth-child(1)');
    dom.aboutBtn = document.querySelector('.footer-link:nth-child(3)');
    
    // Footer links
    if (dom.howToPlayBtn) {
        dom.howToPlayBtn.addEventListener('click', showInstructions);
    }
    if (dom.aboutBtn) {
        dom.aboutBtn.addEventListener('click', showAbout);
    }
    
    // Close buttons
    document.addEventListener('click', handleOutsideClick);
    
    // Keyboard shortcuts
    document.addEventListener('keydown', handleKeyPress);
    
    // History toggle
    const historyToggle = document.querySelector('.panel-toggle');
    if (historyToggle) {
        historyToggle.addEventListener('click', toggleHistoryPanel);
    }
    
    // History reset
    const historyReset = document.querySelector('.history-reset');
    if (historyReset) {
        historyReset.addEventListener('click', resetHistory);
    }
}

// Handle Cell Click
function handleCellClick(event) {
    if (!gameConfig.gameActive || !navigator.onLine) {
        if (!navigator.onLine) {
            notificationSystem.error('Offline', 'Cannot make moves while offline');
        }
        return;
    }
    
    const cell = event.currentTarget;
    const index = parseInt(cell.dataset.index);
    
    // Check if cell is empty
    if (board[index] !== '') {
        playSound('error');
        vibrate(100);
        animateInvalidMove(cell);
        notificationSystem.error('Invalid Move', 'This cell is already occupied');
        return;
    }
    
    // Make move
    makeMove(index, gameConfig.currentPlayer);
    
    // Check if it's AI's turn
    if (gameConfig.gameMode === 'computer' && 
        gameConfig.gameActive && 
        gameConfig.currentPlayer === 'O') {
        setTimeout(makeAIMove, 500);
    }
}

// Handle Cell Hover
function handleCellHover(event) {
    if (!gameConfig.gameActive || !gameConfig.gameStarted) return;
    
    const cell = event.currentTarget;
    const index = parseInt(cell.dataset.index);
    
    if (board[index] === '') {
        const cellContent = cell.querySelector('.cell-content');
        cellContent.textContent = gameConfig.currentPlayer;
        cellContent.style.opacity = '0.3';
        
        if (gameConfig.currentPlayer === 'X') {
            cellContent.style.background = 'linear-gradient(135deg, var(--accent-x), #0093E9)';
        } else {
            cellContent.style.background = 'linear-gradient(135deg, var(--accent-o), #FF416C)';
        }
        cellContent.style.webkitBackgroundClip = 'text';
        cellContent.style.webkitTextFillColor = 'transparent';
        
        playSound('hover');
    }
}

// Handle Cell Leave
function handleCellLeave(event) {
    const cell = event.currentTarget;
    const index = parseInt(cell.dataset.index);
    
    if (board[index] === '') {
        const cellContent = cell.querySelector('.cell-content');
        cellContent.textContent = '';
    }
}

// Handle Cell Touch Start (for mobile vibration)
function handleCellTouchStart(event) {
    if (gameConfig.vibrationEnabled && navigator.vibrate) {
        navigator.vibrate(50);
    }
}

// Make a Move
function makeMove(index, player) {
    if (!gameConfig.gameStarted) {
        gameConfig.gameStarted = true;
    }
    
    // Update board state
    board[index] = player;
    
    // Update DOM
    const cell = dom.cells[index];
    const cellContent = cell.querySelector('.cell-content');
    
    cellContent.textContent = player;
    cellContent.style.opacity = '1';
    cell.setAttribute('data-mark', player.toLowerCase());
    
    // Add to move history
    const moveData = {
        player,
        index,
        moveNumber: gameConfig.moveCount + 1,
        timestamp: new Date()
    };
    
    gameConfig.moveHistory.push(moveData);
    addMoveToHistory(moveData);
    
    // Play sound and vibrate
    playSound('move');
    vibrate(50);
    
    // Update game stats
    gameConfig.moveCount++;
    updateStats();
    
    // Reset turn timer
    resetTurnTimer();
    
    // Add animation
    animateMove(cell);
    
    // Check game state
    checkGameState();
}

// Make AI Move
function makeAIMove() {
    if (!gameConfig.gameActive) return;
    
    let index;
    const difficulty = gameConfig.aiDifficulty;
    
    switch (difficulty) {
        case 'easy':
            index = getRandomMove();
            break;
        case 'medium':
            index = getMediumAIMove();
            break;
        case 'hard':
            index = getHardAIMove();
            break;
        default:
            index = getRandomMove();
    }
    
    if (index !== -1) {
        setTimeout(() => makeMove(index, 'O'), 300);
    }
}

// AI Algorithms
function getRandomMove() {
    const emptyCells = [];
    board.forEach((cell, index) => {
        if (cell === '') emptyCells.push(index);
    });
    
    if (emptyCells.length === 0) return -1;
    return emptyCells[Math.floor(Math.random() * emptyCells.length)];
}

function getMediumAIMove() {
    // Try to win
    for (const pattern of winningPatterns) {
        const [a, b, c] = pattern;
        if (board[a] === 'O' && board[b] === 'O' && board[c] === '') return c;
        if (board[a] === 'O' && board[c] === 'O' && board[b] === '') return b;
        if (board[b] === 'O' && board[c] === 'O' && board[a] === '') return a;
    }
    
    // Block player
    for (const pattern of winningPatterns) {
        const [a, b, c] = pattern;
        if (board[a] === 'X' && board[b] === 'X' && board[c] === '') return c;
        if (board[a] === 'X' && board[c] === 'X' && board[b] === '') return b;
        if (board[b] === 'X' && board[c] === 'X' && board[a] === '') return a;
    }
    
    // Take center
    if (board[4] === '') return 4;
    
    // Take corners
    const corners = [0, 2, 6, 8];
    const emptyCorners = corners.filter(index => board[index] === '');
    if (emptyCorners.length > 0) {
        return emptyCorners[Math.floor(Math.random() * emptyCorners.length)];
    }
    
    // Take any empty cell
    return getRandomMove();
}

function getHardAIMove() {
    // Try to win
    for (const pattern of winningPatterns) {
        const [a, b, c] = pattern;
        if (board[a] === 'O' && board[b] === 'O' && board[c] === '') return c;
        if (board[a] === 'O' && board[c] === 'O' && board[b] === '') return b;
        if (board[b] === 'O' && board[c] === 'O' && board[a] === '') return a;
    }
    
    // Block player
    for (const pattern of winningPatterns) {
        const [a, b, c] = pattern;
        if (board[a] === 'X' && board[b] === 'X' && board[c] === '') return c;
        if (board[a] === 'X' && board[c] === 'X' && board[b] === '') return b;
        if (board[b] === 'X' && board[c] === 'X' && board[a] === '') return a;
    }
    
    // Create fork opportunities
    const forks = findForks('O');
    if (forks.length > 0) return forks[0];
    
    // Block opponent forks
    const opponentForks = findForks('X');
    if (opponentForks.length > 0) return opponentForks[0];
    
    // Take center
    if (board[4] === '') return 4;
    
    // Take opposite corner
    const oppositeCorners = [[0, 8], [2, 6], [6, 2], [8, 0]];
    for (const [playerCorner, aiCorner] of oppositeCorners) {
        if (board[playerCorner] === 'X' && board[aiCorner] === '') return aiCorner;
    }
    
    // Take empty corner
    const corners = [0, 2, 6, 8];
    const emptyCorners = corners.filter(index => board[index] === '');
    if (emptyCorners.length > 0) {
        return emptyCorners[Math.floor(Math.random() * emptyCorners.length)];
    }
    
    // Take any empty side
    const sides = [1, 3, 5, 7];
    const emptySides = sides.filter(index => board[index] === '');
    if (emptySides.length > 0) {
        return emptySides[Math.floor(Math.random() * emptySides.length)];
    }
    
    return getRandomMove();
}

function findForks(player) {
    const forks = [];
    const emptyCells = board.map((cell, index) => cell === '' ? index : -1).filter(i => i !== -1);
    
    emptyCells.forEach(index => {
        let winCount = 0;
        board[index] = player;
        
        winningPatterns.forEach(pattern => {
            const [a, b, c] = pattern;
            if (pattern.includes(index)) {
                const cells = [board[a], board[b], board[c]];
                const playerCount = cells.filter(cell => cell === player).length;
                const emptyCount = cells.filter(cell => cell === '').length;
                if (playerCount === 2 && emptyCount === 1) winCount++;
            }
        });
        
        board[index] = '';
        if (winCount >= 2) forks.push(index);
    });
    
    return forks;
}

// Check Game State
function checkGameState() {
    const winResult = checkWin();
    
    if (winResult.win) {
        handleWin(winResult);
        return;
    }
    
    if (!board.includes('')) {
        handleDraw();
        return;
    }
    
    // Switch player
    gameConfig.currentPlayer = gameConfig.currentPlayer === 'X' ? 'O' : 'X';
    updateTurnIndicator();
    updatePlayerIndicators();
}

// Check for Win
function checkWin() {
    for (const pattern of winningPatterns) {
        const [a, b, c] = pattern;
        
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            return {
                win: true,
                player: board[a],
                pattern: pattern
            };
        }
    }
    
    return { win: false };
}

// Handle Win
function handleWin(winResult) {
    gameConfig.gameActive = false;
    
    // Update scores
    if (winResult.player === 'X') {
        gameConfig.scores.xWins++;
        gameConfig.achievements.winStreak++;
    } else {
        gameConfig.scores.oWins++;
        gameConfig.achievements.winStreak = 0;
    }
    
    // Update best streak
    if (gameConfig.achievements.winStreak > gameConfig.achievements.bestStreak) {
        gameConfig.achievements.bestStreak = gameConfig.achievements.winStreak;
    }
    
    // Update best score
    const totalWins = gameConfig.scores.xWins + gameConfig.scores.oWins;
    if (totalWins > gameConfig.achievements.bestScore) {
        gameConfig.achievements.bestScore = totalWins;
    }
    
    // Check achievements
    if (!gameConfig.achievements.firstWin) {
        gameConfig.achievements.firstWin = true;
        showAchievement('First Win!', 'You won your first game!');
    }
    
    if (gameConfig.achievements.winStreak >= 3) {
        showAchievement('Hot Streak!', `You've won ${gameConfig.achievements.winStreak} games in a row!`);
    }
    
    // Highlight winning pattern
    showWinningLine(winResult.pattern);
    
    // Show confetti
    createConfetti();
    
    // Play win sound
    playSound('win');
    vibrate([100, 50, 100, 50, 100]);
    
    // Show win overlay
    showWinOverlay(
        `${winResult.player === 'X' ? gameConfig.playerNames.x : gameConfig.playerNames.o} Wins!`,
        `in ${gameConfig.moveCount} moves`,
        winResult.player
    );
    
    // Update scores display
    updateScores();
    saveGameData();
    
    // Show notification
    notificationSystem.success(
        'Victory!',
        `${winResult.player === 'X' ? gameConfig.playerNames.x : gameConfig.playerNames.o} wins the round!`
    );
}

// Handle Draw
function handleDraw() {
    gameConfig.gameActive = false;
    gameConfig.scores.draws++;
    gameConfig.achievements.winStreak = 0;
    
    // Play draw sound
    playSound('draw');
    
    // Show draw overlay
    showWinOverlay("It's a Draw!", "No winner this round", 'draw');
    
    // Update scores
    updateScores();
    saveGameData();
    
    // Show notification
    notificationSystem.info('Draw!', 'The game ended in a draw');
}

// Show Winning Line Animation
function showWinningLine(pattern) {
    const [a, b, c] = pattern;
    const cells = [dom.cells[a], dom.cells[b], dom.cells[c]];
    
    // For now, just highlight the cells
    cells.forEach(cell => {
        cell.style.animation = 'pulse 1s infinite';
        cell.style.boxShadow = '0 0 30px rgba(255, 215, 0, 0.5)';
    });
    
    dom.winningLine.classList.add('show');
}

// Create Confetti
function createConfetti() {
    dom.confettiContainer.innerHTML = '';
    const confettiCount = 100;
    
    for (let i = 0; i < confettiCount; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.style.left = `${Math.random() * 100}vw`;
        confetti.style.animationDelay = `${Math.random() * 2}s`;
        confetti.style.animationDuration = `${1 + Math.random() * 2}s`;
        dom.confettiContainer.appendChild(confetti);
    }
    
    setTimeout(() => {
        dom.confettiContainer.innerHTML = '';
    }, 3000);
}

// Show Win Overlay
function showWinOverlay(message, details, type) {
    dom.winMessage.textContent = message;
    dom.winDetails.textContent = details;
    dom.currentStreak.textContent = gameConfig.achievements.winStreak;
    
    if (type === 'draw') {
        dom.winIcon.innerHTML = '<i class="fas fa-handshake"></i>';
        dom.winIcon.style.background = 'linear-gradient(135deg, #fdcb6e, #e17055)';
    } else {
        dom.winIcon.innerHTML = `<i class="fas fa-trophy"></i>`;
        dom.winIcon.style.background = 'linear-gradient(135deg, #FFD700, #FFA500)';
    }
    
    dom.winOverlay.classList.add('visible');
}

// Hide Win Overlay
function hideWinOverlay() {
    dom.winOverlay.classList.remove('visible');
    dom.winningLine.classList.remove('show');
    
    // Reset cell animations
    dom.cells.forEach(cell => {
        cell.style.animation = '';
        cell.style.boxShadow = '';
    });
}

// Continue Game
function continueGame() {
    hideWinOverlay();
    gameConfig.roundCount++;
    resetGame();
}

// Set Game Mode
function setGameMode(mode) {
    gameConfig.gameMode = mode;
    
    // Update UI
    dom.modeFriend.classList.toggle('active-mode', mode === 'friend');
    dom.modeComputer.classList.toggle('active-mode', mode === 'computer');
    
    // Show/hide difficulty selector
    if (mode === 'computer') {
        dom.difficultySelector.classList.add('visible');
    } else {
        dom.difficultySelector.classList.remove('visible');
    }
    
    // Reset game if needed
    if (gameConfig.gameStarted) {
        resetGame();
    }
    
    saveGameData();
    notificationSystem.success('Game Mode', mode === 'friend' ? 'Playing with Friend' : 'Playing with Computer');
}

// Set AI Difficulty
function setAIDifficulty(difficulty) {
    gameConfig.aiDifficulty = difficulty;
    
    // Update UI
    document.querySelectorAll('.diff-btn').forEach(btn => {
        btn.classList.toggle('active-diff', btn.dataset.difficulty === difficulty);
    });
    
    // Update slider
    const difficultyMap = { easy: 1, medium: 2, hard: 3 };
    dom.aiDifficultySlider.value = difficultyMap[difficulty];
    
    saveGameData();
}

// Update AI Difficulty from Slider
function updateAIDifficulty() {
    const value = parseInt(dom.aiDifficultySlider.value);
    const difficulty = value === 1 ? 'easy' : value === 2 ? 'medium' : 'hard';
    setAIDifficulty(difficulty);
}

// Toggle Timer
function toggleTimer() {
    const enabled = dom.enableTimer.checked;
    if (enabled) {
        resetTurnTimer();
        notificationSystem.success('Timer', 'Turn timer enabled');
    } else {
        clearInterval(gameConfig.turnTimerInterval);
        dom.turnTimer.textContent = 'OFF';
        notificationSystem.info('Timer', 'Turn timer disabled');
    }
}

// Update Timer Seconds
function updateTimerSeconds() {
    const seconds = parseInt(dom.timerSeconds.value);
    if (seconds >= 10 && seconds <= 120) {
        gameConfig.turnTimer = seconds;
        resetTurnTimer();
        saveGameData();
        notificationSystem.success('Timer', `Timer set to ${seconds} seconds`);
    } else {
        dom.timerSeconds.value = gameConfig.turnTimer;
        notificationSystem.error('Invalid', 'Timer must be between 10 and 120 seconds');
    }
}

// Reset Turn Timer
function resetTurnTimer() {
    clearInterval(gameConfig.turnTimerInterval);
    
    if (!dom.enableTimer.checked) {
        dom.turnTimer.textContent = 'OFF';
        return;
    }
    
    let timeLeft = gameConfig.turnTimer;
    dom.turnTimer.textContent = `${timeLeft}s`;
    
    gameConfig.turnTimerInterval = setInterval(() => {
        timeLeft--;
        dom.turnTimer.textContent = `${timeLeft}s`;
        
        if (timeLeft <= 5) {
            dom.turnTimer.style.color = 'var(--danger)';
            dom.turnTimer.style.animation = 'pulse 1s infinite';
        }
        
        if (timeLeft <= 0) {
            clearInterval(gameConfig.turnTimerInterval);
            handleTimeOut();
        }
    }, 1000);
}

// Handle Time Out
function handleTimeOut() {
    playSound('error');
    vibrate(200);
    
    // Switch player
    gameConfig.currentPlayer = gameConfig.currentPlayer === 'X' ? 'O' : 'X';
    updateTurnIndicator();
    updatePlayerIndicators();
    
    // Reset timer
    resetTurnTimer();
    
    notificationSystem.error('Time Out', 'Time is up! Turn passed to next player');
}

// Update Player Name
function updatePlayerName() {
    gameConfig.playerNames.x = dom.playerXSetting.value || 'Player X';
    gameConfig.playerNames.o = dom.playerOSetting.value || 'Player O';
    
    dom.playerXName.value = gameConfig.playerNames.x;
    dom.playerOName.value = gameConfig.playerNames.o;
    
    updatePlayerIndicators();
    saveGameData();
    notificationSystem.success('Settings Saved', 'Player names updated');
}

// Undo Move
function undoMove() {
    if (!gameConfig.gameActive || gameConfig.moveHistory.length === 0) {
        playSound('error');
        notificationSystem.error('Cannot Undo', 'No moves to undo');
        return;
    }
    
    // Get last move
    const lastMove = gameConfig.moveHistory.pop();
    
    // Reset board position
    board[lastMove.index] = '';
    
    // Update DOM
    const cell = dom.cells[lastMove.index];
    const cellContent = cell.querySelector('.cell-content');
    cellContent.textContent = '';
    cell.removeAttribute('data-mark');
    cell.style.animation = '';
    cell.style.boxShadow = '';
    
    // Update current player
    gameConfig.currentPlayer = lastMove.player;
    
    // Update move count
    gameConfig.moveCount--;
    
    // Update stats and UI
    updateStats();
    updateTurnIndicator();
    updatePlayerIndicators();
    
    // Remove from history log
    const historyItems = dom.moveHistory.querySelectorAll('.history-item');
    if (historyItems.length > 0) {
        historyItems[0].remove();
    }
    
    // If history is empty, show empty state
    if (gameConfig.moveHistory.length === 0) {
        dom.moveHistory.innerHTML = `
            <div class="log-empty">
                <i class="fas fa-chess-board"></i>
                <p>No moves yet. Make the first move!</p>
            </div>
        `;
    }
    
    playSound('reset');
    vibrate(50);
    saveGameData();
    notificationSystem.success('Move Undone', 'Last move has been undone');
}

// Reset Game
function resetGame() {
    // Reset board state
    board = ['', '', '', '', '', '', '', '', ''];
    
    // Reset game config
    gameConfig.currentPlayer = 'X';
    gameConfig.gameActive = true;
    gameConfig.gameStarted = true;
    gameConfig.moveCount = 0;
    
    // Clear cells
    dom.cells.forEach(cell => {
        const cellContent = cell.querySelector('.cell-content');
        cellContent.textContent = '';
        cell.removeAttribute('data-mark');
        cell.style.animation = '';
        cell.style.boxShadow = '';
    });
    
    // Reset status
    updateTurnIndicator();
    updatePlayerIndicators();
    updateStats();
    
    // Clear move history
    gameConfig.moveHistory = [];
    dom.moveHistory.innerHTML = `
        <div class="log-empty">
            <i class="fas fa-chess-board"></i>
            <p>No moves yet. Make the first move!</p>
        </div>
    `;
    
    // Hide win overlay
    hideWinOverlay();
    
    // Reset timer
    resetTurnTimer();
    
    // Play reset sound
    playSound('reset');
    vibrate(100);
    
    notificationSystem.success('Game Reset', 'New game started');
}

// Play Sound
function playSound(type) {
    if (!gameConfig.soundEnabled || !sounds[type]) return;
    
    try {
        sounds[type].play();
    } catch (error) {
        console.log('Sound play failed:', error);
    }
}

// Vibrate
function vibrate(pattern) {
    if (gameConfig.vibrationEnabled && navigator.vibrate) {
        try {
            navigator.vibrate(pattern);
        } catch (error) {
            console.log('Vibration failed:', error);
        }
    }
}

// Open Settings
function openSettings() {
    dom.settingsPanel.classList.add('visible');
    playSound('click');
}

// Close Settings
function closeSettings() {
    dom.settingsPanel.classList.remove('visible');
    playSound('click');
}

// Save Settings
function saveSettings() {
    // Update theme
    const activeTheme = document.querySelector('.theme-option.active-theme');
    if (activeTheme) {
        const theme = activeTheme.dataset.theme;
        setTheme(theme);
    }
    
    closeSettings();
    saveGameData();
    playSound('click');
    notificationSystem.success('Settings Saved', 'All settings have been saved successfully');
}

// Open Share Panel
function openSharePanel() {
    dom.sharePanel.classList.add('visible');
    playSound('click');
}

// Close Share Panel
function closeSharePanel() {
    dom.sharePanel.classList.remove('visible');
    playSound('click');
}

// Share via WhatsApp
function shareViaWhatsApp() {
    const message = "Play Tic Tac Toe Pro 🎮 Challenge me now!";
    const url = window.location.href;
    const shareUrl = `https://wa.me/?text=${encodeURIComponent(message + ' ' + url)}`;
    window.open(shareUrl, '_blank');
    closeSharePanel();
    notificationSystem.success('Shared', 'Opening WhatsApp...');
}

// Copy Game Link
function copyGameLink() {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
        notificationSystem.success('Copied!', 'Game link copied to clipboard');
        closeSharePanel();
    }).catch(() => {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = url;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        notificationSystem.success('Copied!', 'Game link copied to clipboard');
        closeSharePanel();
    });
}

// Show Instructions
function showInstructions() {
    dom.instructionsModal.classList.add('visible');
    playSound('click');
}

// Close Instructions
function closeInstructions() {
    dom.instructionsModal.classList.remove('visible');
    playSound('click');
}

// Show About
function showAbout() {
    // Create about modal if it doesn't exist
    let aboutModal = document.getElementById('about-modal');
    if (!aboutModal) {
        aboutModal = document.createElement('div');
        aboutModal.id = 'about-modal';
        aboutModal.className = 'modal-overlay';
        aboutModal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2><i class="fas fa-info-circle"></i> About Tic Tac Toe Pro</h2>
                    <button class="modal-close" onclick="closeAbout()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="about-content">
                        <h3><i class="fas fa-gamepad"></i> The Ultimate Tic Tac Toe Experience</h3>
                        <p>Tic Tac Toe Pro is a modern, feature-rich version of the classic game with enhanced graphics, multiple game modes, and exciting features.</p>
                        
                        <h3><i class="fas fa-star"></i> Features</h3>
                        <ul class="about-features">
                            <li>🎮 Play with Friend or Computer AI</li>
                            <li>🎯 Three AI difficulty levels</li>
                            <li>🎨 Multiple themes (Default, Dark, Light)</li>
                            <li>🔊 Sound effects and notifications</li>
                            <li>📱 Mobile-friendly responsive design</li>
                            <li>🏆 Achievement system and win streaks</li>
                            <li>⏱️ Turn timer with countdown</li>
                            <li>📊 Detailed game statistics</li>
                            <li>🔄 Move history and undo feature</li>
                            <li>👤 Player customization</li>
                        </ul>
                        
                        <h3><i class="fas fa-code"></i> Technology</h3>
                        <p>Built with pure HTML, CSS, and JavaScript. No frameworks required.</p>
                        
                        <div class="about-version">
                            <p><strong>Version:</strong> 2.0.0</p>
                            <p><strong>Last Updated:</strong> 2024</p>
                            <p>© 2024 Tic Tac Toe Pro | Made with <i class="fas fa-heart" style="color: #FF416C;"></i> for gamers</p>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn-primary start-playing" onclick="closeAbout()">
                        <i class="fas fa-check"></i> Got it!
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(aboutModal);
    }
    
    aboutModal.classList.add('visible');
    playSound('click');
}

// Close About
function closeAbout() {
    const aboutModal = document.getElementById('about-modal');
    if (aboutModal) {
        aboutModal.classList.remove('visible');
        playSound('click');
    }
}

// Change Avatar
function changeAvatar(player) {
    // Store which player is changing avatar
    localStorage.setItem('changingAvatarFor', player);
    
    // Populate avatar options
    dom.avatarOptions.innerHTML = '';
    avatars.forEach(avatar => {
        const avatarOption = document.createElement('div');
        avatarOption.className = 'avatar-option';
        if (avatar === gameConfig.playerAvatars[player]) {
            avatarOption.classList.add('selected');
        }
        avatarOption.innerHTML = `<i class="${avatar}"></i>`;
        avatarOption.addEventListener('click', () => selectAvatar(avatar));
        dom.avatarOptions.appendChild(avatarOption);
    });
    
    // Show modal
    dom.avatarModal.classList.add('visible');
    playSound('click');
}

// Select Avatar
function selectAvatar(avatar) {
    const player = localStorage.getItem('changingAvatarFor');
    
    if (player === 'x') {
        gameConfig.playerAvatars.x = avatar;
        const avatarIcon = dom.playerX.querySelector('.avatar-icon i');
        avatarIcon.className = avatar;
    } else {
        gameConfig.playerAvatars.o = avatar;
        const avatarIcon = dom.playerO.querySelector('.avatar-icon i');
        avatarIcon.className = avatar;
    }
    
    closeAvatarModal();
    saveGameData();
    notificationSystem.success('Avatar Updated', `Player ${player.toUpperCase()} avatar changed`);
}

// Close Avatar Modal
function closeAvatarModal() {
    dom.avatarModal.classList.remove('visible');
    playSound('click');
}

// Show Achievement
function showAchievement(title, message) {
    playSound('achievement');
    vibrate([100, 50, 100]);
    notificationSystem.success(title, message, 5000);
}

// Toggle History Panel
function toggleHistoryPanel() {
    const logContainer = dom.moveHistory.parentElement;
    const isCollapsed = logContainer.classList.contains('collapsed');
    
    if (isCollapsed) {
        logContainer.classList.remove('collapsed');
        dom.historyToggleIcon.className = 'fas fa-chevron-up';
    } else {
        logContainer.classList.add('collapsed');
        dom.historyToggleIcon.className = 'fas fa-chevron-down';
    }
    
    playSound('click');
}

// Reset History
function resetHistory() {
    if (confirm('Are you sure you want to reset all scores and history?')) {
        gameConfig.scores = { xWins: 0, oWins: 0, draws: 0 };
        gameConfig.achievements = {
            firstWin: false,
            winStreak: 0,
            bestStreak: 0,
            bestScore: 0
        };
        gameConfig.moveHistory = [];
        
        updateScores();
        updateStats();
        dom.moveHistory.innerHTML = `
            <div class="log-empty">
                <i class="fas fa-chess-board"></i>
                <p>No moves yet. Make the first move!</p>
            </div>
        `;
        
        saveGameData();
        playSound('reset');
        notificationSystem.success('History Reset', 'All scores and history have been reset');
    }
}

// Add Move to History
function addMoveToHistory(move) {
    const historyElement = document.createElement('div');
    historyElement.className = 'history-item';
    
    const playerClass = move.player === 'X' ? 'x-move' : 'o-move';
    const playerIcon = move.player === 'X' ? 
        gameConfig.playerAvatars.x : 
        gameConfig.playerAvatars.o;
    
    const time = move.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const positionNames = ['Top-Left', 'Top-Center', 'Top-Right',
                          'Middle-Left', 'Center', 'Middle-Right',
                          'Bottom-Left', 'Bottom-Center', 'Bottom-Right'];
    
    historyElement.innerHTML = `
        <div class="history-move ${playerClass}">
            <i class="${playerIcon}"></i>
            <span class="move-player">${move.player}</span>
        </div>
        <div class="move-details">
            <span class="move-position">Move ${move.moveNumber}: ${positionNames[move.index]}</span>
            <span class="move-time">${time}</span>
        </div>
    `;
    
    // Add to beginning of history
    if (dom.moveHistory.querySelector('.log-empty')) {
        dom.moveHistory.innerHTML = '';
    }
    
    dom.moveHistory.prepend(historyElement);
    
    // Limit history to last 10 moves
    const items = dom.moveHistory.querySelectorAll('.history-item');
    if (items.length > 10) {
        items[items.length - 1].remove();
    }
    
    // Ensure history panel is expanded
    const logContainer = dom.moveHistory.parentElement;
    logContainer.classList.remove('collapsed');
    if (dom.historyToggleIcon) {
        dom.historyToggleIcon.className = 'fas fa-chevron-up';
    }
}

// Update UI
function updateUI() {
    updatePlayerIndicators();
    updateTurnIndicator();
    updateStats();
    updateScores();
    
    // Update player names
    dom.playerXName.value = gameConfig.playerNames.x;
    dom.playerOName.value = gameConfig.playerNames.o;
    dom.playerXSetting.value = gameConfig.playerNames.x;
    dom.playerOSetting.value = gameConfig.playerNames.o;
    
    // Update avatars
    const playerXAvatar = dom.playerX.querySelector('.avatar-icon i');
    const playerOAvatar = dom.playerO.querySelector('.avatar-icon i');
    playerXAvatar.className = gameConfig.playerAvatars.x;
    playerOAvatar.className = gameConfig.playerAvatars.o;
    
    // Update game mode
    dom.modeFriend.classList.toggle('active-mode', gameConfig.gameMode === 'friend');
    dom.modeComputer.classList.toggle('active-mode', gameConfig.gameMode === 'computer');
    
    // Update difficulty
    setAIDifficulty(gameConfig.aiDifficulty);
    
    // Update timer settings
    dom.enableTimer.checked = true;
    dom.timerSeconds.value = gameConfig.turnTimer;
    
    // Update sound toggle
    const soundIcon = dom.soundToggle.querySelector('i');
    const soundText = dom.soundToggle.querySelector('span');
    if (gameConfig.soundEnabled) {
        soundIcon.className = 'fas fa-volume-up';
        soundText.textContent = 'Sound On';
        dom.soundToggle.classList.add('btn-tertiary');
        dom.soundToggle.classList.remove('btn-secondary');
    } else {
        soundIcon.className = 'fas fa-volume-mute';
        soundText.textContent = 'Sound Off';
        dom.soundToggle.classList.remove('btn-tertiary');
        dom.soundToggle.classList.add('btn-secondary');
    }
    
    // Update theme buttons
    updateThemeButtons();
}

// Update Player Indicators
function updatePlayerIndicators() {
    const isXTurn = gameConfig.currentPlayer === 'X';
    
    dom.playerX.classList.toggle('active-player', isXTurn);
    dom.playerO.classList.toggle('active-player', !isXTurn);
    
    const xStatus = dom.playerX.querySelector('.player-status');
    const oStatus = dom.playerO.querySelector('.player-status');
    
    if (isXTurn) {
        xStatus.innerHTML = '<i class="fas fa-clock"></i> Current Turn';
        oStatus.innerHTML = '<i class="fas fa-hourglass-half"></i> Waiting';
    } else {
        xStatus.innerHTML = '<i class="fas fa-hourglass-half"></i> Waiting';
        oStatus.innerHTML = '<i class="fas fa-clock"></i> Current Turn';
    }
    
    // Update win streak
    if (dom.winStreak) {
        dom.winStreak.querySelector('span').textContent = gameConfig.achievements.winStreak;
    }
}

// Update Turn Indicator
function updateTurnIndicator() {
    const isXTurn = gameConfig.currentPlayer === 'X';
    const playerName = isXTurn ? gameConfig.playerNames.x : gameConfig.playerNames.o;
    const playerIcon = isXTurn ? gameConfig.playerAvatars.x : gameConfig.playerAvatars.o;
    
    if (dom.status) {
        const statusText = dom.status.querySelector('.status-text');
        if (statusText) {
            statusText.textContent = `${playerName}'s Turn`;
        }
    }
    
    if (dom.currentTurnBadge) {
        dom.currentTurnBadge.innerHTML = `<i class="${playerIcon}"></i>`;
    }
}

// Update Stats
function updateStats() {
    if (dom.moveCount) dom.moveCount.textContent = gameConfig.moveCount.toString().padStart(2, '0');
    if (dom.roundCount) dom.roundCount.textContent = gameConfig.roundCount;
    if (dom.bestScore) dom.bestScore.textContent = gameConfig.achievements.bestScore;
}

// Update Scores
function updateScores() {
    if (dom.xWins) dom.xWins.textContent = gameConfig.scores.xWins;
    if (dom.oWins) dom.oWins.textContent = gameConfig.scores.oWins;
    if (dom.draws) dom.draws.textContent = gameConfig.scores.draws;
}

// Set Theme
function setTheme(theme) {
    gameConfig.theme = theme;
    
    // Remove existing theme classes
    document.body.classList.remove('theme-dark', 'theme-light', 'theme-default');
    
    // Add new theme class
    if (theme !== 'default') {
        document.body.classList.add(`theme-${theme}`);
    }
    
    // Update theme buttons
    updateThemeButtons();
    
    saveGameData();
    notificationSystem.success('Theme Changed', `${theme.charAt(0).toUpperCase() + theme.slice(1)} theme activated`);
}

// Update Theme Buttons
function updateThemeButtons() {
    const themeButtons = document.querySelectorAll('.theme-option');
    themeButtons.forEach(btn => {
        btn.classList.toggle('active-theme', btn.dataset.theme === gameConfig.theme);
    });
}

// Toggle Sound
function toggleSound() {
    gameConfig.soundEnabled = !gameConfig.soundEnabled;
    
    const icon = dom.soundToggle.querySelector('i');
    const text = dom.soundToggle.querySelector('span');
    
    if (gameConfig.soundEnabled) {
        icon.className = 'fas fa-volume-up';
        text.textContent = 'Sound On';
        dom.soundToggle.classList.add('btn-tertiary');
        dom.soundToggle.classList.remove('btn-secondary');
        playSound('click');
        notificationSystem.success('Sound', 'Sound effects enabled');
    } else {
        icon.className = 'fas fa-volume-mute';
        text.textContent = 'Sound Off';
        dom.soundToggle.classList.remove('btn-tertiary');
        dom.soundToggle.classList.add('btn-secondary');
        notificationSystem.info('Sound', 'Sound effects disabled');
    }
    
    saveGameData();
}

// Handle Outside Click
function handleOutsideClick(event) {
    // Close settings panel if clicking outside
    if (dom.settingsPanel.classList.contains('visible') && 
        !dom.settingsPanel.contains(event.target) && 
        !dom.settingsBtn.contains(event.target)) {
        closeSettings();
    }
    
    // Close share panel if clicking outside
    if (dom.sharePanel.classList.contains('visible') && 
        !dom.sharePanel.contains(event.target) && 
        !dom.shareBtn.contains(event.target)) {
        closeSharePanel();
    }
    
    // Close modals if clicking outside
    if (dom.instructionsModal.classList.contains('visible') && 
        !dom.instructionsModal.contains(event.target)) {
        closeInstructions();
    }
    
    if (dom.avatarModal.classList.contains('visible') && 
        !dom.avatarModal.contains(event.target)) {
        closeAvatarModal();
    }
    
    const aboutModal = document.getElementById('about-modal');
    if (aboutModal && aboutModal.classList.contains('visible') && 
        !aboutModal.contains(event.target)) {
        closeAbout();
    }
}

// Handle Key Press
function handleKeyPress(event) {
    // Space to reset game
    if (event.code === 'Space' && !event.target.matches('input, textarea')) {
        event.preventDefault();
        resetGame();
    }
    
    // Escape to close modals
    if (event.code === 'Escape') {
        closeSettings();
        closeSharePanel();
        closeInstructions();
        closeAvatarModal();
        closeAbout();
        hideWinOverlay();
    }
    
    // Ctrl+Z to undo
    if (event.ctrlKey && event.code === 'KeyZ') {
        event.preventDefault();
        undoMove();
    }
    
    // Ctrl+S for settings
    if (event.ctrlKey && event.code === 'KeyS') {
        event.preventDefault();
        openSettings();
    }
    
    // H for help
    if (event.code === 'KeyH') {
        event.preventDefault();
        showInstructions();
    }
}

// Animations
function animateMove(cell) {
    cell.style.transform = 'scale(0)';
    cell.style.opacity = '0.5';
    
    setTimeout(() => {
        cell.style.transition = 'all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
        cell.style.transform = 'scale(1)';
        cell.style.opacity = '1';
    }, 50);
}

function animateInvalidMove(cell) {
    cell.style.animation = 'shake 0.5s';
    setTimeout(() => {
        cell.style.animation = '';
    }, 500);
}

// Save Game Data
function saveGameData() {
    const gameData = {
        scores: gameConfig.scores,
        achievements: gameConfig.achievements,
        playerNames: gameConfig.playerNames,
        playerAvatars: gameConfig.playerAvatars,
        gameMode: gameConfig.gameMode,
        aiDifficulty: gameConfig.aiDifficulty,
        soundEnabled: gameConfig.soundEnabled,
        theme: gameConfig.theme,
        turnTimer: gameConfig.turnTimer
    };
    
    localStorage.setItem('ticTacToeProData', JSON.stringify(gameData));
}

// Load Game Data
function loadGameData() {
    const savedData = localStorage.getItem('ticTacToeProData');
    
    if (savedData) {
        try {
            const gameData = JSON.parse(savedData);
            
            // Load scores
            if (gameData.scores) {
                gameConfig.scores = gameData.scores;
            }
            
            // Load achievements
            if (gameData.achievements) {
                gameConfig.achievements = gameData.achievements;
            }
            
            // Load player names
            if (gameData.playerNames) {
                gameConfig.playerNames = gameData.playerNames;
            }
            
            // Load player avatars
            if (gameData.playerAvatars) {
                gameConfig.playerAvatars = gameData.playerAvatars;
            }
            
            // Load game mode
            if (gameData.gameMode) {
                gameConfig.gameMode = gameData.gameMode;
            }
            
            // Load AI difficulty
            if (gameData.aiDifficulty) {
                gameConfig.aiDifficulty = gameData.aiDifficulty;
            }
            
            // Load sound setting
            if (gameData.soundEnabled !== undefined) {
                gameConfig.soundEnabled = gameData.soundEnabled;
            }
            
            // Load theme
            if (gameData.theme) {
                setTheme(gameData.theme);
            }
            
            // Load timer
            if (gameData.turnTimer) {
                gameConfig.turnTimer = gameData.turnTimer;
            }
            
            notificationSystem.info('Game Loaded', 'Your previous game data has been restored');
        } catch (error) {
            console.error('Error loading game data:', error);
            notificationSystem.error('Load Error', 'Could not load saved data');
        }
    }
}

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', initGame);

// Expose functions globally
window.resetGame = resetGame;
window.continueGame = continueGame;
window.openSettings = openSettings;
window.closeSettings = closeSettings;
window.saveSettings = saveSettings;
window.openSharePanel = openSharePanel;
window.closeSharePanel = closeSharePanel;
window.shareViaWhatsApp = shareViaWhatsApp;
window.copyGameLink = copyGameLink;
window.showInstructions = showInstructions;
window.closeInstructions = closeInstructions;
window.showAbout = showAbout;
window.closeAbout = closeAbout;
window.changeAvatar = changeAvatar;
window.closeAvatarModal = closeAvatarModal;
window.selectAvatar = selectAvatar;
window.toggleHistoryPanel = toggleHistoryPanel;
window.resetHistory = resetHistory;
window.setTheme = setTheme;
window.toggleSound = toggleSound;