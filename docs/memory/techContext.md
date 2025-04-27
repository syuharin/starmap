# 技術コンテキスト

## 技術スタック

### フロントエンド
1. 基本フレームワーク
   - Electron（デスクトップアプリケーション）
   - React（UIフレームワーク）
   - TypeScript（型安全性）

2. UI/UXライブラリ
   - Material-UI（UIコンポーネント）
   - @react-three/fiber（Three.js React バインディング）
   - @react-three/drei（Three.js ユーティリティ）

3. 状態管理
   - Redux Toolkit
   - React Hooks
   - ローカルステート

4. 描画エンジン
   - Three.js（WebGL）
   - WebGL
   - Canvas 2D（フォールバック）

### バックエンド
1. サーバーフレームワーク
   - Python 3.10+
   - FastAPI
   - Uvicorn（ASGIサーバー）

 2. データベース
    - PostgreSQL（ローカル開発環境、本番環境はNeon）
    - SQLAlchemy（ORM）
    - psycopg2-binary（PostgreSQL接続）
   - Alembic（マイグレーション）

3. 天体計算
   - Skyfield（天体位置計算）
   - NumPy（数値計算）
   - Pandas（データ処理）

### 開発ツール
1. パッケージマネージャー
   - npm/yarn（フロントエンド）
   - pip（バックエンド）

2. ビルドツール
   - webpack
   - TypeScript Compiler
   - Python setuptools

3. テストフレームワーク
   - Jest + React Testing Library（フロントエンド）
   - pytest（バックエンド）
   - Puppeteer（ヘッドレステスト）
     - **注意:** ヘッドレスモードではWebGLのサポートが不安定な場合がある。テスト実行時にWebGL関連のエラーが発生する場合、`--enable-webgl`, `--ignore-gpu-blacklist` などの起動オプション追加や、ヘッドフルモード (`headless: false`) でのデバッグが必要になることがある。

## 開発環境

### システム要件
1. Windows環境
   - Windows 10/11
   - メモリ：8GB以上推奨
   - Node.js v18以上
   - Python 3.10以上
   - Git for Windows
   - Visual Studio Code
   - PostgreSQL (ローカル開発用)

2. WSL2環境
   - Windows 10 バージョン2004以降
   - WSL2が有効化されていること
   - 仮想化機能の有効化
   - メモリ：8GB以上推奨
   - Windows Terminal（推奨）

### 環境固有の設定
1. Windows環境
   - Pythonの環境変数設定
   - 仮想環境（venv）の使用
   - npm/yarnのグローバルパッケージ設定
   - VSCode拡張機能の設定

2. WSL固有の設定
   - ネットワークポート転送の設定
   - ファイルシステムのパフォーマンス最適化
   - メモリ割り当ての調整
   - プロセス管理の設定

### トラブルシューティング
1. プロセス管理
   - 実行中プロセスの確認方法
   - プロセスのクリーンアップ手順
   - ポート競合の解決方法 (`EADDRINUSE`): `netstat -ano | findstr "<ポート番号>"` でプロセスID (PID) を特定し、`taskkill /PID <PID> /F` で強制終了する。
   - メモリリークの対処

2. Windows環境の問題
   - Python仮想環境の問題
   - npm/yarnのパッケージ問題
   - ポート使用状況の確認
   - パーミッション関連の問題

3. WSL環境の問題
   - WSLとWindowsの連携問題
   - ファイルパーミッションの問題
   - ネットワーク接続の問題
   - パフォーマンスの問題

3. テスト実行時の注意点
   - プロセスの分離実行
   - リソースの解放確認
   - エラーログの確認方法
   - 再試行メカニズムの利用
   - **ES Module環境での設定ファイル:** `package.json` で `"type": "module"` を指定している場合、CommonJS形式の設定ファイル（例: `babel.config.js`, `webpack.config.js`）は `.cjs` 拡張子に変更する必要がある (`babel.config.cjs`, `webpack.config.cjs`)。ESLint設定 (`eslint.config.js`) 内でこれらの設定ファイルを読み込む場合は、`requireConfigFile: true` を指定する。
   - **CIスクリプトでのサーバー起動:** E2Eテストなどでフロントエンド・バックエンド両方のサーバーが必要な場合、`concurrently` と `wait-on` を使用してサーバーを並列起動し、準備完了を待機する。`wait-on` では、バックエンドの準備完了確認にルートパス (`/`) ではなく、確実にGETリクエストに応答するエンドポイント（例: `/docs`）を指定する。
   - **テストセレクタ:** Puppeteerテストで要素を待機する場合、クラス名よりも `data-testid` 属性を使用する方が安定性が高い。

### IDE/エディタ
1. VSCode推奨設定
   - Remote - WSL拡張機能
   - WSL固有の設定
   - デバッグ設定
   - 必要な拡張機能：
     - ESLint
     - Prettier
     - Python
     - TypeScript
     - GitLens
     - Remote - WSL

### 環境構築手順
1. リポジトリのクローン
```bash
git clone [repository-url]
cd starmap
```

2. WSL環境設定（Windows）
```bash
# WSL2のインストールと設定
wsl --install
wsl --set-default-version 2

# 開発環境のセットアップ
sudo apt update
sudo apt install nodejs npm python3 python3-pip
```

3. フロントエンド環境
```bash
npm install
```

4. バックエンド環境
```bash
cd src/backend
pip install -r requirements.txt
```

5. ローカルPostgreSQL設定
   - PostgreSQLをインストールし、データベースとユーザーを作成
   - プロジェクトルートに `.env` ファイルを作成し、`DATABASE_URL` を設定
   ```dotenv
   DATABASE_URL=postgresql://<user>:<password>@<host>:<port>/starmap
   FRONTEND_URL=http://localhost:3003
   ENVIRONMENT=development
   ```

 6. データベース初期化
 ```bash
 cd src/backend
 python init_db.py
 cd ../..
 ```
 このコマンドは、まず既存のデータベースの内容をクリアし、次に `src/backend/data/` ディレクトリにあるCSVファイルから初期データを読み込んで登録します。

### 開発サーバー
1. バックエンド起動
```bash
cd src/backend
python main.py
```

2. フロントエンド起動
```bash
# フロントエンド (統合版)
npm run dev:frontend
```

## ツール群

### CI/CD
1. GitHub Actions
   - ビルド自動化
   - テスト実行
   - コードスタイルチェック
   - セキュリティスキャン
   - **ローカル実行:**
     - フロントエンド: `npm run ci:frontend` (Lint, Test, Build) - サーバー起動とテスト実行を連携済み。
     - バックエンド (Linux/WSL): `bash run_ci_backend.sh` (Deps, Flake8, Pytest)
     - バックエンド (Windows): `run_ci_backend.bat` (Deps, Flake8, Pytest)

2. コード品質
   - ESLint（JavaScript/TypeScript, v9 flat config形式の `eslint.config.js` で設定済み, `@babel/eslint-parser` 使用）
   - Flake8（Python）
   - Prettier（コードフォーマット）
   - TypeScript（型チェック）

3. テストカバレッジ
   - Jest Coverage
   - pytest-cov
   - Codecov連携

### モニタリング
1. エラー監視
   - コンソールログ
   - エラートラッキング
   - パフォーマンスモニタリング

2. パフォーマンス計測
   - React DevTools
   - Chrome DevTools
   - WebGL Inspector
   - React Native Debugger

### セキュリティ
1. 依存関係チェック
   - npm audit
   - safety（Python）
   - Snyk

2. コードスキャン
   - CodeQL
   - SonarQube
   - OWASP依存関係チェック

## データソース

### 天体データ
1. スターカタログ
   - HYG Database
   - Yale Bright Star Catalog
   - Hipparcos Catalog

2. 天体計算
   - Skyfield
   - DE421 エフェメリス
   - IAU 2000/2006規約

 3. 補助データ
    - 星座線データ（初期データは `src/backend/data/constellation_lines.csv` から）
    - 星座境界データ
    - 天体名データ（多言語、初期データは `src/backend/data/constellations.csv`, `src/backend/data/stars.csv` から）

## デプロイメント

### クラウドデプロイ
1. フロントエンド（Vercel）
   - 環境変数による設定管理
     - `REACT_APP_API_URL`：バックエンドAPIのURL
   - ビルド設定
     - ビルドコマンド：`npm run build`
     - 出力ディレクトリ：`dist`
     - ルートファイル：`index.html`
   - CI/CD連携
     - GitHub連携
     - プレビューデプロイ
     - 自動デプロイ

2. バックエンド（Replit）
   - Replit設定 (`.replit` ファイル)
     - スタートコマンド：`cd src/backend && uvicorn main:app --host 0.0.0.0 --port 8080`
   - 環境変数 (Secrets)
     - `DATABASE_URL`：Neon PostgreSQL接続URL
     - `FRONTEND_URL`：VercelフロントエンドURL
     - `ENVIRONMENT`：`production` または `development`
   - 依存関係: `src/backend/requirements.txt` を使用

3. データベース（Neon PostgreSQL）
   - 無料プラン
   - 自動バックアップ (Neonの機能)
    - データ初期化
      - `src/backend/init_db.py` スクリプトでテーブル作成と初期データ（CSVから読み込み）投入
 
 4. データ移行 (不要)
   - SQLiteからの移行スクリプト (`migrate_to_postgres.py`) は使用せず、`init_db.py` で初期化

### ビルド設定
1. フロントエンド
   - webpack本番設定
   - アセット最適化
   - コード分割
   - 環境変数の注入（DefinePlugin）

2. バックエンド
   - Python wheels
   - 依存関係の最適化
   - 環境変数管理
   - CORS設定

### 配布
1. デスクトップアプリ
   - Electron Builder
   - 自動更新機能
   - クロスプラットフォームビルド

2. Webアプリケーション (PC/モバイル)
   - レスポンシブデザイン
   - Progressive Web App (検討中)
   - Vercelホスティング

## バージョン管理

### Git戦略
1. ブランチ管理
   - main（プロダクション）
   - develop（開発）
   - feature/*（機能開発）
   - bugfix/*（バグ修正）
   - hotfix/*（緊急修正）

2. バージョニング
   - セマンティックバージョニング
   - CHANGELOGの維持
   - リリースタグ付け

3. コードレビュー
   - プルリクエストテンプレート
   - レビューチェックリスト
   - 自動レビュー割り当て
