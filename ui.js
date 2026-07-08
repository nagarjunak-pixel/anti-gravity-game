/**
 * UI Panel Manager & Log Terminal Handler
 */

class UILogger {
    constructor(elementId) {
        this.element = document.getElementById(elementId);
        this.maxLines = 45;
    }

    log(name, text, type = 'system') {
        const timestamp = new Date().toLocaleTimeString();
        const div = document.createElement('div');
        div.className = `log-line ${type}`;
        div.innerHTML = `[${timestamp}] <strong>${name}:</strong> ${text}`;
        
        this.element.appendChild(div);
        
        // Truncate logs to avoid slowing down rendering
        while (this.element.childNodes.length > this.maxLines) {
            this.element.removeChild(this.element.firstChild);
        }
        
        this.element.scrollTop = this.element.scrollHeight;
    }
}

class UIManager {
    constructor(game) {
        this.game = game;
        this.selectedBlueprint = 'turret';
        
        this.initListeners();
    }

    initListeners() {
        // Blueprint selectors
        const bpButtons = document.querySelectorAll('.blueprint-btn');
        bpButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                bpButtons.forEach(b => b.classList.remove('active'));
                const targetBtn = e.currentTarget;
                targetBtn.classList.add('active');
                this.selectedBlueprint = targetBtn.dataset.build;
                this.game.logger.log('SYSTEM', `Blueprint switched: ${this.selectedBlueprint === 'turret' ? 'Auto-Turret' : 'Power Node'} active.`, 'system');
            });
        });

        // Time speed selectors
        const timeButtons = document.querySelectorAll('.time-btn');
        timeButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                timeButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.game.timeScale = parseInt(btn.dataset.speed);
                this.game.logger.log('SYSTEM', `Simulation speed adjusted: ${this.game.timeScale}x`, 'system');
            });
        });

        // Disaster buttons
        document.getElementById('btn-trigger-cavein').addEventListener('click', () => {
            this.game.triggerCaveIn();
        });

        document.getElementById('btn-trigger-swarm').addEventListener('click', () => {
            this.game.triggerBugSwarm();
        });

        document.getElementById('btn-trigger-eclipse').addEventListener('click', () => {
            this.game.triggerSolarEclipse();
        });

        document.getElementById('btn-trigger-godmode').addEventListener('click', (e) => {
            this.game.godMode = !this.game.godMode;
            e.currentTarget.classList.toggle('active', this.game.godMode);
            this.game.logger.log('SYSTEM', `God Mode (Omniscience) ${this.game.godMode ? 'Enabled' : 'Disabled'}.`, 'system');
        });

        // Agent Deployment
        document.getElementById('btn-buy-miner').addEventListener('click', () => this.game.buyAgent('miner'));
        document.getElementById('btn-buy-guard').addEventListener('click', () => this.game.buyAgent('guard'));
        document.getElementById('btn-buy-scout').addEventListener('click', () => this.game.buyAgent('scout'));
        document.getElementById('btn-buy-researcher').addEventListener('click', () => this.game.buyAgent('researcher'));

        // Tech Upgrades
        document.getElementById('btn-tech-plasma').addEventListener('click', (e) => this.game.buyTech('plasma', e.currentTarget));
        document.getElementById('btn-tech-exo').addEventListener('click', (e) => this.game.buyTech('exo', e.currentTarget));
    }

    updateGauges() {
        // Integrity
        document.getElementById('txt-integrity').textContent = `${Math.floor(this.game.integrity)}%`;
        document.getElementById('fill-integrity').style.width = `${this.game.integrity}%`;
        
        // Power Grid
        document.getElementById('txt-power').textContent = `${Math.floor(this.game.power)}%`;
        document.getElementById('fill-power').style.width = `${this.game.power}%`;
        
        // Oxygen support
        document.getElementById('txt-oxygen').textContent = `${Math.floor(this.game.oxygen)}%`;
        document.getElementById('fill-oxygen').style.width = `${this.game.oxygen}%`;

        // Depots
        document.getElementById('res-gold').textContent = Math.floor(this.game.gold);
        document.getElementById('res-crystals').textContent = Math.floor(this.game.crystals);
        document.getElementById('res-science').textContent = Math.floor(this.game.sciencePoints || 0);
    }
}
