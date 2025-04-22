/**
 * Jestのグローバルセットアップファイル
 */

// テストタイムアウトの延長（ビジュアルテストは時間がかかる可能性がある）
jest.setTimeout(30000);

// テスト結果ディレクトリの作成
const fs = require("fs").promises;
const path = require("path");

beforeAll(async () => {
  // test-resultsディレクトリの作成
  const resultsDir = path.join(process.cwd(), "test-results");
  const screenshotsDir = path.join(resultsDir, "screenshots");

  try {
    await fs.mkdir(resultsDir, { recursive: true });
    await fs.mkdir(screenshotsDir, { recursive: true });
  } catch (error) {
    console.warn("ディレクトリの作成に失敗しました:", error.message);
  }
});

// グローバルヘルパー関数
global.sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// エラーハンドリングの拡張
process.on("unhandledRejection", (error) => {
  console.error("未処理のPromise rejection:", error);
});

// コンソール出力のカスタマイズ
const originalConsoleLog = console.log;
const originalConsoleError = console.error;

console.log = (...args) => {
  originalConsoleLog("[テストログ]", ...args);
};

console.error = (...args) => {
  originalConsoleError("[テストエラー]", ...args);
};

// テスト環境変数の設定
process.env.NODE_ENV = "test";
process.env.BROWSER_TESTS = "true";

// グローバルマッチャーの追加
expect.extend({
  toBeWithinRange(received, floor, ceiling) {
    const pass = received >= floor && received <= ceiling;
    if (pass) {
      return {
        message: () =>
          `期待値 ${received} は ${floor} から ${ceiling} の範囲内です`,
        pass: true,
      };
    } else {
      return {
        message: () =>
          `期待値 ${received} は ${floor} から ${ceiling} の範囲内ではありません`,
        pass: false,
      };
    }
  },
});

// テスト用ユーティリティ関数
global.waitForElement = async (page, selector, timeout = 5000) => {
  try {
    await page.waitForSelector(selector, { timeout });
    return true;
  } catch (error) {
    console.error(`要素が見つかりませんでした: ${selector}`);
    return false;
  }
};

global.getElementText = async (page, selector) => {
  try {
    return await page.$eval(selector, (el) => el.textContent);
  } catch (error) {
    console.error(`テキストの取得に失敗しました: ${selector}`);
    return null;
  }
};

global.isElementVisible = async (page, selector) => {
  try {
    const element = await page.$(selector);
    if (!element) return false;

    const isVisible = await page.evaluate((el) => {
      const style = window.getComputedStyle(el);
      return (
        style.display !== "none" &&
        style.visibility !== "hidden" &&
        style.opacity !== "0" &&
        el.offsetWidth > 0 &&
        el.offsetHeight > 0
      );
    }, element);

    return isVisible;
  } catch (error) {
    console.error(`要素の可視性チェックに失敗しました: ${selector}`);
    return false;
  }
};

// カスタムレポーター
class CustomReporter {
  constructor() {
    this.startTime = Date.now();
    this.results = [];
  }

  onRunComplete(_, results) {
    const endTime = Date.now();
    const duration = endTime - this.startTime;

    console.log("\nテスト実行サマリー:");
    console.log(`総テスト数: ${results.numTotalTests}`);
    console.log(`成功: ${results.numPassedTests}`);
    console.log(`失敗: ${results.numFailedTests}`);
    console.log(`スキップ: ${results.numPendingTests}`);
    console.log(`実行時間: ${duration}ms`);

    if (results.numFailedTests > 0) {
      console.log("\n失敗したテスト:");
      results.testResults.forEach((testFile) => {
        testFile.testResults.forEach((test) => {
          if (test.status === "failed") {
            console.log(`- ${test.fullName}`);
            console.log(`  エラー: ${test.failureMessages.join("\n")}`);
          }
        });
      });
    }
  }
}

// カスタムレポーターの登録
global.customReporter = new CustomReporter();
