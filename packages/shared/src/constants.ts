import type { Action, Direction, GameParams } from './domain.js';

/** All Direction */
export const DIRECTIONS: readonly Direction[] = ['N', 'E', 'S', 'W'];

/** All selectable actions */
export const ACTIONS: readonly Action[] = [
    'N',
    'E',
    'S',
    'W',
    'forward',
    'get',
    'eat',
    'put',
    'fusion',
];

export const RESULT_CODES = {
  // 向き変更（4方向共通）
  turn_success: 'turn_success',

  // forward（前進）
  forward_success: 'forward_success',
  forward_blocked_player: 'forward_blocked_player',

  // get（取得）
  get_from_map: 'get_from_map',
  get_swap_map: 'get_swap_map',
  get_from_player: 'get_from_player',
  get_swap_player: 'get_swap_player',
  get_player_empty: 'get_player_empty',
  get_empty: 'get_empty',

  // eat（食べる）
  eat_success: 'eat_success',
  eat_no_hold: 'eat_no_hold',

  // put（置く）
  put_to_map: 'put_to_map',
  put_to_player: 'put_to_player',
  put_swap_player: 'put_swap_player',
  put_no_hold: 'put_no_hold',

  // fusion（融合）
  fusion_with_map: 'fusion_with_map',
  fusion_with_player: 'fusion_with_player',
  fusion_no_hold: 'fusion_no_hold',
  fusion_player_empty: 'fusion_player_empty',
  fusion_empty: 'fusion_empty',

  // システム系
  died: 'died',
  action_applied: 'action_applied',
} as const;

export type ResultCode = (typeof RESULT_CODES)[keyof typeof RESULT_CODES];

/** error code */
export const ERROR_CODES = {
  unknown_action: 'unknown_action',
  invalid_message: 'invalid_message',
  not_joined: 'not_joined',
} as const;

export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];

/** デフォルトのゲームパラメータ */
export const DEFAULT_GAME_PARAMS: GameParams = {
  tickIntervalSec: 5.0,
  actionsPerTick: 1,
  reconnectTimeoutSec: 60,
  map: {
    nx: 10,
    ny: 10,
    blockMin: 0,
    blockMax: 10,
  },
  player: {
    lpInitial: 100,
    lpDecreasePerTick: 1,
    viewRange: 5,
  },
};

