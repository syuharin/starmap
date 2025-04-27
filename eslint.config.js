// eslint.config.js
import globals from "globals";
import pluginJs from "@eslint/js";
import pluginReactConfig from "eslint-plugin-react/configs/recommended.js";
import pluginReactHooks from "eslint-plugin-react-hooks";
import pluginJest from "eslint-plugin-jest";

// Helper function to merge globals and trim keys
const mergeGlobals = (...globalSources) => {
  const combined = {};
  for (const source of globalSources) {
    for (const key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        combined[key.trim()] = source[key]; // Trim whitespace from keys
      }
    }
  }
  return combined;
};

import babelParser from "@babel/eslint-parser"; // Babelパーサーをインポート
import pluginReact from "eslint-plugin-react"; // Reactプラグインをインポート

export default [
  { languageOptions: { globals: mergeGlobals(globals.browser, globals.node) } }, // Trimmed globals
  pluginJs.configs.recommended, // ESLint推奨ルール
  { // React設定
    files: ["src/app/**/*.{js,jsx}"], // Reactコンポーネントファイルに適用 (src/app 以下に限定)
    languageOptions: {
      parser: babelParser, // Babelパーサーを指定
      parserOptions: {
        requireConfigFile: true, // babel.config.cjs を読み込むように変更
        babelOptions: {
           presets: ["@babel/preset-react"] // Reactプリセットを指定 (babel.config.cjsからも読み込まれるはず)
        },
        ecmaFeatures: {
          jsx: true, // JSXを有効化
        },
      },
      globals: { // React関連のグローバル変数を追加する場合
        // ...
      }
    },
    plugins: { // プラグインを明示的に指定
      react: pluginReact,
      "react-hooks": pluginReactHooks,
    },
    settings: {
      react: {
        version: "detect", // Reactバージョン自動検出
      },
    },
    rules: { // ルールを明示的に指定
      ...pluginReact.configs.recommended.rules, // React推奨ルール
      ...pluginReactHooks.configs.recommended.rules, // React Hooks推奨ルール
      "react/react-in-jsx-scope": "off", // React 17以降は不要な場合が多い
      "react/prop-types": "off", // TypeScriptを使用する場合は不要になることが多いが、JS/JSXなので一旦オフに
      "react/no-unknown-property": "off" // @react-three/fiber のプロパティを許可
      // 必要に応じてルールを追加・上書き
    },
  },
  { // Jest設定
    files: ["**/*.test.js", "**/*.spec.js", "src/utils/test/**/*.js"], // テストファイルに適用
    plugins: { // Jestプラグインをオブジェクト形式で指定
      jest: pluginJest,
    },
    languageOptions: {
      globals: { // Jestのグローバル変数を追加
        ...globals.jest,
      },
    },
    rules: { // 推奨ルールを展開し、未使用変数ルールを調整
      ...pluginJest.configs.recommended.rules,
      "no-unused-vars": ["error", { "caughtErrors": "none" }], // catchブロックの未使用エラーを無視
      // 必要に応じてJestルールを追加・上書き
    },
  },
  { // グローバルな無視設定
    ignores: [
        "node_modules/",
        "dist/",
        "build/",
        ".webpack/",
        "coverage/",
        "test-results/",
        "src/backend/", // バックエンドコードは対象外
        "src/mobile/", // モバイルコードは対象外 (もしあれば)
        "babel.config.js",
        "webpack.config.js",
        "eslint.config.js"
    ],
  }
];
