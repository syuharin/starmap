import globals from "globals";
import pluginJs from "@eslint/js";
import pluginReactConfig from "eslint-plugin-react/configs/recommended.js";
import pluginReactHooks from "eslint-plugin-react-hooks";
import jestPlugin from "eslint-plugin-jest";

export default [
  // 1. グローバル設定: デフォルトはブラウザ環境
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        process: "readonly", // Allow process global (for process.env access via build tools)
      },
      parserOptions: {
        ecmaFeatures: {
          jsx: true, // JSXを有効化
        },
      },
    },
    settings: {
      react: {
        version: "detect", // Reactのバージョンを自動検出
      },
    },
  },

  // 2. ESLint推奨ルール
  pluginJs.configs.recommended,

  // 3. React推奨ルール (JSXファイルに適用)
  {
    ...pluginReactConfig,
    files: ["src/app/**/*.{js,jsx}"],
    rules: {
      ...pluginReactConfig.rules,
      "react/react-in-jsx-scope": "off", // React 17+ では不要
      "react/prop-types": "off", // TypeScript未使用のため一旦オフ (必要なら調整)
      "react/no-unknown-property": [
        "error",
        { ignore: ["args", "position", "intensity"] },
      ], // R3Fのプロパティを許可
    },
  },

  // 4. React Hooksルール (JSXファイルに適用)
  {
    files: ["src/app/**/*.{js,jsx}"],
    plugins: {
      "react-hooks": pluginReactHooks,
    },
    rules: {
      ...pluginReactHooks.configs.recommended.rules,
    },
  },

  // 5. Node.js/CommonJS 用の設定 (特定のファイルに適用)
  {
    files: [
      "*.js", // ルートの .js ファイル (webpack.config.js, babel.config.js など)
      "src/app/main.js", // Electronのメインプロセス
      "src/utils/**/*.js", // ユーティリティとテスト関連
    ],
    languageOptions: {
      globals: {
        ...globals.node, // Node.jsのグローバル変数
        __dirname: "readonly", // CommonJSのグローバル変数
        process: "readonly",
        require: "readonly",
        module: "readonly",
      },
    },
    rules: {
      // CommonJS特有のルール調整が必要な場合はここに追加
    },
  },

  // 6. Jest 用の設定 (テストファイルに適用)
  {
    files: ["src/utils/test/**/*.js"],
    ...jestPlugin.configs["flat/recommended"],
    rules: {
      ...jestPlugin.configs["flat/recommended"].rules,
      // 必要に応じてJestルールの調整
    },
    languageOptions: {
      globals: {
        ...globals.jest, // Jestのグローバル変数
      },
    },
  },

  // 7. 無視するファイル
  {
    ignores: [
      "node_modules/",
      "dist/",
      "coverage/",
      ".webpack/",
      "eslint.config.js", // 設定ファイル自体
    ],
  },

  // 8. その他のルール調整 (全体に適用、または files で絞り込み)
  {
    rules: {
      "no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrors: "none",
          ignoreRestSiblings: true,
        },
      ], // Allow unused vars starting with _, ignore rest siblings, and ignore caught errors
      // プロジェクト固有のルール調整
    },
  },
];
