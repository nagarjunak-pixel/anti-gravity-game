/**
 * A* Pathfinding Engine for DeepCore Colony Grid
 * Supports orthogonal (4-way) movement.
 */
class Pathfinding {
    static heuristic(a, b) {
        // Manhattan distance for 4-way movement
        return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
    }

    static getNeighbors(node, gridWidth, gridHeight) {
        const neighbors = [];
        const directions = [
            { x: 0, y: -1 }, // Up
            { x: 0, y: 1 },  // Down
            { x: -1, y: 0 }, // Left
            { x: 1, y: 0 }   // Right
        ];

        for (const dir of directions) {
            const nx = node.x + dir.x;
            const ny = node.y + dir.y;

            if (nx >= 0 && nx < gridWidth && ny >= 0 && ny < gridHeight) {
                neighbors.push({ x: nx, y: ny });
            }
        }

        return neighbors;
    }

    static findPath(grid, start, end, isPassableFn) {
        // Simple sanity check
        if (start.x === end.x && start.y === end.y) {
            return [];
        }

        const gridWidth = grid.length;
        const gridHeight = grid[0].length;

        // Open list is a min-heap or simple array here for grid sizes
        const openSet = [];
        const closedSet = new Set();

        const startKey = `${start.x},${start.y}`;
        const endKey = `${end.x},${end.y}`;

        const gScore = {};
        const fScore = {};
        const cameFrom = {};

        gScore[startKey] = 0;
        fScore[startKey] = this.heuristic(start, end);

        openSet.push({ pos: start, f: fScore[startKey] });

        while (openSet.length > 0) {
            // Sort to get lowest f score node
            openSet.sort((a, b) => a.f - b.f);
            const currentObj = openSet.shift();
            const current = currentObj.pos;
            const currentKey = `${current.x},${current.y}`;

            if (current.x === end.x && current.y === end.y) {
                // Reconstruct Path
                const path = [];
                let temp = currentKey;
                while (cameFrom[temp]) {
                    const parts = temp.split(',');
                    path.push({ x: parseInt(parts[0]), y: parseInt(parts[1]) });
                    temp = cameFrom[temp];
                }
                return path.reverse();
            }

            closedSet.add(currentKey);

            const neighbors = this.getNeighbors(current, gridWidth, gridHeight);
            for (const neighbor of neighbors) {
                const neighborKey = `${neighbor.x},${neighbor.y}`;

                if (closedSet.has(neighborKey)) continue;

                // Check if neighbor is passable. The end node should be passable or targetable.
                const isEnd = neighbor.x === end.x && neighbor.y === end.y;
                if (!isPassableFn(neighbor.x, neighbor.y) && !isEnd) {
                    continue;
                }

                const tentativeGScore = gScore[currentKey] + 1;

                if (gScore[neighborKey] === undefined || tentativeGScore < gScore[neighborKey]) {
                    cameFrom[neighborKey] = currentKey;
                    gScore[neighborKey] = tentativeGScore;
                    fScore[neighborKey] = gScore[neighborKey] + this.heuristic(neighbor, end);

                    // Add to openSet if not already there
                    if (!openSet.some(item => item.pos.x === neighbor.x && item.pos.y === neighbor.y)) {
                        openSet.push({ pos: neighbor, f: fScore[neighborKey] });
                    }
                }
            }
        }

        return null; // No path found
    }
}
