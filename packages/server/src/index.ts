import express from 'express';
import { createServer } from 'node:http';
import { setupWebSocketServer } from './ws/server.js';
//import { create } from 'node:domain';
import { getWorld } from './game/world.js';
import { createAdminRouter } from './http/admin.js';


const PORT = Number(process.env.PORT ?? 3000);

const app = express();
const server = createServer(app);
setupWebSocketServer(server);


// app.get('/', (_req, res) => {
//   res.send('game server is running');
// });

app.use(express.json());
app.use('/api/admin', createAdminRouter());

server.listen(PORT, () => {
  console.log(`[server] listening on http://localhost:${PORT}`);
});




app.get('/', (_req, res) => {
  res.send('game server is running');
});

//Worldの状態保存
app.get('/api/debug/state', (_req, res) => {
  const world = getWorld();
  res.json({
    initialized: world.initialized,
    running: world.running,
    params: world.params,
    map: world.map,
    playerCount: world.players.size,        // プレイヤ数
    players: Array.from(world.players.values()),  // プレイヤ一覧
  });
});