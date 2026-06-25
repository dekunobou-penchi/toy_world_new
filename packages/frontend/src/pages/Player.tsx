import { act, use, useContext } from "react";
import { GameContext } from "../context/GameContext";
import { Action, ACTIONS } from "@game/shared";

export function Player() {
  const ctx = useContext(GameContext);
  if(!ctx) {
    throw new Error('GameContextが見つかりません');
  }

  const me = ctx.me;

  function handleaction(action: Action) {
    const client = ctx?.client;
    if (!client) {
      return;
    }
    client.send({ type: 'action', action});
  }

  if (!me) {
    return (
      <div>
        <h2>プレイヤ画面</h2>
        <p>まだ参加していません</p>
      </div>
    );
  }
  return (
    <div>    
      <div>
        <h2>プレイヤ画面</h2>
        <p>名前: {me.profile.name}</p>
        <p>位置: ({me.pos.x}, {me.pos.y})</p>
        <p>向き: {me.dir}</p>
        <p>LP: {me.lp}</p>
        <p>保持ブロック: {me.hold}</p>
      </div>
      <h3>アクション</h3>
      <div>
        {ACTIONS.map((action) => (
          <button key={action} onClick={() => handleaction(action)}>
            {action}
          </button>
        ))}
      </div>
    </div>


  );

}