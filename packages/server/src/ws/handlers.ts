import { RawData } from "ws";
import {  type WebSocket } from 'ws';
import type {  ClientMessage, Player, JoinedMessage, JoinFailedMessage, ErrorMessage} from '@game/shared';
import { randomUUID } from 'node:crypto';
import { findFreePosition, getWorld } from '../game/world.js';
import { ERROR_CODES } from "@game/shared";


// handleMessage 関数の外、import の下あたり
const connectionToUid = new Map<WebSocket, string>();

export function handleMessage(ws: WebSocket, data: RawData): void {
        const msg = JSON.parse(data.toString()) as ClientMessage;
         if (msg.type === 'join') {
            console.log(`${msg.profile.name}`);
    
        
    
            //world情報の取得
            const world = getWorld();
            //ワールド初期化確認
            if(!world.initialized || world.params === null || world.map === null) {
              const failed: JoinFailedMessage = {
                type: 'join_failed',
                reason: 'map_not_ready',
                text: 'ゲームがまだ準備されていません',
              };
              ws.send(JSON.stringify(failed));
              return;
            }
    
            const pos = findFreePosition(world.map.nx, world.map.ny, world.players);
            
            if(pos === null) {
              const failed: JoinFailedMessage = {
                type: 'join_failed',
                reason: 'full',
                text: 'マップに空きがありません',
              };
              ws.send(JSON.stringify(failed));
              return;
            };
    
            
    
            //uidの発行
            const uid = randomUUID();
            const player: Player = {
              uid,
              profile: msg.profile,
              pos: pos,
              dir: 'N',
              lp: world.params.player.lpInitial,
              hold: 0,
              Ltime: 0,
              Ltmax: 0,
              selectedAction: null,
            };
    
            world.players.set(uid, player);
            connectionToUid.set(ws, uid); 
    
            const joined: JoinedMessage = {
              type: 'joined',
              uid,
              you: player,
              map: { nx: world.map.nx, 
                     ny: world.map.ny, 
                     blockMax: world.map.blockMax 
                    },  
              params: world.params,
            };
            ws.send(JSON.stringify(joined));
    
          };

          if (msg.type === 'action'){
            const uid = connectionToUid.get(ws);
            //joinしていないユーザーからのaction
            if(uid === undefined) {
              const err: ErrorMessage = {
                type: 'error',
                code: ERROR_CODES.not_joined,
                text: '参加していません',
              };
              ws.send(JSON.stringify(err));
              return;
            };

            const world = getWorld();
            const player = world.players.get(uid)

            //uidはあるけどplayerが見つからない
            if  (player === undefined){
              const err: ErrorMessage = {
                type: 'error',
                code: ERROR_CODES.not_joined,
                text: 'playerが見つかりません',
              };
              ws.send(JSON.stringify(err));
              return;
            }

            //選択中アクションを更新
            player.selectedAction = msg.action;
            console.log(`[ws] ${player.profile.name} selected: ${msg.action}`);
          };

}