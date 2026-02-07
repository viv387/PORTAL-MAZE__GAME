// =======================================================
//                     SOLVER MODULE (FIXED)
// =======================================================

import { inBounds } from "./config.js";

const DIRS = [
    [1, 0], [-1, 0],
    [0, 1], [0, -1]
];

// Build portal map: { color: [p1, p2] }
function buildPortalMap(grid) {
    const portals = {};
    for (let y = 0; y < grid.length; y++) {
        for (let x = 0; x < grid[0].length; x++) {
            const c = grid[y][x];
            if (typeof c === "object" && c.portal) {
                portals[c.portal] ??= [];
                portals[c.portal].push({ x, y });
            }
        }
    }
    return portals;
}

function getOtherPortal(portals, color, x, y) {
    const pair = portals[color];
    if (!pair || pair.length !== 2) return null;
    return (pair[0].x === x && pair[0].y === y) ? pair[1] : pair[0];
}

// -------------------------------------------------------
// BFS WITH EXPLICIT TELEPORT STEP
// -------------------------------------------------------
export function shortestPath(grid, start, goal, maxBreaks) {

    const H = grid.length;
    const W = grid[0].length;

    const portals = buildPortalMap(grid);

    const visited = Array.from({ length: H }, () =>
        Array.from({ length: W }, () =>
            Array(maxBreaks + 1).fill(false)
        )
    );

    const queue = [{
        x: start.x,
        y: start.y,
        breaks: 0,
        dist: 0
    }];

    visited[start.y][start.x][0] = true;

    let head = 0;
    while (head < queue.length) {
        const cur = queue[head++];

        // GOAL
        if (cur.x === goal.x && cur.y === goal.y) {
            return cur.dist;
        }

        const here = grid[cur.y][cur.x];

        // ---------------------------
        // TELEPORT AS A SEPARATE STEP
        // ---------------------------
        if (typeof here === "object" && here.portal) {
            const exit = getOtherPortal(portals, here.portal, cur.x, cur.y);
            if (exit && !visited[exit.y][exit.x][cur.breaks]) {
                visited[exit.y][exit.x][cur.breaks] = true;
                queue.push({
                    x: exit.x,
                    y: exit.y,
                    breaks: cur.breaks,
                    dist: cur.dist + 1   // ✅ teleport costs 1 step
                });
            }
        }

        // ---------------------------
        // NORMAL MOVEMENT
        // ---------------------------
        for (const [dx, dy] of DIRS) {
            const nx = cur.x + dx;
            const ny = cur.y + dy;

            if (!inBounds(nx, ny)) continue;

            const cell = grid[ny][nx];

            // WALL
            if (cell === 1) {
                if (cur.breaks < maxBreaks && !visited[ny][nx][cur.breaks + 1]) {
                    visited[ny][nx][cur.breaks + 1] = true;
                    queue.push({
                        x: nx,
                        y: ny,
                        breaks: cur.breaks + 1,
                        dist: cur.dist + 1
                    });
                }
                continue;
            }

            // NORMAL MOVE (including onto portal)
            if (!visited[ny][nx][cur.breaks]) {
                visited[ny][nx][cur.breaks] = true;
                queue.push({
                    x: nx,
                    y: ny,
                    breaks: cur.breaks,
                    dist: cur.dist + 1
                });
            }
        }
    }

    return null;
}
