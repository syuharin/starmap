/**
 * Puppeteerを使用したヘッドレステストユーティリティ
 */
const puppeteer = require('puppeteer');

/**
 * テスト用ブラウザを起動
 * @returns {Promise<Browser>} Puppeteerブラウザインスタンス
 */
const launchTestBrowser = async () => {
  return await puppeteer.launch({
    headless: false, // Run in headful mode for visual debugging
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--enable-webgl', // Explicitly enable WebGL
      '--ignore-gpu-blacklist', // Ignore GPU blacklist (use with caution)
      // '--use-gl=desktop', // Try forcing desktop GL (might help on some systems)
      // '--enable-features=VaapiVideoDecoder', // Hardware acceleration hints (might vary)
    ],
  });
};

/**
 * 指定したURLのページを開く
 * @param {Browser} browser - Puppeteerブラウザインスタンス
 * @param {string} url - 開くURL
 * @returns {Promise<Page>} Puppeteerページインスタンス
 */
const openPage = async (browser, url) => {
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 720 });
  await page.goto(url, { waitUntil: 'networkidle0' });
  return page;
};

/**
 * スクリーンショットを取得
 * @param {Page} page - Puppeteerページインスタンス
 * @param {string} name - スクリーンショットの名前
 * @returns {Promise<string>} スクリーンショットのパス
 */
const takeScreenshot = async (page, name) => {
  const path = `./test-results/screenshots/${name}-${Date.now()}.png`;
  await page.screenshot({
    path,
    fullPage: true,
  });
  return path;
};

/**
 * レンダリング結果を検証
 * @param {Page} page - Puppeteerページインスタンス
 * @returns {Promise<Object>} 検証結果
 */
const validateRendering = async (page) => {
  const results = await page.evaluate(() => {
    // WebGLコンテキストの検証
    const canvas = document.querySelector('canvas'); // Keep only one declaration
    let gl = null;
    let glError = 'WebGL context not available'; // Default error message
    if (canvas) {
      gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (gl) {
        glError = gl.getError(); // Get actual error if context exists
        console.log('[Test Debug] WebGL Error Code:', glError); // Log the error code
      } else {
         console.log('[Test Debug] Failed to get WebGL context.');
      }
    } else {
       console.log('[Test Debug] Canvas element not found.');
    }


    // パフォーマンスメトリクスの取得
    const performance = window.performance;
    const memory = performance?.memory;
    const timing = performance?.timing;

    // エラーコンソールの取得
    const errors = [];
    const originalError = console.error;
    console.error = (...args) => {
      errors.push(args);
      originalError.apply(console, args);
    };

    return {
      hasWebGL: !!gl,
      glError: glError, // Use the potentially updated glError
      memoryUsage: memory ? {
        usedJSHeapSize: memory.usedJSHeapSize,
        jsHeapSizeLimit: memory.jsHeapSizeLimit,
      } : null,
      loadTime: timing ? timing.loadEventEnd - timing.navigationStart : null,
      errors,
    };
  });

  return {
    timestamp: Date.now(),
    ...results,
  };
};

/**
 * パフォーマンスメトリクスを計測
 * @param {Page} page - Puppeteerページインスタンス
 * @returns {Promise<Object>} パフォーマンスメトリクス
 */
const measurePerformance = async (page) => {
  const metrics = await page.metrics();
  const performanceTiming = await page.evaluate(() => {
    const timing = window.performance.timing;
    return {
      loadTime: timing.loadEventEnd - timing.navigationStart,
      domContentLoaded: timing.domContentLoadedEventEnd - timing.navigationStart,
      firstPaint: performance.getEntriesByType('paint')[0]?.startTime,
    };
  });

  return {
    timestamp: Date.now(),
    metrics,
    performanceTiming,
  };
};

/**
 * 要素の表示を検証
 * @param {Page} page - Puppeteerページインスタンス
 * @param {string} selector - 要素のセレクタ
 * @returns {Promise<Object>} 検証結果
 */
const validateElement = async (page, selector) => {
  const element = await page.$(selector);
  if (!element) {
    return {
      exists: false,
      visible: false,
      position: null,
      size: null,
    };
  }

  const isVisible = await page.evaluate((el) => {
    const style = window.getComputedStyle(el);
    return style.display !== 'none' && 
           style.visibility !== 'hidden' && 
           style.opacity !== '0';
  }, element);

  const box = await element.boundingBox();

  return {
    exists: true,
    visible: isVisible,
    position: box ? { x: box.x, y: box.y } : null,
    size: box ? { width: box.width, height: box.height } : null,
  };
};

/**
 * テスト結果をレポート
 * @param {Object} results - テスト結果
 * @returns {Promise<void>}
 */
const generateReport = async (results) => {
  const report = {
    timestamp: Date.now(),
    summary: {
      total: results.length,
      passed: results.filter(r => r.passed).length,
      failed: results.filter(r => !r.passed).length,
    },
    details: results,
  };

  // レポートをファイルに保存
  const fs = require('fs').promises;
  await fs.writeFile(
    `./test-results/report-${Date.now()}.json`,
    JSON.stringify(report, null, 2)
  );

  return report;
};

module.exports = {
  launchTestBrowser,
  openPage,
  takeScreenshot,
  validateRendering,
  measurePerformance,
  validateElement,
  generateReport,
};
