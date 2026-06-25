import { createContext, useState,  useEffect } from "react";
import type { ReactNode  } from "react";
import  { GameClient } from "../ws/client";
import type { Player, ServerMessage } from "@game/shared";

export interface GameContextValue {
    client: GameClient | null;
    me: Player | null;
}

export const GameContext = createContext<GameContextValue | null>(null);

export function GameProvider({ children }: { children: ReactNode}){

    const [me, setMe] = useState<Player | null>(null);
    //const clientRef = useRef<GameClient | null>(null);
    const [client, setClient] = useState<GameClient | null>(null);

    useEffect(() => {
    const c = new GameClient();
    //clientRef.current = client;

    c.connect((msg: ServerMessage) => {
      //console.log('サーバーから:', msg);
      handleServerMessage(msg);
    });

    setClient(c);

    return () => {
      c.disconnect();
    };
  }, []);

  function handleServerMessage(msg: ServerMessage) {
    if (msg.type === 'joined') {
        setMe(msg.you);
        console.log('参加成功:', msg.you);
    } else if (msg.type === 'join_failed') {
        console.warn('参加失敗:', msg.text);
    } else if (msg.type === 'state') {
        setMe(msg.you);
    } else if (msg.type === 'error') {
        console.error('エラー:', msg.text);
    }

  }

  const value: GameContextValue = {
    client,
    me,
  };

  return (
    <GameContext.Provider value={value}>
        {children}
    </GameContext.Provider>
  );
}