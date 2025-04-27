# 星図表示アプリケーション

> **Note:** このプロジェクトの一部は、AIコーディングアシスタント（Cline）の支援を受けて開発されました。AIはコード生成、デバッグ、ドキュメント作成などのタスクを支援しました。

## 概要
本アプリケーションは、現在位置や特定の日時に基づいて夜空の星図を表示するWebアプリケーション (PC/モバイル対応) です。
GPSや手動入力による位置情報、カレンダーによる日時指定に対応し、インタラクティブな星図表示を実現します。

## 主な機能
### 実装済み
- オリオン座、北斗七星、夏の大三角（アステリズム）の表示（主要な星と星座線）
- インタラクティブな操作（ズーム、視点変更、回転）
- 夜間モード対応
- 星の等級に応じた大きさの調整
- Three.jsによる3D表示
- 検索機能（星や星座の名前から検索、日本語対応）
- 選択した天体への自動フォーカス機能
  - 方位円中心からの視点で天体を追跡
  - スムーズな回転アニメーション
  - ESCキーや背景クリックでフォーカス解除
- **検索した星座の方向表示機能**
  - コンパスローズ上に星座の方向を示す3D矢印を表示
  - 星座名、方角、高度情報をラベルで表示
  - 地平線下の星座も表示
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
- React
- Three.js (WebGL)
- @react-three/fiber
- @react-three/drei
- Material-UI（UIコンポーネント）
- dayjs（日時処理）

### バックエンド
- Python
- FastAPI
- PostgreSQL (ローカル開発), Neon (本番)
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

4. ローカルデータベースの設定 (PostgreSQL)
   - ローカルにPostgreSQLをインストールし、データベース（例: `starmap`）とユーザーを作成します。
   - プロジェクトルートに `.env` ファイルを作成し、以下の形式でデータベース接続情報を記述します。
     ```dotenv
     DATABASE_URL=postgresql://<user>:<password>@<host>:<port>/starmap
     FRONTEND_URL=http://localhost:3003 # 開発用フロントエンドURL
     ENVIRONMENT=development
     ```

5. データベースの初期化
```bash
cd src/backend
 python init_db.py
 cd ../..
 ```
この手順で、まず既存のデータベースの内容がクリアされ、次に `src/backend/data/` ディレクトリにあるCSVファイル（`constellations.csv`, `stars.csv`, `constellation_lines.csv`）から初期データ（オリオン座、北斗七星、夏の大三角など）がデータベースに登録されます。

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

3. アプリケーションへのアクセス
- フロントエンド: http://localhost:3002
- バックエンドAPI: http://localhost:8000

### 現在の制限事項
- オリオン座、北斗七星、夏の大三角のみ表示可能
- 現在位置や時刻に基づく表示位置の調整は未実装（観測地点は東京に固定）
- 星座の詳細情報表示は未実装

## デプロイ手順

### クラウドデプロイ (Vercel / Replit / Neon)
本アプリケーションは以下のサービスを使用したクラウドデプロイに対応しています。

#### データベース（Neon）
1. [Neon](https://neon.tech/) でアカウントを作成し、新しいPostgreSQLプロジェクトを作成します。
2. 作成したデータベースの接続URL（Connection String）を取得します。

#### バックエンド（Replit）
1. [Replit](https://replit.com/) でアカウントを作成し、GitHubリポジトリをPythonプロジェクトとしてインポートします。
2. Replitの「Secrets」（環境変数）に以下を設定します。
   - `DATABASE_URL`: Neonで取得したデータベース接続URL
   - `FRONTEND_URL`: VercelでデプロイするフロントエンドのURL（後述）
   - `ENVIRONMENT`: `production`
3. Replitの「Shell」タブでデータベースを初期化します。このコマンドは既存データをクリアし、CSVファイルからデータを読み込みます。
   ```bash
   python src/backend/init_db.py
   ```
4. Replitの `.replit` ファイルを以下のように設定します（または確認します）。
   ```toml
   run = "cd src/backend && uvicorn main:app --host 0.0.0.0 --port 8080"
   language = "python3"
   ```
5. Replitの「Run」ボタンを押してバックエンドサーバーを起動します。起動後、公開URL（例: `https://<your-repl-name>.replit.dev`）を控えておきます。

#### フロントエンド（Vercel）
1. [Vercel](https://vercel.com/) でアカウントを作成し、GitHubリポジトリと連携します。
2. 新しいプロジェクトを作成し、以下の設定を行います。
   - **Framework Preset**: `Create React App` または `React` (推奨)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`
3. 環境変数を設定します。
   - `REACT_APP_API_URL`: Replitで控えておいたバックエンドの公開URL
4. デプロイを実行します。デプロイ完了後、公開されたフロントエンドのURLをReplitの `FRONTEND_URL` 環境変数に設定します（必要であればReplitを再起動）。

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
