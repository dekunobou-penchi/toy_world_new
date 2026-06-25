
import type{
    Action,
    GameParams,
    MapMeta,
    Player,
    Profile,
    ViewCell,
} from './domain.js'
import type { ErrorCode, ResultCode} from './constants.js'

/** system message */
export interface SysMsg {
    code: ResultCode;
    text: string;
}

// client to server
/** Registration for participation */
export interface JoinMessage {
    type: 'join';
    profile: Profile;
    /** 再接続時　uid */
    uid?: string;
}

/** アクション選択 */
export interface ActionMessage {
    type: 'action';
    action: Action;
}

export type ClientMessage = JoinMessage | ActionMessage;

// server to client
/** 参加成功 */
export interface JoinedMessage {
    type: 'joined';
    uid: string;
    you: Player;
    map: MapMeta;
    params: GameParams;
}

/** 参加失敗 */
export interface JoinFailedMessage {
  type: 'join_failed';
  reason: 'map_not_ready' | 'full';
  text: string;
}

/** 状態更新（ティックごとに配信） */
export interface StateMessage {
  type: 'state';
  you: Player;
  view: ViewCell[];
  sysmsg: SysMsg | null;
}

/** エラー */
export interface ErrorMessage {
  type: 'error';
  code: ErrorCode;
  text: string;
  /** どのメッセージに対するエラーか（任意） */
  context?: string;
}

export type ServerMessage =
  | JoinedMessage
  | JoinFailedMessage
  | StateMessage
  | ErrorMessage;

