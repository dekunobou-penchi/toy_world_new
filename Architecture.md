# アーキテクチャ設計書



## 1. 技術スタック

### 1.1 サーバ

| 項目 | 採用 |
|---|---|
| 言語 | TypeScript |
| ランタイム | Node.js (LTS, v24) |
| HTTP サーバ | Express |
| リアルタイム通信 |  WebSocket + JSON (message_type) |
| ゲーム状態管理 | in-memory |

### 1.2 フロントエンド

| 項目 | 採用 |
|---|---|
| フレームワーク | React |
| ビルドツール | Vite |
| 言語 | TypeScript |
| ルーティング | React Router |
| 状態管理 | React 標準（useState / useContext）、必要に応じて Zustand |
| マップ描画 | SVG |
| CSS | CSS Modules |
### 1.3 リポジトリ構成

| 項目 | 採用 |
|---|---|
| TypeScript 側（サーバ + フロントエンド + 共有部分） | モノレポ（pnpm workspaces） |
| Python エージェント | 別リポジトリ |

### 1.4 永続化

| 項目 | 採用 |
|---|---|
| 設定データ | JSON ファイル |
| ログデータ | JSONL ファイル |
| データベース | 不使用（将来必要に応じて SQLite / DuckDB / Redis 導入） |



### 1.5 開発環境

| 項目 | 採用 |
|---|---|
| メイン実行方式 | ローカル直接実行 |
| サブ実行方式 | Docker（配布・デモ用） |
| Node.js バージョン管理 | nvm + `.nvmrc` |
| パッケージマネージャ | pnpm |
| エディタ | VS Code 前提、`.vscode/` を git 管理 |


### 1.6 デプロイ

| 項目 | 採用 |
|---|---|
| デプロイ環境 1 | 研究室サーバ（Ubuntu、将来 Proxmox 移行予定） |
| デプロイ環境 2 | 自宅 Proxmox（VM） |
| デプロイ方式 | ソース直接実行（git clone + pnpm + systemd） |
| アクセス範囲（研究室） | 研究室内ネットワークのみ |
| アクセス範囲（自宅） | 自宅 LAN + 将来的に VPN・外部公開を検討 |
| 並行実行 | 両環境で並行して実験を回す可能性あり |
| 実験データ管理 | 環境名を付与してデータを区別 |

### 1.7 エージェント連携

| 項目 | 採用 |
|---|---|
| エージェント言語 | Python |
| 通信プロトコル | WebSocket（人間プレイヤと共通） |

## 2. システム全体構成

```
┌─────────────────┐     ┌─────────────────┐
│ player          │     │ ml_agent        │
│ browser         │     │ python_process  │
│ React+WS        │     │ websockets      │
└────────┬────────┘     └────────┬────────┘
         │                       │
         │  WebSocket            │   WebSocket
         │                       │
         └───────────┬───────────┘
                     │
            ┌────────▼────────┐
            │ Game_Server     │
            │ Node.js + TS    │
            │ Express + ws    │
            └────────┬────────┘
                     │
            ┌────────▼────────┐
            │ file            │
            │ - setting JSON  │
            │ - log JSONL     │
            └─────────────────┘
```

## 3. アプリケーション設計（確定事項）

### 3.1 ゲームループの駆動方式

| 項目 | 確定 |
|---|---|
| アクション数 | 1 ティック 1 アクション |
| Tsmp（サンプリング周期） | 廃止（WebSocket で即時受信） |
| Tint（ティック間隔） | 維持、可変パラメータ化 |
| 拡張範囲 | ゲーム全体パラメータを可変に |
| パラメータ変更タイミング | 初期化時（実験開始時） |
| パラメータ変更方法 | 当面は設定ファイル(JSON)、将来 管理画面も対応 |
| ループ開始・停止 | 管理者が「開始」を押したら回る |
| ティック中のアクション受付 | 受け付けて次ティックで処理 |
| 進行モデル | リアルタイム制（時間駆動）。将来ターン制も足せるよう発火部を分離 |

設計指針:
- ゲームパラメータは 1 つのオブジェクトに集約しておく（後から設定ファイル・管理画面の両対応にするため）。
- 「ティックを実行する処理（tick）」と「いつ実行するかを決める発火部（ticker）」を分離しておく（将来ターン制を追加するため）。
- ティックの繰り返しは setTimeout の再帰予約方式（前のティックが完了してから次を予約するため、処理の重複が起きない）。
- ティックの二重起動防止には、ゲーム状態（running）とは別の専用フラグを使用。

### 3.2 WebSocket メッセージプロトコル

クライアント → サーバ:

| メッセージ | 内容 |
|---|---|
| `join` | 名前・年齢・性別・人間/エージェント区別 |
| `action` | アクション名（ティックまで変更可能） |

サーバ → クライアント:

| メッセージ | 内容 |
|---|---|
| `joined` | uid・初期状態・マップメタ情報・ゲームパラメータ |
| `join_failed` | 失敗理由（マップ未生成 / 満員 など） |
| `state` | 自分の状態 + 視界 + システムメッセージ |
| `error` | エラーコード + 人間向け文章 + 対象メッセージ情報 |

補足:
- アクション種類は 9 種（N / E / S / W / forward / get / eat / put / fusion）、後から追加可能。
- 参加時の「マップメタ情報」はサイズ等のメタ情報のみ（全マスのデータは含めない）。
- `state` の送信タイミングはティックごとに全員へ。
- `state` に含める自分の情報: pos, dir, lp, hold, Ltime, Ltmax。
- 視界: 自分の向いている方向に最大 5 マス先まで（他プレイヤがいたら遮蔽）。
- システムメッセージは `state` に同梱、文章（人間向け）+ 構造化コード（エージェント向け）の 2 本立て。

通信の細かい挙動:
- 切断時はプレイヤを一定時間マップに残す（再接続待ち）。待ち時間はゲームパラメータ化。
- 切断中もティック処理は通常通り（LP 減少継続、行動はできない）。
- 再接続はブラウザ保存の識別子（uid を localStorage 等に保存）で同一性を判定し、切断前の状態を引き継ぐ。
- 不正メッセージには `error` を返す。
- 参加可否: マップ未生成・満員時は `join_failed`。ゲーム未開始時は参加可能（待機状態）。

### 3.3 管理者機能

通信方式:
- 操作系（初期化・マップ/テーブル作成・読み出し・ゲーム開始/停止）→ HTTP API
- 監視系（マップ・プレイヤ一覧表示）→ WebSocket

監視系:
- 全体俯瞰ビュー（全マップ + 全プレイヤ位置・向き）
- プレイヤ視点ビュー（選択したプレイヤの視界を再現、視界仕様変更が連動）
- プレイヤ一覧（各プレイヤの状態テーブル）
- 実行状態インジケータ（実行中 / 停止中）

その他:
- 認証なし（研究室内ネットワークのみ。後から追加可能）

### 3.4 ログ形式

ディレクトリ構成:

```
data/experiments/exp_YYYYMMDD_HHMMSS_環境名/
├── meta.json              # 実験メタ情報（条件・パラメータ・テーブル）
├── player_{uid1}.jsonl    # プレイヤごとのログ
├── player_{uid2}.jsonl
└── ...
```

記録イベント（プレイヤごとの JSONL）:

| イベント | 固有項目 |
|---|---|
| `join` | name, age, gender, isAgent |
| `action_select` | action（ティック時点で確定した最後の選択） |
| `action_executed` | action, result_code, sysmsg |
| `death` | result_code, sysmsg |
| `leave` | （共通項目のみ） |

共通項目（全イベント）: time（UNIX 秒）, event, x, y, dir, lp, hold, Ltime, Ltmax

### 3.5 構造化コード一覧

結果コード（result_code）とエラーコードの一覧。`shared/src/constants.ts` に定義し、サーバとフロントの両方で参照する。命名規則は `動詞_結果` の snake_case。

- 向き変更: `turn_success`
- forward: `forward_success`, `forward_blocked_player`
- get: `get_from_map`, `get_swap_map`, `get_from_player`, `get_swap_player`, `get_player_empty`, `get_empty`
- eat: `eat_success`, `eat_no_hold`
- put: `put_to_map`, `put_to_player`, `put_swap_player`, `put_no_hold`
- fusion: `fusion_with_map`, `fusion_with_player`, `fusion_no_hold`, `fusion_player_empty`, `fusion_empty`
- システム系: `died`, `action_applied`
- エラー系: `unknown_action`, `invalid_message`, `not_joined`

### 3.6 型共有の方針

`shared` パッケージに以下を置き、server / frontend の両方からインポートする。

| 種類 | 内容 |
|---|---|
| ドメイン型 | Direction, Position, Action, Player, ViewCell など |
| メッセージ型 | join, action / joined, join_failed, state, error |
| 定数 | 方向定義, アクション一覧, result_code 一覧, デフォルトゲームパラメータ |

エージェント（Python）との型共有は後回し

### 3.7 ディレクトリ構造

モノレポ構成。

```
game/
├── packages/
│   ├── shared/src/        # domain.ts, messages.ts, constants.ts
│   ├── server/src/
│   │   ├── game/          # world, actions, tick, ticker, view, tables
│   │   ├── ws/            # WebSocket 層（server, handlers）
│   │   ├── http/          # HTTP API 層（admin）
│   │   ├── persistence/   # JSON/JSONL 読み書き（config, log）
│   │   └── params.ts      # ゲームパラメータ集約
│   └── frontend/src/
│       ├── pages/         # Register, Player, Admin
│       ├── components/    # マップ描画など
│       ├── context/       # GameContext（接続・状態管理）
│       └── ws/            # WS クライアント
├── data/
│   ├── config/            # 設定（git 管理）
│   └── experiments/       # 実験ログ（git 除外）
└── docs/
```

設計上のポイント:
- `game/` を `ws/`・`persistence/` から独立させ、ゲームロジックを通信・保存から分離。
- `tick.ts`（実行）と `ticker.ts`（発火部）を分離し、将来ターン制を追加しやすくする。
- `view.ts` で視界計算を共通化（プレイヤ画面・管理者のプレイヤ視点ビューで共用）。
- `params.ts` でパラメータを 1 か所に集約。
- 状態アクセスは `getWorld()` に集約（将来 Redis 等への差し替えを容易にするため）。

データの git 管理方針:
- `data/config/`（設定ファイル）→ git 管理（再現性のため）。
- `data/experiments/`（実験ログ）→ git 除外。

### 3.8 永続化・運用

| 項目 | 確定 |
|---|---|
| 状態スナップショット | 作らない（再起動でリセット。ただし JSONL ログは逐次書き込みのため残る） |
| Redis 等の外部ストア | 導入しない（インメモリのみ） |
| 実験データ集約 | 手動 SCP で開始、実験回数が増えたら自動化を検討 |

## 4. 実装状況

### 4.1 実装済み

サーバ:
- モノレポ構成（pnpm workspaces）、shared パッケージ（ドメイン型・メッセージ型・定数）
- HTTP サーバ（Express）+ WebSocket サーバ（ws）の同一ポート起動
- ワールド状態管理（インメモリ、`getWorld` に集約）
- マップ生成（`generateMap`：0〜9 のランダムブロック配置）
- ゲーム初期化（`initWorld`：パラメータ設定 + マップ生成 + プレイヤリセット）
- 空きマス探索（`findFreePosition`）
- join 処理（初期化チェック・空きマスへのランダム配置・満員判定・joined 応答）
- action 処理（接続と uid の紐付け・選択保存・not_joined エラー）
- 管理 HTTP API（init / start / stop）
- ティックループ（setTimeout 再帰予約・二重起動防止・start/stop での開始/自然停止）

フロントエンド:
- React + Vite + TypeScript、3 画面ルーティング（/, /play, /admin）
- WebSocket クライアント（GameClient クラス）
- Context による接続・状態管理（GameProvider、App レベルで接続を保持）
- 参加登録フォーム（名前・年齢・性別入力 → join 送信）
- joined 受信 → 状態保存 → /play へ遷移
- プレイヤ画面（自分の状態表示 + アクション選択ボタン）

### 4.2 未実装

- ティックの中身: LP 減算・死亡判定・アクション実行・状態配信（state メッセージ）
- アクション処理本体（forward / get / eat / put / fusion）
- エネルギーテーブル・融合テーブルの生成
- マップの SVG 描画
- 管理者画面の UI（全体俯瞰ビュー、プレイヤ視点ビュー、プレイヤ一覧）
- 実験ログの記録（JSONL）、meta.json
- 切断・再接続対応
- 視界計算（`view.ts`）

## 5. 保留事項

- 外部公開を本格的に進める際の要件（SSL/TLS、Nginx、ドメイン、認証）。現時点では検討段階のため、具体的な要件が固まってから設計する。