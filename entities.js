/**
 * Entities Model & State Machines for DeepCore Swarm Arena
 */

class BaseEntity {
    constructor(id, name, type, x, y, color) {
        this.id = id;
        this.name = name;
        this.type = type;
        this.x = x;
        this.y = y;
        this.color = color;
        this.energy = 100;
        this.maxEnergy = 100;
        this.hp = 100;
        this.maxHp = 100;
        this.state = 'idle';
        this.path = null;
        this.target = null;
        this.lastActionTime = 0;
    }

    stepTowardsTarget() {
        if (!this.path || this.path.length === 0) return false;
        
        const nextPos = this.path.shift();
        this.x = nextPos.x;
        this.y = nextPos.y;
        return true;
    }

    findClosestDepot(grid) {
        // Base Depot Core is typically at (20, 15)
        return { x: 20, y: 15 };
    }
}

// --- MINER AGENT ---
class Miner extends BaseEntity {
    constructor(id, name, x, y) {
        super(id, name, 'miner', x, y, '#eab308');
        this.goldCarrying = 0;
        this.crystalsCarrying = 0;
        this.capacity = 20;
    }

    update(game) {
        const currentTime = game.ticks;
        
        // State: Resting
        if (this.state === 'resting') {
            const depot = this.findClosestDepot(game.grid);
            if (this.x === depot.x && this.y === depot.y) {
                this.energy = Math.min(this.maxEnergy, this.energy + 5);
                if (this.energy === this.maxEnergy) {
                    this.state = 'idle';
                    game.logger.log(this.name, 'Miner fully recharged. Returning to duties.', 'miner');
                }
            } else {
                if (!this.path) {
                    this.path = Pathfinding.findPath(game.grid, this, depot, game.isPassable.bind(game));
                }
                this.stepTowardsTarget();
            }
            return;
        }

        // Low Energy Trigger
        if (this.energy < 15) {
            this.state = 'resting';
            this.path = null;
            this.target = null;
            game.logger.log(this.name, 'Low energy warning. Heading back to Base Depot to charge.', 'miner');
            return;
        }

        // Full Load Trigger
        if (this.goldCarrying + this.crystalsCarrying >= this.capacity) {
            if (this.state !== 'moving_to_depot') {
                this.state = 'moving_to_depot';
                this.target = this.findClosestDepot(game.grid);
                this.path = Pathfinding.findPath(game.grid, this, this.target, game.isPassable.bind(game));
                game.logger.log(this.name, `Depositories full. Transporting resources back to Core Depot.`, 'miner');
            }
        }

        // State Action Routing
        switch (this.state) {
            case 'idle':
                // Find nearest resources
                const closestResource = game.findClosestResource(this);
                if (closestResource) {
                    this.target = closestResource;
                    this.state = 'moving_to_resource';
                    this.path = Pathfinding.findPath(game.grid, this, closestResource, game.isPassable.bind(game));
                    game.logger.log(this.name, `New target locked: ${closestResource.type === 3 ? 'Gold' : 'Crystal'} vein at [${closestResource.x}, ${closestResource.y}].`, 'miner');
                }
                break;

            case 'moving_to_resource':
                if (this.path && this.path.length > 0) {
                    // Check if adjacent to resource
                    const distance = Math.abs(this.x - this.target.x) + Math.abs(this.y - this.target.y);
                    if (distance <= 1) {
                        this.state = 'harvesting';
                        this.path = null;
                    } else {
                        this.stepTowardsTarget();
                    }
                } else {
                    this.state = 'idle'; // Path recalculate
                }
                break;

            case 'harvesting':
                // Check if target still has resources
                const type = game.grid[this.target.x][this.target.y];
                if (type !== 3 && type !== 4) {
                    this.state = 'idle';
                    this.target = null;
                    break;
                }

                // Mine resource
                this.energy -= 2;
                if (type === 3) {
                    this.goldCarrying += 2;
                } else {
                    this.crystalsCarrying += 1;
                }

                // Deduct from grid vein resource density
                game.mineResourceNode(this.target.x, this.target.y);

                if (this.goldCarrying + this.crystalsCarrying >= this.capacity) {
                    this.state = 'moving_to_depot';
                    this.target = this.findClosestDepot(game.grid);
                    this.path = Pathfinding.findPath(game.grid, this, this.target, game.isPassable.bind(game));
                }
                break;

            case 'moving_to_depot':
                if (this.x === this.target.x && this.y === this.target.y) {
                    // Deposit
                    game.gold += this.goldCarrying;
                    game.crystals += this.crystalsCarrying;
                    game.logger.log(this.name, `Deposited +${this.goldCarrying} Gold, +${this.crystalsCarrying} Crystals.`, 'miner');
                    this.goldCarrying = 0;
                    this.crystalsCarrying = 0;
                    this.state = 'idle';
                    this.target = null;
                } else {
                    if (!this.path) {
                        this.path = Pathfinding.findPath(game.grid, this, this.target, game.isPassable.bind(game));
                    }
                    this.stepTowardsTarget();
                }
                break;
        }
    }
}

// --- BUILDER AGENT ---
class Builder extends BaseEntity {
    constructor(id, name, x, y) {
        super(id, name, 'builder', x, y, '#a855f7');
        this.constructionTimer = 0;
        this.currentBuildTarget = null;
    }

    update(game) {
        if (this.state === 'resting') {
            const depot = this.findClosestDepot(game.grid);
            if (this.x === depot.x && this.y === depot.y) {
                this.energy = Math.min(this.maxEnergy, this.energy + 5);
                if (this.energy === this.maxEnergy) {
                    this.state = 'idle';
                    game.logger.log(this.name, 'Fully charged. Ready for new blueprints.', 'builder');
                }
            } else {
                if (!this.path) {
                    this.path = Pathfinding.findPath(game.grid, this, depot, game.isPassable.bind(game));
                }
                this.stepTowardsTarget();
            }
            return;
        }

        if (this.energy < 15) {
            this.state = 'resting';
            this.path = null;
            this.currentBuildTarget = null;
            game.logger.log(this.name, 'Low energy limit. Returning to depot base.', 'builder');
            return;
        }

        switch (this.state) {
            case 'idle':
                // Check if building commands are waiting in queue
                if (game.buildQueue.length > 0) {
                    const task = game.buildQueue.shift();
                    this.currentBuildTarget = task;
                    this.state = 'moving_to_build';
                    this.path = Pathfinding.findPath(game.grid, this, task.pos, game.isPassable.bind(game));
                    game.logger.log(this.name, `New construction assigned: ${task.type === 6 ? 'Turret' : 'Generator'} at [${task.pos.x}, ${task.pos.y}].`, 'builder');
                }
                break;

            case 'moving_to_build':
                if (this.path && this.path.length > 0) {
                    const distance = Math.abs(this.x - this.currentBuildTarget.pos.x) + Math.abs(this.y - this.currentBuildTarget.pos.y);
                    if (distance <= 1) {
                        this.state = 'building';
                        this.constructionTimer = 40; // ~40 frames to construct
                        this.path = null;
                    } else {
                        this.stepTowardsTarget();
                    }
                } else {
                    // Recalculate path or drop
                    this.state = 'idle';
                }
                break;

            case 'building':
                this.constructionTimer--;
                this.energy -= 1;
                
                if (this.constructionTimer <= 0) {
                    // Place building structure onto grid
                    game.placeStructure(this.currentBuildTarget.pos.x, this.currentBuildTarget.pos.y, this.currentBuildTarget.type);
                    game.logger.log(this.name, `Completed construction of ${this.currentBuildTarget.type === 6 ? 'Auto-Turret' : 'Power Node'}.`, 'builder');
                    this.state = 'idle';
                    this.currentBuildTarget = null;
                }
                break;
        }
    }
}

// --- GUARD AGENT ---
class Guard extends BaseEntity {
    constructor(id, name, x, y) {
        super(id, name, 'guard', x, y, '#38bdf8');
        this.patrolIndex = 0;
        this.patrolRoute = [
            { x: 12, y: 8 }, { x: 28, y: 8 }, { x: 28, y: 22 }, { x: 12, y: 22 }
        ];
    }

    update(game) {
        if (this.state === 'resting') {
            const depot = this.findClosestDepot(game.grid);
            if (this.x === depot.x && this.y === depot.y) {
                this.hp = Math.min(this.maxHp, this.hp + 5);
                this.energy = Math.min(this.maxEnergy, this.energy + 5);
                if (this.hp === this.maxHp && this.energy === this.maxEnergy) {
                    this.state = 'patrolling';
                    game.logger.log(this.name, 'Fully healed & combat-ready. Return to defensive patrol.', 'guard');
                }
            } else {
                if (!this.path) {
                    this.path = Pathfinding.findPath(game.grid, this, depot, game.isPassable.bind(game));
                }
                this.stepTowardsTarget();
            }
            return;
        }

        // Check health & energy boundaries
        if (this.hp < 25 || this.energy < 15) {
            this.state = 'resting';
            this.path = null;
            this.target = null;
            game.logger.log(this.name, `Low structural integrity (${this.hp}% HP). Retreating to base for repair.`, 'guard');
            return;
        }

        // Scan for hostile bugs nearby
        const closestBug = game.findClosestEnemy(this);
        if (closestBug) {
            const distance = Math.abs(this.x - closestBug.x) + Math.abs(this.y - closestBug.y);
            if (distance < 8) {
                this.target = closestBug;
                this.state = 'combat';
                this.path = null;
            }
        }

        switch (this.state) {
            case 'patrolling':
                if (this.path && this.path.length > 0) {
                    this.stepTowardsTarget();
                } else {
                    const targetPatrol = this.patrolRoute[this.patrolIndex];
                    this.path = Pathfinding.findPath(game.grid, this, targetPatrol, game.isPassable.bind(game));
                    this.patrolIndex = (this.patrolIndex + 1) % this.patrolRoute.length;
                }
                break;

            case 'combat':
                if (!this.target || this.target.hp <= 0) {
                    this.state = 'patrolling';
                    this.target = null;
                    break;
                }

                const distance = Math.abs(this.x - this.target.x) + Math.abs(this.y - this.target.y);
                if (distance <= 1) {
                    // Deal damage
                    this.target.hp -= 15;
                    this.energy -= 3;
                    game.logger.log(this.name, `Engaging Basalt Bug. Target HP: ${this.target.hp}.`, 'guard');
                } else {
                    // Recalculate path to moving enemy target
                    this.path = Pathfinding.findPath(game.grid, this, this.target, game.isPassable.bind(game));
                    this.stepTowardsTarget();
                }
                break;
        }
    }
}

// --- BASALT BUG (ENEMY) ---
class Enemy {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.hp = 50;
        this.maxHp = 50;
        this.type = 'enemy';
        this.color = '#f87171';
        this.path = null;
        this.target = null;
    }

    update(game) {
        // Target nearest citizen or core building structure
        const closestCitizen = game.findClosestCitizen(this);
        if (!closestCitizen) return;

        this.target = closestCitizen;
        const distance = Math.abs(this.x - this.target.x) + Math.abs(this.y - this.target.y);

        if (distance <= 1) {
            // Deal damage to citizen
            this.target.hp -= 10;
        } else {
            // Path towards citizen target
            if (!this.path || game.ticks % 10 === 0) {
                this.path = Pathfinding.findPath(game.grid, this, this.target, game.isPassable.bind(game));
            }
            
            if (this.path && this.path.length > 0) {
                const nextPos = this.path.shift();
                this.x = nextPos.x;
                this.y = nextPos.y;
            }
        }
    }
}

// --- SCOUT AGENT ---
class Scout extends BaseEntity {
    constructor(id, name, x, y) {
        super(id, name, 'scout', x, y, '#22c55e'); // Green
        this.visionRadius = 5;
    }

    update(game) {
        if (this.state === 'resting') {
            const depot = this.findClosestDepot(game.grid);
            if (this.x === depot.x && this.y === depot.y) {
                this.energy = Math.min(this.maxEnergy, this.energy + 5);
                if (this.energy === this.maxEnergy) {
                    this.state = 'idle';
                    game.logger.log(this.name, 'Scout recharged. Resuming mapping operations.', 'scout');
                }
            } else {
                if (!this.path) {
                    this.path = Pathfinding.findPath(game.grid, this, depot, game.isPassable.bind(game));
                }
                this.stepTowardsTarget();
            }
            return;
        }

        if (this.energy < 15) {
            this.state = 'resting';
            this.path = null;
            this.target = null;
            return;
        }

        // Reveal Fog of War
        if (game.revealFog) {
            game.revealFog(this.x, this.y, this.visionRadius);
        }

        // Movement logic: Pick random unrevealed or empty tile to explore
        if (this.state === 'idle' || (!this.path || this.path.length === 0)) {
            // Pick a random destination
            let destX = Math.floor(Math.random() * game.cols);
            let destY = Math.floor(Math.random() * game.rows);
            // Must be passable to set as target
            if (game.isPassable(destX, destY)) {
                this.target = { x: destX, y: destY };
                this.path = Pathfinding.findPath(game.grid, this, this.target, game.isPassable.bind(game));
                this.state = 'exploring';
            }
        }

        if (this.state === 'exploring' && this.path && this.path.length > 0) {
            this.energy -= 0.5;
            this.stepTowardsTarget();
        }
    }
}

// --- RESEARCHER AGENT ---
class Researcher extends BaseEntity {
    constructor(id, name, x, y) {
        super(id, name, 'researcher', x, y, '#f8fafc'); // White
    }

    update(game) {
        // Idles near the core, consumes crystals to make science points
        if (this.state === 'idle') {
            this.target = { x: 20 + Math.floor(Math.random()*3 - 1), y: 15 + Math.floor(Math.random()*3 - 1) };
            this.path = Pathfinding.findPath(game.grid, this, this.target, game.isPassable.bind(game));
            this.state = 'working';
        }

        if (this.state === 'working') {
            if (this.path && this.path.length > 0) {
                this.stepTowardsTarget();
            } else {
                // Generate science points
                if (game.ticks % 20 === 0 && game.crystals >= 1 && game.power > 20) {
                    game.crystals -= 1;
                    game.power -= 2;
                    game.sciencePoints = (game.sciencePoints || 0) + 1;
                    
                    // Small chance to log
                    if (Math.random() < 0.1) {
                        game.logger.log(this.name, 'Analyzing crystal structures. +1 Science Point.', 'system');
                    }
                }
                
                // Randomly move around core
                if (Math.random() < 0.05) {
                    this.state = 'idle';
                }
            }
        }
    }
}
