# 技術コンテキスト

## 技術スタック

### フロントエンド
1. 基本フレームワーク
   - Electron（デスクトップアプリケーション）
   - React（UIフレームワーク）
   - TypeScript（型安全性）
   - React Native Web（モバイル対応）

2. UI/UXライブラリ
   - Material-UI（UIコンポーネント）
   - @react-three/fiber（Three.js React バインディング）
   - @react-three/drei（Three.js ユーティリティ）
   - React Native Paper（モバイルUI）

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
   - SQLite（開発環境）
   - PostgreSQL（本番環境）
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
   - ポート競合の解決方法
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

### 開発サーバー
1. バックエンド起動
```bash
cd src/backend
python main.py
```

2. フロントエンド起動
```bash
# デスクトップ版
npm run dev:frontend

# モバイル版
npm run dev:mobile
```

## ツール群

### CI/CD
1. GitHub Actions
   - ビルド自動化
   - テスト実行
   - コードスタイルチェック
   - セキュリティスキャン

2. コード品質
   - ESLint（JavaScript）
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
   - 星座線データ
   - 星座境界データ
   - 天体名データ（多言語）

## デプロイメント

### クラウドデプロイ
1. フロントエンド（Vercel）
   - 環境変数による設定管理
     - `REACT_APP_API_URL`：バックエンドAPIのURL
   - ビルド設定
     - ビルドコマンド：`npm run build:mobile`
     - 出力ディレクトリ：`dist`
     - ルートファイル：`mobile.html`
   - CI/CD連携
     - GitHub連携
     - プレビューデプロイ
     - 自動デプロイ

2. バックエンド（Render）
   - Web Service設定
     - ビルドコマンド：`pip install -r src/backend/requirements.txt`
     - スタートコマンド：`cd src/backend && uvicorn main:app --host 0.0.0.0 --port $PORT`
     - リージョン：`singapore`（アジア圏）
   - 環境変数
     - `DATABASE_URL`：PostgreSQL接続URL
     - `FRONTEND_URL`：フロントエンドURL
     - `ENVIRONMENT`：`production`
   - Infrastructure as Code
     - `render.yaml`による設定

3. データベース（Render PostgreSQL）
   - 無料プラン
   - 自動バックアップ
   - データ移行
     - SQLiteからの移行スクリプト
     - 初期データのシード

4. データ移行
   - `migrate_to_postgres.py`スクリプト
   - テーブル作成
   - データコピー
   - ID参照の維持

### ビルド設定
1. フロントエンド
   - webpack本番設定
   - アセット最適化
   - コード分割
   - モバイル向け最適化
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

2. モバイルアプリ
   - Web First開発
   - Progressive Web App
   - ネイティブ機能の段階的統合
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
