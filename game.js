/**
 * DeepCore Colony Engine Game Loop & Grid Manager
 */

class GameEngine {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.cellSize = 20; // 40 * 20 = 800 width, 30 * 20 = 600 height
        this.cols = 40;
        this.rows = 30;
        
        this.ticks = 0;
        this.timeScale = 1;
        
        // Resources & Core
        this.gold = 100;
        this.crystals = 50;
        this.sciencePoints = 0;
        this.integrity = 100;
        this.power = 85;
        this.oxygen = 95;
        
        this.grid = [];
        this.fogMap = [];
        this.citizens = [];
        this.enemies = [];
        this.nests = [];
        this.buildQueue = [];
        this.turretTargets = new Map(); // Turret x,y -> Enemy reference

        // Upgrades & States
        this.godMode = false;
        this.tech = {
            plasma: false,
            exo: false
        };

        // Core Systems
        this.logger = new UILogger('agent-logs-feed');
        this.ui = new UIManager(this);

        this.initGrid();
        this.spawnSwarm();
        this.initCanvasListeners();
        
        // Start Loop
        this.logger.log('SYSTEM', 'Swarm coordination protocol loaded. DeepCore Core-1 simulation active.', 'system');
        this.loop();
    }

    // --- GRID INITS ---
    initGrid() {
        this.grid = Array(this.cols).fill(null).map(() => Array(this.rows).fill(0));
        this.fogMap = Array(this.cols).fill(null).map(() => Array(this.rows).fill(0));

        // Spawn outer walls (Stone border)
        for (let x = 0; x < this.cols; x++) {
            this.grid[x][0] = 2;
            this.grid[x][this.rows - 1] = 2;
        }
        for (let y = 0; y < this.rows; y++) {
            this.grid[0][y] = 2;
            this.grid[this.cols - 1][y] = 2;
        }

        // Place central core base (x: 18-22, y: 13-17)
        for (let x = 18; x <= 22; x++) {
            for (let y = 13; y <= 17; y++) {
                this.grid[x][y] = 5; // Base Core cell
            }
        }

        // Spawn rock formations (Stone)
        this.spawnCluster(2, 6, 8, 3);
        this.spawnCluster(2, 30, 20, 4);

        // Spawn dirt layers
        for (let x = 1; x < this.cols - 1; x++) {
            for (let y = 1; y < this.rows - 1; y++) {
                // Keep center base clear
                if (this.grid[x][y] === 5) continue;
                
                // Random dirt generation
                if (Math.random() < 0.25) {
                    this.grid[x][y] = 1; // Dirt block
                }
            }
        }

        // Spawn resource veins
        this.spawnCluster(3, 5, 20, 4);  // Gold cluster left
        this.spawnCluster(3, 34, 8, 3);  // Gold cluster right
        this.spawnCluster(4, 15, 6, 3);  // Crystal cluster top
        this.spawnCluster(4, 25, 24, 4); // Crystal cluster bottom

        // Spawn Nests (Type 9)
        this.spawnCluster(9, 3, 3, 2);
        this.spawnCluster(9, 36, 26, 2);

        // Reveal starting core area
        this.revealFog(20, 15, 10);
    }

    spawnCluster(type, cx, cy, radius) {
        for (let x = cx - radius; x <= cx + radius; x++) {
            for (let y = cy - radius; y <= cy + radius; y++) {
                if (x > 0 && x < this.cols - 1 && y > 0 && y < this.rows - 1) {
                    if (this.grid[x][y] === 5) continue;
                    
                    const dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
                    if (dist <= radius && Math.random() < 0.7) {
                        this.grid[x][y] = type;
                    }
                }
            }
        }
    }

    // --- SWARM SPAWNING ---
    spawnSwarm() {
        // Spawn Miners
        this.citizens.push(new Miner('miner-1', 'Aria-01', 20, 15));
        this.citizens.push(new Miner('miner-2', 'Aria-02', 20, 14));
        this.citizens.push(new Miner('miner-3', 'Aria-03', 21, 15));

        // Spawn Builders
        this.citizens.push(new Builder('builder-1', 'Balthazar-01', 19, 15));
        this.citizens.push(new Builder('builder-2', 'Balthazar-02', 20, 16));

        // Spawn Guards
        this.citizens.push(new Guard('guard-1', 'Draco-01', 18, 14));
        this.citizens.push(new Guard('guard-2', 'Draco-02', 22, 16));
        
        // Spawn Initial Scout and Researcher
        this.citizens.push(new Scout('scout-1', 'Ranger-01', 20, 17));
        this.citizens.push(new Researcher('res-1', 'Brain-01', 19, 14));
    }

    revealFog(cx, cy, radius) {
        for (let x = cx - radius; x <= cx + radius; x++) {
            for (let y = cy - radius; y <= cy + radius; y++) {
                if (x >= 0 && x < this.cols && y >= 0 && y < this.rows) {
                    const dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
                    if (dist <= radius) {
                        this.fogMap[x][y] = 1; // Revealed
                    }
                }
            }
        }
    }

    // --- MANAGE GRID CLICK BLUEPRINTS ---
    initCanvasListeners() {
        this.canvas.addEventListener('click', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;
            
            const cellX = Math.floor(mouseX / this.cellSize);
            const cellY = Math.floor(mouseY / this.cellSize);

            if (cellX > 0 && cellX < this.cols - 1 && cellY > 0 && cellY < this.rows - 1) {
                // Must be Empty Tunnel (0) to build
                if (this.grid[cellX][cellY] !== 0) {
                    this.logger.log('SYSTEM', 'Construction target cell must be empty.', 'system');
                    return;
                }

                // Check costs
                let costGold = 0;
                let costCrystals = 0;
                let buildType = 6; // 6 = Turret, 7 = Generator

                if (this.ui.selectedBlueprint === 'turret') {
                    costGold = 50;
                    costCrystals = 20;
                    buildType = 6;
                } else {
                    costGold = 30;
                    costCrystals = 40;
                    buildType = 7;
                }

                if (this.gold >= costGold && this.crystals >= costCrystals) {
                    this.gold -= costGold;
                    this.crystals -= costCrystals;
                    
                    // Add build task to builders queue
                    this.buildQueue.push({ pos: { x: cellX, y: cellY }, type: buildType });
                    this.grid[cellX][cellY] = 8; // Mark as "Planned Construction"
                    this.logger.log('SYSTEM', `Design plan queued: ${buildType === 6 ? 'Auto-Turret' : 'Power Node'} scheduled at [${cellX}, ${cellY}].`, 'system');
                } else {
                    this.logger.log('SYSTEM', 'Insufficient Gold or Crystals to construct blueprint.', 'system');
                }
            }
        });
    }

    // --- HELPER UTILITIES FOR AGENTS ---
    isPassable(x, y) {
        // Passable cells: Empty (0), Base Core (5)
        const cell = this.grid[x][y];
        return cell === 0 || cell === 5;
    }

    findClosestResource(agent) {
        let closest = null;
        let minDist = Infinity;

        for (let x = 0; x < this.cols; x++) {
            for (let y = 0; y < this.rows; y++) {
                const cell = this.grid[x][y];
                if ((cell === 3 || cell === 4) && this.fogMap[x][y] === 1) { // Gold or Crystal AND revealed
                    const dist = Math.abs(agent.x - x) + Math.abs(agent.y - y);
                    if (dist < minDist) {
                        minDist = dist;
                        closest = { x, y, type: cell };
                    }
                }
            }
        }
        return closest;
    }

    buyAgent(type) {
        let costGold = 0; let costCryst = 0;
        if (type === 'miner') { costGold = 20; }
        if (type === 'guard') { costGold = 30; costCryst = 10; }
        if (type === 'scout') { costGold = 10; costCryst = 20; }
        if (type === 'researcher') { costGold = 50; costCryst = 50; }

        if (this.gold >= costGold && this.crystals >= costCryst) {
            this.gold -= costGold;
            this.crystals -= costCryst;
            const id = `${type}-${Date.now()}`;
            const x = 20 + Math.floor(Math.random() * 3 - 1);
            const y = 15 + Math.floor(Math.random() * 3 - 1);
            
            if (type === 'miner') this.citizens.push(new Miner(id, `Aria-${Math.floor(Math.random()*100)}`, x, y));
            if (type === 'guard') this.citizens.push(new Guard(id, `Draco-${Math.floor(Math.random()*100)}`, x, y));
            if (type === 'scout') this.citizens.push(new Scout(id, `Ranger-${Math.floor(Math.random()*100)}`, x, y));
            if (type === 'researcher') this.citizens.push(new Researcher(id, `Brain-${Math.floor(Math.random()*100)}`, x, y));
            
            this.logger.log('SYSTEM', `Deployed new ${type.toUpperCase()}.`, 'system');
        }
    }

    buyTech(type, btn) {
        if (this.tech[type]) return; // already bought
        
        const cost = type === 'plasma' ? 100 : 150;
        if (this.sciencePoints >= cost) {
            this.sciencePoints -= cost;
            this.tech[type] = true;
            btn.classList.add('purchased');
            btn.innerHTML = `<span class="material-icons-round">check_circle</span> ${type === 'plasma' ? 'Plasma Turrets' : 'Exo-Suits'} Active`;
            this.logger.log('SYSTEM', `Tech unlocked: ${type.toUpperCase()}.`, 'system');
        }
    }

    mineResourceNode(x, y) {
        // Decrease density or clear node
        if (Math.random() < 0.1) {
            this.grid[x][y] = 0; // Turn node to empty path
            this.logger.log('SYSTEM', `Resource node at [${x}, ${y}] fully depleted.`, 'system');
        }
    }

    placeStructure(x, y, type) {
        this.grid[x][y] = type;
        if (type === 7) {
            this.power = Math.min(100, this.power + 15);
        }
    }

    findClosestEnemy(agent) {
        let closest = null;
        let minDist = Infinity;

        for (const enemy of this.enemies) {
            const dist = Math.abs(agent.x - enemy.x) + Math.abs(agent.y - enemy.y);
            if (dist < minDist) {
                minDist = dist;
                closest = enemy;
            }
        }
        return closest;
    }

    findClosestCitizen(enemy) {
        let closest = null;
        let minDist = Infinity;

        // Citizens
        for (const citizen of this.citizens) {
            if (citizen.hp <= 0) continue;
            const dist = Math.abs(enemy.x - citizen.x) + Math.abs(enemy.y - citizen.y);
            if (dist < minDist) {
                minDist = dist;
                closest = citizen;
            }
        }
        
        // Also target Core (20, 15) if no citizens are left
        if (!closest) {
            return { x: 20, y: 15, type: 'core', hp: this.integrity, deductHealth: (amt) => this.integrity -= amt };
        }

        return closest;
    }

    // --- DISASTER UTILS ---
    triggerCaveIn() {
        this.logger.log('WARNING', 'Seismic anomaly detected. Cave-in triggered!', 'enemy');
        let count = 0;
        for (let i = 0; i < 20; i++) {
            const x = Math.floor(Math.random() * (this.cols - 2)) + 1;
            const y = Math.floor(Math.random() * (this.rows - 2)) + 1;
            
            if (this.grid[x][y] === 0) {
                this.grid[x][y] = Math.random() < 0.7 ? 1 : 2; // Dirt or Stone
                count++;
            }
        }
        this.logger.log('SYSTEM', `Cave-in complete. ${count} blocks blocked by dirt/stone debris.`, 'system');
    }

    triggerBugSwarm() {
        this.logger.log('CRITICAL', 'Nest infestation triggered! Swarm spawning from nests.', 'enemy');
        const bugCount = 5;
        
        // Find all nest coordinates
        let nestTiles = [];
        for (let x = 0; x < this.cols; x++) {
            for (let y = 0; y < this.rows; y++) {
                if (this.grid[x][y] === 9) nestTiles.push({x, y});
            }
        }
        
        if (nestTiles.length === 0) nestTiles.push({x: 1, y: 1});

        for (let i = 0; i < bugCount; i++) {
            const sp = nestTiles[Math.floor(Math.random() * nestTiles.length)];
            this.enemies.push(new Enemy(sp.x, sp.y));
        }
    }

    triggerSolarEclipse() {
        this.logger.log('WARNING', 'Atmospheric solar storm. Primary Solar Collector offline.', 'enemy');
        this.power = Math.max(10, this.power - 40);
        this.oxygen = Math.max(30, this.oxygen - 30);
    }

    // --- GAME STEP UPDATE ---
    update() {
        this.ticks++;

        // Step Citizens
        this.citizens.forEach(citizen => {
            if (citizen.hp > 0) {
                citizen.update(this);
            }
        });

        // Step Enemies
        this.enemies.forEach((enemy, index) => {
            if (enemy.hp <= 0) {
                this.enemies.splice(index, 1);
                this.logger.log('SYSTEM', 'Basalt bug neutralized by colony defenses.', 'system');
            } else {
                enemy.update(this);
            }
        });

        // Remove dead citizens
        this.citizens = this.citizens.filter(c => c.hp > 0);

        // Core Attack logic
        this.enemies.forEach(enemy => {
            const distToCore = Math.abs(enemy.x - 20) + Math.abs(enemy.y - 15);
            if (distToCore <= 2) {
                this.integrity = Math.max(0, this.integrity - 0.25 * this.timeScale);
                if (this.ticks % 25 === 0) {
                    this.logger.log('CORE', `Core Core Shield Integrity critical: ${Math.floor(this.integrity)}%`, 'enemy');
                }
            }
        });

        // Auto Turrets defense mechanics
        this.turretTargets.clear();
        for (let x = 0; x < this.cols; x++) {
            for (let y = 0; y < this.rows; y++) {
                if (this.grid[x][y] === 6) { // Auto Turret
                    // Search closest enemy in range (5 cells)
                    let targetEnemy = null;
                    let minDist = Infinity;
                    
                    for (const enemy of this.enemies) {
                        const dist = Math.abs(x - enemy.x) + Math.abs(y - enemy.y);
                        if (dist <= 6 && dist < minDist) {
                            minDist = dist;
                            targetEnemy = enemy;
                        }
                    }

                    if (targetEnemy) {
                        const dmg = this.tech.plasma ? 4 : 2;
                        targetEnemy.hp -= dmg; // Damage enemy
                        this.turretTargets.set(`${x},${y}`, targetEnemy);
                    }
                }
            }
        }

        // Resource & Power Regen / Drain
        if (this.ticks % 10 === 0) {
            // Power Nodes increase oxygen levels
            let generatorCount = 0;
            for (let x = 0; x < this.cols; x++) {
                for (let y = 0; y < this.rows; y++) {
                    if (this.grid[x][y] === 7) generatorCount++;
                }
            }

            this.oxygen = Math.min(100, this.oxygen - 0.5 + (generatorCount * 0.4));
            this.power = Math.min(100, this.power - 0.2 + (generatorCount * 0.3));
        }

        // Random Bug spawn from Nests
        if (this.ticks % 300 === 0 && this.enemies.length < 5) {
            let nestTiles = [];
            for (let x = 0; x < this.cols; x++) {
                for (let y = 0; y < this.rows; y++) {
                    if (this.grid[x][y] === 9) nestTiles.push({x, y});
                }
            }
            if (nestTiles.length > 0) {
                const sp = nestTiles[Math.floor(Math.random() * nestTiles.length)];
                this.enemies.push(new Enemy(sp.x, sp.y));
                this.logger.log('SYSTEM', 'Seismic radar scans detect underground movement near a Nest.', 'system');
            }
        }

        this.ui.updateGauges();
    }

    // --- CANVAS RENDER ENGINE ---
    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw Grid Terrain
        for (let x = 0; x < this.cols; x++) {
            for (let y = 0; y < this.rows; y++) {
                const cell = this.grid[x][y];
                const px = x * this.cellSize;
                const py = y * this.cellSize;

                switch (cell) {
                    case 0: // Empty Tunnel
                        this.ctx.fillStyle = '#06090e';
                        this.ctx.fillRect(px, py, this.cellSize, this.cellSize);
                        break;
                    case 1: // Dirt
                        this.ctx.fillStyle = '#451a03';
                        this.ctx.fillRect(px, py, this.cellSize, this.cellSize);
                        break;
                    case 2: // Stone
                        this.ctx.fillStyle = '#1e293b';
                        this.ctx.fillRect(px, py, this.cellSize, this.cellSize);
                        break;
                    case 3: // Gold
                        this.ctx.fillStyle = '#fbbf24';
                        this.ctx.fillRect(px, py, this.cellSize, this.cellSize);
                        break;
                    case 4: // Crystal
                        this.ctx.fillStyle = '#c084fc';
                        this.ctx.fillRect(px, py, this.cellSize, this.cellSize);
                        break;
                    case 5: // Base Core
                        this.ctx.fillStyle = '#0f172a';
                        this.ctx.fillRect(px, py, this.cellSize, this.cellSize);
                        
                        this.ctx.strokeStyle = '#38bdf8';
                        this.ctx.strokeRect(px, py, this.cellSize, this.cellSize);
                        break;
                    case 6: // Auto Turret
                        this.ctx.fillStyle = '#334155';
                        this.ctx.fillRect(px, py, this.cellSize, this.cellSize);
                        
                        // Draw turret gun circle
                        this.ctx.fillStyle = '#64748b';
                        this.ctx.beginPath();
                        this.ctx.arc(px + 10, py + 10, 6, 0, Math.PI * 2);
                        this.ctx.fill();
                        
                        this.ctx.strokeStyle = '#f87171';
                        this.ctx.lineWidth = 2;
                        this.ctx.strokeRect(px + 2, py + 2, 16, 16);
                        this.ctx.lineWidth = 1;
                        break;
                    case 7: // Power Node
                        this.ctx.fillStyle = '#1e1b4b';
                        this.ctx.fillRect(px, py, this.cellSize, this.cellSize);
                        
                        // Bolt visual
                        this.ctx.fillStyle = '#38bdf8';
                        this.ctx.beginPath();
                        this.ctx.moveTo(px + 10, py + 3);
                        this.ctx.lineTo(px + 14, py + 10);
                        this.ctx.lineTo(px + 10, py + 10);
                        this.ctx.lineTo(px + 10, py + 17);
                        this.ctx.lineTo(px + 6, py + 10);
                        this.ctx.lineTo(px + 10, py + 10);
                        this.ctx.closePath();
                        this.ctx.fill();
                        break;
                    case 8: // Planned build blueprint
                        this.ctx.strokeStyle = '#fb923c';
                        this.ctx.strokeRect(px + 2, py + 2, 16, 16);
                        break;
                    case 9: // Nest
                        this.ctx.fillStyle = '#450a0a';
                        this.ctx.fillRect(px, py, this.cellSize, this.cellSize);
                        // organic veins
                        this.ctx.strokeStyle = '#ef4444';
                        this.ctx.beginPath();
                        this.ctx.moveTo(px + 2, py + 10);
                        this.ctx.lineTo(px + 8, py + 5);
                        this.ctx.lineTo(px + 14, py + 15);
                        this.ctx.lineTo(px + 18, py + 10);
                        this.ctx.stroke();
                        break;
                }

                // Grid lines (subtle overlay)
                this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.015)';
                this.ctx.strokeRect(px, py, this.cellSize, this.cellSize);

                // Fog of War Overlay
                if (!this.godMode && this.fogMap[x][y] === 0) {
                    this.ctx.fillStyle = '#000000';
                    this.ctx.fillRect(px, py, this.cellSize, this.cellSize);
                }
            }
        }

        // Draw turret fire lines
        this.turretTargets.forEach((enemy, key) => {
            const [tx, ty] = key.split(',').map(Number);
            this.ctx.strokeStyle = 'rgba(248, 113, 113, 0.4)';
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            this.ctx.moveTo(tx * this.cellSize + 10, ty * this.cellSize + 10);
            this.ctx.lineTo(enemy.x * this.cellSize + 10, enemy.y * this.cellSize + 10);
            this.ctx.stroke();
            this.ctx.lineWidth = 1;
        });

        // Draw Citizens
        this.citizens.forEach(citizen => {
            if (!this.godMode && citizen.x >= 0 && citizen.x < this.cols && citizen.y >= 0 && citizen.y < this.rows) {
                if (this.fogMap[citizen.x][citizen.y] === 0) return; // Hide if in fog
            }

            const px = citizen.x * this.cellSize + 10;
            const py = citizen.y * this.cellSize + 10;

            // Base dot
            this.ctx.fillStyle = citizen.color;
            this.ctx.beginPath();
            this.ctx.arc(px, py, 6, 0, Math.PI * 2);
            this.ctx.fill();

            // Highlight border if active / pathing
            if (citizen.state !== 'idle' && citizen.state !== 'resting') {
                this.ctx.strokeStyle = '#ffffff';
                this.ctx.beginPath();
                this.ctx.arc(px, py, 8, 0, Math.PI * 2);
                this.ctx.stroke();
            }

            // Energy Bar above head
            const barW = 12;
            const energyPercent = citizen.energy / citizen.maxEnergy;
            this.ctx.fillStyle = 'rgba(0,0,0,0.5)';
            this.ctx.fillRect(px - 6, py - 12, barW, 2);
            this.ctx.fillStyle = citizen.color;
            this.ctx.fillRect(px - 6, py - 12, barW * energyPercent, 2);
        });

        // Draw Enemies
        this.enemies.forEach(enemy => {
            if (!this.godMode && enemy.x >= 0 && enemy.x < this.cols && enemy.y >= 0 && enemy.y < this.rows) {
                if (this.fogMap[enemy.x][enemy.y] === 0) return; // Hide if in fog
            }

            const px = enemy.x * this.cellSize + 10;
            const py = enemy.y * this.cellSize + 10;

            // Bug dot
            this.ctx.fillStyle = enemy.color;
            this.ctx.beginPath();
            this.ctx.arc(px, py, 6, 0, Math.PI * 2);
            this.ctx.fill();

            // Legs visual spikes
            this.ctx.strokeStyle = enemy.color;
            this.ctx.beginPath();
            this.ctx.moveTo(px - 8, py - 4); this.ctx.lineTo(px + 8, py + 4);
            this.ctx.moveTo(px - 8, py + 4); this.ctx.lineTo(px + 8, py - 4);
            this.ctx.stroke();
        });
    }

    // --- GAME ENGINE LOOP ---
    loop() {
        // Multi step based on timeScale speed multiplier
        for (let i = 0; i < this.timeScale; i++) {
            this.update();
        }
        
        this.draw();
        
        requestAnimationFrame(() => this.loop());
    }
}

// Start simulation on load
window.addEventListener('load', () => {
    new GameEngine();
});
