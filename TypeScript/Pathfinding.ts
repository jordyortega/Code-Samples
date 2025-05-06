import helper from "../helper";

type Tile = {
    value: number;
};

type TileManager = {
    getTile(regionId: number, x: number, y: number, z: number): Tile | null;
};

type Entity = {
    x: number;
    y: number;
    z: number;
    regionId: number;
};

type Point = { x: number; y: number };

class Pathfinding {
    private tileManager: TileManager;

    constructor(tileManager: TileManager) {
        this.tileManager = tileManager;
    }

    findPath(entity: Entity, startX: number, startY: number, targetX: number, targetY: number): Point[] {
        const openSet: Set<string> = new Set();
        const cameFrom: Map<string, string> = new Map();
        const gScore: Map<string, number> = new Map();
        const fScore: Map<string, number> = new Map();

        const startKey = `${startX}:${startY}`;
        const targetKey = `${targetX}:${targetY}`;

        gScore.set(startKey, 0);
        fScore.set(startKey, this.heuristic(startX, startY, targetX, targetY));

        openSet.add(startKey);

        const MAX_ITERATIONS = 500;
        let iterationCount = 0;

        while (openSet.size > 0) {
            if (iterationCount++ >= MAX_ITERATIONS) {
                console.warn("Pathfinding stopped: Max iterations reached, no path found.");
                return [];
            }

            const currentKey = this.getLowestFScoreKey(openSet, fScore);
            const [currentX, currentY] = currentKey.split(":").map(Number);

            if (currentKey === targetKey) {
                return this.reconstructPath(cameFrom, currentKey);
            }

            openSet.delete(currentKey);

            for (const [neighborX, neighborY] of this.getNeighbors(currentX, currentY)) {
                const isDiagonal = currentX !== neighborX && currentY !== neighborY;

                const targetTile = this.tileManager.getTile(entity.regionId, neighborX, neighborY, entity.z);
                if (targetTile && targetTile.value === 0x200000) {
                    continue;
                }

                if (
                    isDiagonal &&
                    (this.isBlockedForDiagonal(entity, currentX, neighborY) || this.isBlockedForDiagonal(entity, neighborX, currentY))
                ) {
                    continue;
                }

                const neighborKey = `${neighborX}:${neighborY}`;
                const tentativeGScore = (gScore.get(currentKey) ?? Infinity) + (isDiagonal ? Math.SQRT2 : 1);

                if (tentativeGScore < (gScore.get(neighborKey) ?? Infinity)) {
                    cameFrom.set(neighborKey, currentKey);
                    gScore.set(neighborKey, tentativeGScore);
                    fScore.set(
                        neighborKey,
                        tentativeGScore + this.heuristic(neighborX, neighborY, targetX, targetY)
                    );

                    openSet.add(neighborKey);
                }
            }
        }

        console.warn("Pathfinding failed: No path found.");
        return [];
    }

    private isBlockedForDiagonal(entity: Entity, x: number, y: number): boolean {
        const tile = this.tileManager.getTile(entity.regionId, x, y, entity.z);
        return !!tile && tile.value === 0x200000;
    }

    private heuristic(x1: number, y1: number, x2: number, y2: number): number {
        return Math.abs(x1 - x2) + Math.abs(y1 - y2);
    }

    private getLowestFScoreKey(openSet: Set<string>, fScore: Map<string, number>): string {
        let lowestKey = "";
        let lowestScore = Infinity;

        for (const key of openSet) {
            const score = fScore.get(key) ?? Infinity;
            if (score < lowestScore) {
                lowestScore = score;
                lowestKey = key;
            }
        }

        return lowestKey;
    }

    private reconstructPath(cameFrom: Map<string, string>, currentKey: string): Point[] {
        const path: Point[] = [];
        while (cameFrom.has(currentKey)) {
            const [x, y] = currentKey.split(":").map(Number);
            path.push({ x, y });
            currentKey = cameFrom.get(currentKey)!;
        }
        return path.reverse();
    }

    private getNeighbors(x: number, y: number): [number, number][] {
        return [
            [x + 1, y],
            [x - 1, y],
            [x, y + 1],
            [x, y - 1],
            [x + 1, y + 1],
            [x - 1, y + 1],
            [x + 1, y - 1],
            [x - 1, y - 1],
        ];
    }

    canWalkTo(entity: Entity, targetX: number, targetY: number): boolean {
        if (helper.isEmpty(entity)) {
            return false;
        }

        const { x: startX, y: startY, z, regionId } = entity;

        if (startX === targetX && startY === targetY) {
            return true;
        }

        const targetTile = this.tileManager.getTile(regionId, targetX, targetY, z);
        if (targetTile && targetTile.value === 0x200000) {
            return false;
        }

        const deltaX = Math.sign(targetX - startX);
        const deltaY = Math.sign(targetY - startY);

        if (deltaX !== 0 && deltaY !== 0) {
            if (
                this.isBlocked(startX, startY + deltaY, entity) ||
                this.isBlocked(startX + deltaX, startY, entity)
            ) {
                return false;
            }
        }

        return true;
    }

    private isBlocked(x: number, y: number, entity: Entity): boolean {
        const tile = this.tileManager.getTile(entity.regionId, x, y, entity.z);
        return !!tile && tile.value === 0x200000;
    }
}

export default Pathfinding;
