/** 向き（北・東・南・西） */
export type Direction = 'N' | 'E' | 'S' | 'W';

/**　プレイやが選択できるアクション */
export type Action =
    | 'N'
    | 'E'
    | 'S'
    | 'W'
    | 'forward'
    | 'get'
    | 'eat'
    | 'put'
    | 'fusion';

/** 性別 */
export type Gender = 'male' | 'female' | 'na';

/** 座標 */
export interface Position {
    x: number;
    y: number;
}

/** プレイヤーのプロフィール */
export interface Profile {
    name: string;
    age: number;
    gender: Gender;
    isAgent: boolean;
}

/** プレイヤの状態 */
export interface Player {
    uid: string;
    profile: Profile;
    pos: Position;
    dir: Direction;
    /** Life Point */
    lp: number;
    /** 保持しているブロックID */
    hold: number;
    /** 生存時間(現在値) */
    Ltime: number;
    /** 最大生存時間 */
    Ltmax: number;
    selectedAction: Action | null;
}

/** 視界内の他プレイヤ情報（一部のみ公開） */
export interface VisiblePlayer {
  name: string;
  dir: Direction;
  lp: number;
  hold: number;
}

/** 視界の1マス */
export interface ViewCell {
  x: number;
  y: number;
  /** そのマスのブロックID */
  block: number;
  /** そのマスにいる他プレイヤ（いなければ null） */
  player: VisiblePlayer | null;
}

/** マップのメタ情報（全マスのデータは含まない） */
export interface MapMeta {
  nx: number;
  ny: number;
  /** ブロックIDの範囲（初期生成時の最大値） */
  blockMax: number;
}

/** ゲームパラメータ */
export interface GameParams {
    /** ティック間隔(秒) */
    tickIntervalSec: number;
    /** 1ティックあたりのアクション数 */
    actionsPerTick: number;
    /** 再接続待ち時間 */
    reconnectTimeoutSec: number;
    map: {
        nx: number;
        ny: number;
        blockMin: number;
        blockMax: number;
    };
    player: {
        lpInitial: number;
        lpDecreasePerTick: number;
        viewRange: number;
    };
}
