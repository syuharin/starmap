# システムパターン

## アーキテクチャパターン

### 全体アーキテクチャ

1. クリーンアーキテクチャ

   - ドメインロジックの分離
   - 依存関係の制御
   - テスト容易性の確保

2. マイクロサービス的アプローチ

   - フロントエンド（React, Vercelでホスト）
   - バックエンド（FastAPI, Replitでホスト）
   - データベース（PostgreSQL, Neonでホスト）

3. レイヤー構造

   - プレゼンテーション層（React Components）
   - ビジネスロジック層（Services）
   - データアクセス層（Repositories）
   - インフラストラクチャ層（API/DB）

4. デプロイメントアーキテクチャ図
   ```mermaid
   graph TD
       User[ユーザー] --> FE[フロントエンド (React on Vercel)];
       FE --> BE[バックエンド (FastAPI on Replit)];
       BE --> DB[データベース (PostgreSQL on Neon)];
   ```

### フロントエンドアーキテクチャ (`src/app`)

1. コンポーネント設計

   - 機能ベースのコンポーネント分割
   - プレゼンテーション/コンテナパターン (部分的に適用)
   - レスポンシブデザイン

2. レンダリング戦略

   - Three.js (@react-three/fiber) による3D描画 (PC/モバイル共通)
   - パフォーマンス最適化パターン (モバイル含む)
   - メモリ管理パターン

3. 状態管理

   - Redux Toolkitによる中央集権的状態管理 (検討中、現在は主にローカルステート)
   - ローカルステート活用
   - メモ化による最適化

4. ルーティング
   - シンプルなページ構造
   - 履歴管理
   - ディープリンク対応

### バックエンドアーキテクチャ

1. APIデザイン

   - RESTful原則
   - OpenAPI（Swagger）仕様
   - エラーハンドリング標準化
   - 命名規則
     - 天体座標：right_ascension（赤経）, declination（赤緯）
     - 略語を避ける（ra → right_ascension）
     - 明確な意味を持つ名前を使用
     - 一貫性のある命名規則の適用
   - **星座線データの扱い**:
     - `/constellations` エンドポイントは、各星座に属する星の情報 (`stars`) に加えて、星座を構成する線 (`lines`) の情報も返却します。
     - この線情報は、`models.py` で定義された `Constellation` と `ConstellationLine` のリレーションシップ (`constellation.lines`) を利用して、API実装 (`main.py`) 内で動的に取得・整形され、レスポンスに含まれます。
     - 注意点として、対応するPydanticスキーマ (`schemas.py` の `Constellation`) には `lines` フィールドが明記されていませんが、APIレスポンスには含まれています。

2. データモデル
   - SQLiteによる永続化（旧開発環境）
   - PostgreSQLによる永続化（ローカル開発環境）
   - Neon (PostgreSQL) による永続化（本番環境）
   - モデル間の関係定義
   - マイグレーション管理 (Alembic, 現在は未使用)

## 設計パターン

### 実装パターン

1. フロントエンド

   - Observer Pattern（イベント処理）
   - Factory Pattern（コンポーネント生成）
   - Command Pattern（操作履歴）
   - Adapter Pattern（外部サービス連携など）
   - レスポンシブデザインパターン
   - タッチインタラクションパターン (実装予定)
   - **API Retry Pattern**: バックエンドAPI呼び出し (`fetchStars`, `searchCelestialObjects`, `fetchConstellations`) において、サーバーエラー(5xx)やネットワークエラー発生時に指数バックオフを用いたリトライ（最大3回）を実装 (`fetchWithRetry` ヘルパー関数 in `src/app/services/starService.js`)。これにより、バックエンドのスリープからの復帰など、一時的な接続問題に対する耐性を向上。

2. バックエンド
   - Repository Pattern（データアクセス）
   - Service Pattern（ビジネスロジック）
   - Dependency Injection
   - Unit of Work

### データパターン

1. スキーマ設計

   - Star（星のデータ）
   - Constellation（星座データ）
   - ConstellationLine（星座線データ）
   - UserPreference（ユーザー設定）

2. キャッシュ戦略
   - メモリキャッシュ
   - ローカルストレージ
   - データ更新ポリシー

### CSVデータ仕様

データベースの初期データ（星座、星、星座線）は、保守性と拡張性を考慮し、Pythonコード内ではなくCSVファイルで管理します。CSVファイルは `src/backend/data/` ディレクトリに配置します。

**共通仕様:**

- 文字コード: UTF-8
- 区切り文字: カンマ (`,`)
- 各ファイルの1行目はヘッダー行とします。

**ファイル詳細:**

1.  **`constellations.csv`**

    - 目的: 星座およびアステリズムの基本情報を定義します。
    - ヘッダー: `name,name_jp,abbreviation,season,right_ascension_center,declination_center,description`
    - 各列の説明:
      - `name`: 星座/アステリズムの英語名 (例: Orion, Summer Triangle)
      - `name_jp`: 日本語名 (例: オリオン座, 夏の大三角)
      - `abbreviation`: 略符 (例: Ori, UMa, SUMTRI)。これは他のCSVファイルから参照される一意なキーとなります。
      - `season`: 主に見える季節 (例: 冬, 夏)
      - `right_ascension_center`: 中心の赤経 (度)
      - `declination_center`: 中心の赤緯 (度)
      - `description`: 星座/アステリズムの説明

2.  **`stars.csv`**

    - 目的: 個々の星の情報を定義します。
    - ヘッダー: `hip_number,name,common_name_jp,bayer_designation,right_ascension,declination,magnitude,constellation_abbreviation`
    - 各列の説明:
      - `hip_number`: ヒッパルコス星表番号。星の一意な識別子として使用します。
      - `name`: 星の固有名 (例: Betelgeuse, Vega)
      - `common_name_jp`: 日本語の通称 (例: ベテルギウス, ベガ)
      - `bayer_designation`: バイエル符号 (例: α Ori, α Lyr)
      - `right_ascension`: 赤経 (度)
      - `declination`: 赤緯 (度)
      - `magnitude`: 見かけの等級
      - `constellation_abbreviation`: この星が属する星座/アステリズムの略符 (`constellations.csv` の `abbreviation` と対応)。`init_db.py` で読み込む際に、対応する `constellation_id` に変換されます。

3.  **`constellation_lines.csv`**
    - 目的: 星座やアステリズムを形作る線を定義します。
    - ヘッダー: `constellation_abbreviation,star1_hip,star2_hip`
    - 各列の説明:
      - `constellation_abbreviation`: この線が属する星座/アステリズムの略符 (`constellations.csv` の `abbreviation` と対応)。
      - `star1_hip`: 線の始点となる星のヒッパルコス番号 (`stars.csv` の `hip_number` と対応)。
      - `star2_hip`: 線の終点となる星のヒッパルコス番号 (`stars.csv` の `hip_number` と対応)。
      - `init_db.py` で読み込む際に、`constellation_abbreviation`, `star1_hip`, `star2_hip` はそれぞれ対応する `constellation_id`, `star1_id`, `star2_id` に変換されます。

**データ読み込み処理 (`init_db.py`):**

- スクリプトはこれらのCSVファイルを読み込みます。
- `constellation_abbreviation` や `hip_number` をキーとして、データベースに挿入済みの対応するレコードのIDを検索し、外部キー (`constellation_id`, `star1_id`, `star2_id`) を設定します。

## コーディング規約

### 共通規約

1. 命名規則

   - キャメルケース（JavaScript）
   - スネークケース（Python）
   - 意図が明確な命名

2. コメント

   - 日本語でのドキュメント
   - コードの意図の説明
   - TODO/FIXMEマーカー

3. ファイル構成
   - 機能ごとのモジュール分割
   - インデックスファイルの活用
   - テストファイルの配置

### JavaScript/React規約

1. コンポーネント

   - Function Componentの使用
   - Hooksの命名規則
   - Props型定義

2. スタイリング

   - CSS-in-JS
   - テーマシステム
   - レスポンシブデザイン

3. テスト
   - Jest + React Testing Library
   - スナップショットテスト
   - インテグレーションテスト

### Python規約

1. コードスタイル

   - PEP 8準拠
   - 型ヒントの使用
   - docstring（日本語）

2. 関数設計

   - 単一責任の原則
   - 引数の型アノテーション
   - 戻り値の型定義

3. テスト
   - pytestの使用
   - フィクスチャの活用
   - モック/スタブの使用

## 品質管理パターン

### テスト戦略

1. WSL環境でのテストパターン

   - プロセス分離パターン
     - 開発サーバーとテストの分離実行
     - ポート管理の一元化
     - プロセスクリーンアップの自動化
   - エラーハンドリングパターン
     - 再試行メカニズム
     - グレースフルシャットダウン
     - エラーログの集中管理
   - リソース管理パターン
     - メモリ使用量の監視
     - ポートの動的割り当て
     - テンポラリファイルの自動クリーンアップ

2. テストレベル

   - ユニットテスト（80%以上のカバレッジ）
   - インテグレーションテスト
   - E2Eテスト
   - ビジュアルリグレッションテスト

3. テスト自動化
   - CI/CDパイプライン
   - 自動テスト実行
   - カバレッジレポート

### コード品質

1. 静的解析

   - ESLint（JavaScript）
   - Flake8（Python）
   - TypeScript型チェック
   - モバイル向けベストプラクティス
   - クロスプラットフォーム互換性チェック

2. コードレビュー

   - プルリクエストレビュー
   - コードオーナーシップ
   - ペアプログラミング

3. パフォーマンス
   - バンドルサイズ最適化
   - メモリリーク防止
   - レンダリング最適化

### 実行環境パターン

1. WSL固有のパターン

   - プロセス管理
     - シグナルハンドリング
     - プロセス間通信
     - リソース解放
   - ファイルシステム
     - パス解決
     - パーミッション管理
     - 一時ファイル処理
   - ネットワーク
     - ポートマッピング
     - プロキシ設定
     - ホスト名解決

2. 開発環境パターン
   - 環境分離
     - 開発/テスト/本番の分離
     - 依存関係の管理
     - 設定の外部化（`.env`ファイル、環境変数）
   - ツール連携
     - エディタ統合
     - デバッガ連携
     - ログ収集
   - データベース統一
     - ローカル開発環境と本番環境でPostgreSQLを使用

### セキュリティパターン

1. 入力検証

   - バリデーション
   - サニタイズ
   - エスケープ処理

2. 認証/認可

   - APIキー管理
   - アクセス制御
   - セッション管理

3. データ保護
   - 機密情報の管理
   - エラーメッセージの制御
   - ログ出力の制御
