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

5. SQLite
   - [SQLite公式サイト](https://www.sqlite.org/download.html)からWindows用のバイナリをダウンロード
   - ダウンロードしたファイルを適切なディレクトリに展開

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

## アプリケーションの起動

1. バックエンド開発サーバーの起動
```cmd
npm run dev:backend
```

2. フロントエンド開発サーバーの起動（新しいコマンドプロンプトで）
```cmd
npm run dev:frontend
```

3. モバイル版開発サーバーの起動（必要な場合、新しいコマンドプロンプトで）
```cmd
npm run dev:mobile
```

## アクセス方法

- フロントエンド: http://localhost:3002
- モバイル版: http://localhost:3003
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

4. データベース関連のエラー
   - `src/backend`ディレクトリに`database.sqlite`が存在するか確認
   - 存在しない場合は`python init_db.py`を実行

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
