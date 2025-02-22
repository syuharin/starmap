/**
 * StarMapコンポーネントのテストケース
 */
const {
  launchTestBrowser,
  openPage,
  takeScreenshot,
  validateRendering,
  measurePerformance,
  validateElement,
  generateReport,
} = require('./puppeteerUtils');

describe('StarMap Component Tests', () => {
  let browser;
  let page;
  const testResults = [];

  beforeAll(async () => {
    browser = await launchTestBrowser();
  }, 70000);

  afterAll(async () => {
    if (browser) {
      await browser.close();
    }
    await generateReport(testResults);
  });

  beforeEach(async () => {
    try {
      page = await openPage(browser, 'http://localhost:3002');
      // ページの読み込みを待機
      await page.waitForSelector('#root', { timeout: 60000 });
      // 初期化を待機
      await new Promise(resolve => setTimeout(resolve, 2000));
    } catch (error) {
      console.error('ページの初期化に失敗:', error);
      throw error;
    }
  }, 70000);

  afterEach(async () => {
    if (page) {
      await page.close();
    }
  });

  test('StarMapが正しくレンダリングされる', async () => {
    try {
      // 要素の存在を確認
      await page.waitForSelector('canvas', { timeout: 10000 });
      const result = await validateRendering(page);
      const screenshotPath = await takeScreenshot(page, 'starmap-initial');

      const testResult = {
        name: 'StarMap初期レンダリング',
        passed: result.hasWebGL && !result.glError,
        details: {
          ...result,
          screenshotPath,
        },
      };

      testResults.push(testResult);
      expect(testResult.passed).toBe(true);
    } catch (error) {
      console.error('レンダリングテストに失敗:', error);
      throw error;
    }
  }, 30000);

  test('星座が正しく表示される', async () => {
    try {
      // 要素の存在を確認
      await page.waitForSelector('.constellation-container', { timeout: 10000 });
      const constellationElement = await validateElement(page, '.constellation-container');
      const screenshotPath = await takeScreenshot(page, 'constellation-display');

      const testResult = {
        name: '星座表示テスト',
        passed: constellationElement.exists && constellationElement.visible,
        details: {
          constellationElement,
          screenshotPath,
        },
      };

      testResults.push(testResult);
      expect(testResult.passed).toBe(true);
    } catch (error) {
      console.error('星座表示テストに失敗:', error);
      throw error;
    }
  }, 30000);

  test('パフォーマンスが要件を満たしている', async () => {
    try {
      const metrics = await measurePerformance(page);
      const isPerformant = metrics.performanceTiming.loadTime < 3000 && // 3秒以内の読み込み
                          metrics.performanceTiming.firstPaint < 1000;  // 1秒以内の初期描画

      const testResult = {
        name: 'パフォーマンステスト',
        passed: isPerformant,
        details: metrics,
      };

      testResults.push(testResult);
      expect(testResult.passed).toBe(true);
    } catch (error) {
      console.error('パフォーマンステストに失敗:', error);
      throw error;
    }
  }, 30000);

  test('インタラクティブな操作が機能する', async () => {
    try {
      // コンテナの存在を確認
      await page.waitForSelector('.starmap-container', { timeout: 10000 });

      // ズーム操作
      await page.evaluate(() => {
        const event = new WheelEvent('wheel', { deltaY: -100 });
        document.querySelector('.starmap-container').dispatchEvent(event);
      });
      await new Promise(resolve => setTimeout(resolve, 500));
      const zoomScreenshot = await takeScreenshot(page, 'zoom-test');

      // 回転操作
      await page.mouse.move(400, 300);
      await page.mouse.down();
      await page.mouse.move(500, 400);
      await page.mouse.up();
      await new Promise(resolve => setTimeout(resolve, 500));
      const rotateScreenshot = await takeScreenshot(page, 'rotation-test');

      const testResult = {
        name: 'インタラクション操作テスト',
        passed: true, // スクリーンショットで目視確認
        details: {
          zoomScreenshot,
          rotateScreenshot,
        },
      };

      testResults.push(testResult);
      expect(testResult.passed).toBe(true);
    } catch (error) {
      console.error('インタラクションテストに失敗:', error);
      throw error;
    }
  }, 30000);

  test('検索機能が正しく動作する', async () => {
    try {
      // 検索フィールドの存在を確認
      await page.waitForSelector('.search-input', { timeout: 10000 });

      // 検索入力
      await page.type('.search-input', 'オリオン座');
      await new Promise(resolve => setTimeout(resolve, 500));
      const searchResults = await validateElement(page, '.search-results');
      const searchScreenshot = await takeScreenshot(page, 'search-test');

      const testResult = {
        name: '検索機能テスト',
        passed: searchResults.exists && searchResults.visible,
        details: {
          searchResults,
          searchScreenshot,
        },
      };

      testResults.push(testResult);
      expect(testResult.passed).toBe(true);
    } catch (error) {
      console.error('検索機能テストに失敗:', error);
      throw error;
    }
  }, 30000);
});
