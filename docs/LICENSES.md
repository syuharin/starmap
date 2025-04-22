# ライセンス情報

このドキュメントには、StarMapプロジェクトおよびその依存関係のライセンス情報が含まれています。

## StarMap プロジェクト

本プロジェクトは **MITライセンス** の下で配布されています。詳細はプロジェクトルートの `LICENSE` ファイルを参照してください。

## 依存ライブラリ

### フロントエンド (npm パッケージ)

以下のリストは `package.json` に記載されている主要な直接依存関係のライセンス情報です。
_注意: `npm list` コマンドのエラーおよび `package-lock.json` のファイルサイズ制限により、一部ライセンスはWeb検索による推定情報です。正確な情報は各ライブラリの公式ドキュメント等でご確認ください。_

- @date-io/dayjs: MIT
- @emotion/react: MIT
- @emotion/styled: MIT
- @fontsource/roboto: OFL-1.1 (SIL Open Font License 1.1)
- @mui/icons-material: MIT
- @mui/material: MIT
- @mui/x-date-pickers: MIT
- @react-three/drei: MIT
- @react-three/fiber: MIT
- @reduxjs/toolkit: MIT
- axios: MIT
- dayjs: MIT
- electron: MIT
- react: MIT
- react-dom: MIT
- react-redux: MIT
- three: MIT

### バックエンド (Python パッケージ)

以下のリストは `src/backend/requirements.txt` に記載されているライブラリとそのライセンス情報です (`pip show` コマンドおよびWeb検索により確認)。

- fastapi: MIT
- uvicorn: BSD-3-Clause
- sqlalchemy: MIT
- skyfield: MIT
- numpy: BSD-3-Clause (バンドルされているコンポーネントには他の互換ライセンスが含まれる場合があります)
- pandas: BSD-3-Clause
- requests: Apache 2.0
- python-dotenv: BSD-3-Clause
- psycopg2-binary: LGPL with exceptions

## ライセンスの遵守について

本プロジェクトを使用または貢献する際には、プロジェクト自体のライセンスおよび依存ライブラリのライセンス条件を遵守してください。
