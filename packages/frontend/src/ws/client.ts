import type { ClientMessage, ServerMessage } from '@game/shared';

export class GameClient {
  private ws: WebSocket | null = null;

  // 接続する。メッセージを受け取ったときに呼ぶコールバックを受け取る
  connect(onMessage: (msg: ServerMessage) => void): void {
    this.ws = new WebSocket('ws://localhost:3000');

    this.ws.onopen = () => {
      console.log('接続した');
    };

    this.ws.onmessage = (event) => {
      const msg = JSON.parse(event.data) as ServerMessage;
      onMessage(msg);   // 受け取ったメッセージをコールバックに渡す
    };

    this.ws.onclose = () => {
      console.log('切断された');
    };
  }

  // メッセージを送る
  send(msg: ClientMessage): void {
    // ws が接続済みなら JSON にして送る
    if (this.ws && this.ws.readyState === WebSocket.OPEN){
      this.ws.send(JSON.stringify(msg));
    }
    else {
      console.warn('[client] not connected, cannot send');
    }
  }

  //切断処理
  disconnect(): void{
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}