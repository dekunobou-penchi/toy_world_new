import type { GameParams, Player, Position} from "@game/shared";

export interface World {
    initialized: boolean;
    running: boolean;
    params: GameParams | null;
    map: {
        nx: number;
        ny: number;
        blockMax: number;
        data: number[][];
    } | null;
    players: Map<string, Player>;
}

export function createWorld(): World {
    return {
        initialized: false, running: false, params: null, map: null, players: new Map()
    }
}

let world: World | null = null;

export function getWorld(): World {
  if (world === null) {
    world = createWorld();
  }
  return world;
}

//mapの生成（ランダム）
export function generateMap(
  nx: number,
  ny: number,
  blockMin: number,
  blockMax: number
): number[][] {
  const data: number[][] = [];
  //blockMin = 0;
  //blockMax = 0;
  for (let y = 0; y < ny; y++) {
    const row: number[] = [];
    for (let x = 0; x < nx; x++) {
      // row に ランダムなブロックID を push
      row.push(Math.floor(Math.random() * (blockMax - blockMin) + blockMin));
    }
    data.push(row);
  }
  return data;
}

//worldの初期化
export function initWorld(params: GameParams): void {
  const world = getWorld();
  world.params = params;
  world.map = {
    nx: params.map.nx,
    ny: params.map.ny,
    blockMax: params.map.blockMax,
    data: generateMap(params.map.nx, params.map.ny, params.map.blockMin, params.map.blockMax),
  };
  world.players.clear();   // (a) を採用する場合
  world.initialized = true;
}

export function findFreePosition(
  nx: number,
  ny: number,
  players: Map<string, Player>
): Position | null {
  const used = new Set<string>();
  for (const p of players.values()) {
    used.add(`${p.pos.x}, ${p.pos.y}`);
  }

  //空きマスを集める
  const free: Position[] = [];
  for(let y = 0; y < ny; y++){
    for(let x = 0; x < nx; x++){
      if(!used.has(`${x}, ${y}`)){
        free.push({x, y});
      }
    }
  }
  //空きがなければnull
  if(free.length === 0){
    return null;
  }
  //空きがあればランダムに1つ選ぶ
  return free[Math.floor(Math.random() * free.length)];
}

export function startGame(): boolean {
  const world = getWorld();
  if (!world.initialized) {
    return false;
  }
  world.running = true;
  return true;
}

export function stopGame(): void {
  const world = getWorld();
  world.running = false;
}
