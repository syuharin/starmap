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
   - SQLite
   - SQLAlchemy（ORM）
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

## 開発環境

### 必要条件
1. ソフトウェア要件
   - Node.js v18以上
   - Python 3.10以上
   - Git

2. OS対応
   - Linux（主要な開発環境）
   - macOS（予定）

3. IDE/エディタ
   - VSCode推奨
   - 必要な拡張機能：
     - ESLint
     - Prettier
     - Python
     - TypeScript
     - GitLens

### 環境構築手順
1. リポジトリのクローン
```bash
git clone [repository-url]
cd starmap
```

2. フロントエンド環境
```bash
npm install
```

3. バックエンド環境
```bash
cd src/backend
pip install -r requirements.txt
```

4. データベース初期化
```bash
python init_db.py
```

### 開発サーバー
1. バックエンド起動
```bash
cd src/backend
python main.py
```

2. フロントエンド起動
```bash
npm run dev:frontend
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

### ビルド設定
1. フロントエンド
   - webpack本番設定
   - アセット最適化
   - コード分割

2. バックエンド
   - Python wheels
   - 依存関係の最適化
   - 環境変数管理

### 配布
1. デスクトップアプリ
   - Electron Builder
   - 自動更新機能
   - クロスプラットフォームビルド

2. モバイルアプリ（計画中）
   - React Native
   - Expo
   - ネイティブモジュール

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
