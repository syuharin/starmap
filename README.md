# 星図表示アプリケーション

## 概要
本アプリケーションは、現在位置や特定の日時に基づいて夜空の星図を表示するPC向けアプリケーションです。
GPSや手動入力による位置情報、カレンダーによる日時指定に対応し、インタラクティブな星図表示を実現します。

## 主な機能
### 実装済み
- オリオン座と北斗七星の表示（主要な星と星座線）
- インタラクティブな操作（ズーム、視点変更、回転）
- 夜間モード対応
- 星の等級に応じた大きさの調整
- Three.jsによる3D表示
- 検索機能（星や星座の名前から検索、日本語対応）
- 選択した天体への自動フォーカス機能
  - 方位円中心からの視点で天体を追跡
  - スムーズな回転アニメーション
  - ESCキーや背景クリックでフォーカス解除
- 日本語名とバイエル符号の表示
- 方位円中心視点の実装
  - 地上からの観測視点を再現
  - 広視野角（75度）での星空表示
  - 北向き初期視点

### 今後の実装予定
- 現在位置の星図表示
- 過去・未来の星図表示
- さらなる星座の追加（カシオペア座、さそり座など）
- 方位磁石との連携（コンパス連動）
- 星座の詳細情報表示
- カメラ位置のGPS連動

## 技術スタック
### フロントエンド
- Electron
- React
- Three.js (WebGL)
- @react-three/fiber
- @react-three/drei
- Material-UI（UIコンポーネント）
- dayjs（日時処理）

### バックエンド
- Python
- FastAPI
- SQLite
- Skyfield（天体計算）

## セットアップ手順

### 必要条件
- Node.js (v18以上)
- Python (v3.10以上)
- npm または yarn

### 開発環境のセットアップ

#### Windows環境
Windows環境でのセットアップ方法については、[Windows環境セットアップガイド](docs/windows-setup.md)を参照してください。

#### WSL/Linux環境

1. リポジトリのクローン
```bash
git clone https://github.com/syuharin/starmap.git
cd starmap
```

2. フロントエンドの依存パッケージインストール
```bash
npm install
```

3. バックエンドの依存パッケージインストール
```bash
cd src/backend
pip install -r requirements.txt
cd ../..
```

4. データベースの初期化
```bash
cd src/backend
python init_db.py
cd ../..
```
この手順でオリオン座と北斗七星の基本データがデータベースに登録されます。

### 開発サーバーの起動

1. バックエンドサーバーの起動
```bash
npm run dev:backend
```
バックエンドサーバーは http://localhost:8000 で起動します。

2. フロントエンドの開発サーバーの起動（新しいターミナルで実行）
```bash
npm run dev:frontend
```

3. モバイル版の開発サーバーの起動（必要な場合、新しいターミナルで実行）
```bash
npm run dev:mobile
```

4. アプリケーションへのアクセス
- フロントエンド: http://localhost:3002
- モバイル版: http://localhost:3003
- バックエンドAPI: http://localhost:8000

### 現在の制限事項
- オリオン座と北斗七星のみ表示可能
- 現在位置や時刻に基づく表示位置の調整は未実装
- 星座の詳細情報表示は未実装

## デプロイ手順

### クラウドデプロイ
本アプリケーションはVercel（フロントエンド）とRender（バックエンド）を使用したクラウドデプロイに対応しています。

#### フロントエンド（Vercel）
1. Vercelアカウントを作成し、GitHubリポジトリと連携
2. 新しいプロジェクトを作成し、以下の設定を行う：
   - **Framework Preset**: Other
   - **Build Command**: `npm run build:mobile`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`
3. 環境変数を設定：
   - `REACT_APP_API_URL`: RenderでデプロイされるバックエンドのURL

#### バックエンド（Render）
1. Renderアカウントを作成し、GitHubリポジトリと連携
2. `render.yaml`を使用して新しいBlueprint（設計図）を作成
   - Renderダッシュボードで「New Blueprint」を選択
   - リポジトリとブランチを選択
   - `render.yaml`が自動的に検出され、設定が読み込まれる
3. 必要に応じて環境変数を調整：
   - `FRONTEND_URL`: VercelでデプロイされるフロントエンドのURL
4. デプロイ完了後、データ移行を実行：
   ```
   cd src/backend
   python migrate_to_postgres.py
   ```

### デスクトップアプリケーションのビルド
```bash
# Electronアプリケーションのビルド
npm run build
npm run package
```
ビルドされたアプリケーションは `dist` ディレクトリに生成されます。

## 開発プロセス

### ブランチ戦略
- `main`: プロダクションブランチ
- `develop`: 開発ブランチ
- `feature/*`: 新機能の開発
- `bugfix/*`: バグ修正
- `hotfix/*`: 緊急のバグ修正

### 継続的インテグレーション
プロジェクトはGitHub Actionsを使用して以下の自動化を行っています：
- フロントエンドのビルドとテスト
- バックエンドのテスト（pytestによるユニットテスト）
- コードスタイルチェック（ESLint, Flake8）
- セキュリティスキャン

## ライセンス
MIT License

## 貢献について
プルリクエストやイシューの報告は大歓迎です。
大きな変更を加える場合は、まずイシューを作成して変更内容を議論させていただけると幸いです。

コントリビューションの詳細については[CONTRIBUTING.md](CONTRIBUTING.md)を参照してください。
