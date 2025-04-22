# Windows環境セットアップガイド

## 必要なソフトウェア

以下のソフトウェアをインストールしてください：

1. Python 3.10以上

   - [Python公式サイト](https://www.python.org/downloads/)からインストーラーをダウンロード
   - インストール時に「Add Python to PATH」にチェックを入れる
   - コマンドプロンプトで`python --version`を実行して、インストールを確認

2. Node.js v18以上

   - [Node.js公式サイト](https://nodejs.org/)からLTS版をダウンロード
   - コマンドプロンプトで`node --version`を実行して、インストールを確認

3. Git for Windows

   - [Git公式サイト](https://git-scm.com/download/win)からインストーラーをダウンロード
   - コマンドプロンプトで`git --version`を実行して、インストールを確認

4. Visual Studio Code

   - [VS Code公式サイト](https://code.visualstudio.com/)からインストーラーをダウンロード
   - 以下の拡張機能をインストール：
     - ESLint
     - Prettier
     - Python
     - TypeScript
     - GitLens

5. PostgreSQL
   - [PostgreSQL公式サイト](https://www.postgresql.org/download/)からWindows用のインストーラーをダウンロードしてインストールします。
   - インストール中にデータベースとユーザーを作成します（例: データベース名 `starmap`, ユーザー名 `your_user`, パスワード `your_password`）。

## プロジェクトのセットアップ

1. プロジェクトのクローン

```cmd
git clone [repository-url]
cd starmap
```

2. Python仮想環境の作成とパッケージのインストール

```cmd
python -m venv venv
.\venv\Scripts\activate
cd src/backend
pip install -r requirements.txt
cd ../..
```

3. Node.jsパッケージのインストール

```cmd
npm install
```

4. データベースの初期化

```cmd
cd src/backend
python init_db.py
cd ../..
```

4. 環境変数の設定

   - プロジェクトルートに `.env` という名前のファイルを作成します。
   - `.env` ファイルに以下の内容を記述し、PostgreSQLの接続情報に合わせて編集します。
     ```dotenv
     DATABASE_URL=postgresql://your_user:your_password@localhost:5432/starmap
     FRONTEND_URL=http://localhost:3002 # 開発用フロントエンドURL (統合後)
     ENVIRONMENT=development
     ```

5. データベースの初期化

```cmd
cd src/backend
python init_db.py
cd ../..
```

2. フロントエンド開発サーバーの起動（新しいコマンドプロンプトで）

```cmd
npm run dev:frontend
```

## アクセス方法

- フロントエンド: http://localhost:3002
- バックエンドAPI: http://localhost:8000

## トラブルシューティング

1. Python関連のエラー

   - 仮想環境が有効になっているか確認（プロンプトに`(venv)`が表示されているか）
   - 必要に応じて`.\venv\Scripts\activate`を実行

2. Node.js関連のエラー

   - `node_modules`を削除して`npm install`を再実行
   - 必要に応じて`npm cache clean --force`を実行

3. ポート競合

   - 使用するポート（3002, 3003, 8000）が他のプロセスで使用されていないか確認
   - タスクマネージャーで確認し、必要に応じて該当プロセスを終了

4. データベース関連のエラー (PostgreSQL)
   - PostgreSQLサービスが実行中か確認します。
   - `.env` ファイルの `DATABASE_URL` が正しいか確認します。
   - データベースが存在しない、またはテーブルが作成されていない場合は、`cd src/backend` してから `python init_db.py` を実行します。

## 開発のヒント

1. VSCodeでの開発

   - プロジェクトフォルダをVSCodeで開く
   - Pythonインタープリタとして仮想環境を選択
   - ESLintとPrettierの設定を有効化

2. デバッグ

   - VSCodeのデバッグ機能を使用
   - ブラウザの開発者ツールを活用
   - バックエンドのログを確認

3. コード変更
   - フロントエンド：ホットリロードが有効
   - バックエンド：自動リロードが有効
   - データベース：変更後は`init_db.py`を再実行
