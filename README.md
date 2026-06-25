# toy_world
グリッドワールド型マルチプレイヤー実験プラットフォーム

グリッドマップ上で、プレイヤー（人間および機械学習エージェント）が、ブロックの収集・設置・摂取・融合を行いながら生存する。

旧 PHP 版を、TypeScript + Node.js + React で全面的に再構築したもの。設計の詳細は [`docs/architecture.md`](./docs/architecture.md) を参照。

## 特徴

- リアルタイム通信（WebSocket）による複数プレイヤーの同時参加
- 人間プレイヤーと機械学習エージェント（Python、将来対応）が共通プロトコルで参加
- ゲームパラメータ（ティック間隔・初期ライフポイントなど）を実験ごとに変更可能
- サーバ・フロントエンドで型定義を共有するモノレポ構成

## 技術スタック

| 領域 | 使用技術 |
|---|---|
| サーバ | TypeScript, Node.js, Express, ws（WebSocket） |
| フロントエンド | TypeScript, React, Vite, React Router |
| 状態管理 | インメモリ（サーバ）, React Context（フロント） |
| 永続化 | JSON（設定）, JSONL（ログ） |
| 構成管理 | pnpm workspaces（モノレポ） |

## 必要環境

- Node.js 24（`.nvmrc` を参照）
- pnpm

## セットアップ

```bash
# リポジトリを取得
git clone <repository-url>
cd game

# Node.js のバージョンを合わせる（nvm 使用時）
nvm install
nvm use

# 依存をインストール
pnpm install
```

`pnpm install` 時に、ビルドスクリプトの実行許可を求められた場合は、案内に従って `pnpm approve-builds` を実行する。

## 開発（起動方法）

サーバとフロントエンドを別々のターミナルで起動する。

```bash
# ターミナル 1: サーバ（http://localhost:3000）
pnpm --filter @game/server dev

# ターミナル 2: フロントエンド（http://localhost:5173）
pnpm --filter @game/frontend dev
```

両方をまとめて起動する場合は、プロジェクトルートで以下を実行する（ログが混在する点に注意）。

```bash
pnpm dev
```

## 使い方

現状の動作確認手順は次のとおり。

### 1. ゲームを初期化する

管理者操作（マップ生成・パラメータ設定）を HTTP API で行う。

```bash
curl -X POST http://localhost:3000/api/admin/init
```

### 2. ゲームを開始する

ティック（ゲームループ）を開始する。

```bash
curl -X POST http://localhost:3000/api/admin/start
```

停止する場合:

```bash
curl -X POST http://localhost:3000/api/admin/stop
```

### 3. プレイヤーとして参加する

ブラウザで http://localhost:5173/ を開き、名前・年齢・性別を入力して参加する。参加に成功するとプレイヤー画面に遷移し、アクションを選択できる。

### 画面構成（フロントエンド）

| URL | 画面 |
|---|---|
| `/` | 参加登録 |
| `/play` | プレイヤー画面 |
| `/admin` | 管理者画面（実装途中） |

### 状態確認（デバッグ用）

サーバの現在の状態を JSON で確認できる。

```
http://localhost:3000/api/debug/state
```

## プロジェクト構成

```
game/
├── packages/
│   ├── shared/      共有の型・定数（ドメイン型、メッセージ型、結果コード）
│   ├── server/      バックエンド（Express + ws）
│   │   └── src/
│   │       ├── game/         ゲームロジック（ワールド、マップ、ティック等）
│   │       ├── ws/           WebSocket 層
│   │       ├── http/         HTTP API 層
│   │       └── persistence/  設定・ログの読み書き
│   └── frontend/    フロントエンド（React + Vite）
│       └── src/
│           ├── pages/        各画面
│           ├── context/      接続・状態管理
│           └── ws/           WebSocket クライアント
├── data/
│   ├── config/      設定ファイル（git 管理）
│   └── experiments/ 実験ログ（git 除外）
└── docs/            設計ドキュメント
```

機械学習エージェント（Python）は別リポジトリで管理する。

## 実装状況

### 実装済み

- モノレポ構成、型・定数の共有パッケージ
- HTTP サーバ + WebSocket サーバ
- ワールド状態管理、マップ生成、ゲーム初期化
- プレイヤーの参加（join：空きマスへの配置・満員判定）
- アクション選択の受信（action）
- 管理 API（初期化 / 開始 / 停止）
- ティックループ（開始・停止・二重起動防止）
- フロントエンド：参加登録 → プレイヤー画面遷移 → 状態表示・アクション選択

### 今後の予定

- ティックの処理内容（ライフポイント減算・死亡判定・アクション実行・状態配信）
- アクション処理の実装（forward / get / eat / put / fusion）とテーブル生成
- マップの SVG 描画
- 管理者画面の UI（俯瞰ビュー・プレイヤー視点ビュー・一覧）
- 実験ログ（JSONL）の記録
- 切断・再接続対応
- 機械学習エージェントの統合

## ドキュメント

- [アーキテクチャ設計書](Architecture.md) — 設計の全体像、各種決定事項、実装状況の詳細

## ライセンス

（未定）