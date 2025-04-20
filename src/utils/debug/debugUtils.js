/**
 * デバッグユーティリティ
 * グラフィカルな実装の検証をサポートする関数群
 */

/**
 * 星の位置を検証し、期待値と実際の値の差異を報告
 * @param {Object} star - 星のデータ
 * @param {Object} expectedPosition - 期待される位置
 * @returns {Object} 検証結果
 */
export const validateStarPosition = (star, expectedPosition) => {
  const difference = {
    x: Math.abs(star.position.x - expectedPosition.x),
    y: Math.abs(star.position.y - expectedPosition.y),
    z: Math.abs(star.position.z - expectedPosition.z),
  };

  const tolerance = 0.0001; // 許容誤差
  const isValid = Object.values(difference).every(diff => diff < tolerance);

  console.table({
    starName: star.name,
    expected: expectedPosition,
    actual: star.position,
    difference,
    isValid,
  });

  return {
    isValid,
    difference,
    star: star.name,
  };
};

/**
 * レンダリング状態をログ出力
 * @param {Object} renderState - レンダリング状態
 */
export const logRenderState = (renderState) => {
  const {
    cameraPosition,
    rotation,
    scale,
    viewport,
    timestamp,
  } = renderState;

  console.group('レンダリング状態 - ' + new Date(timestamp).toISOString());
  console.log('カメラ位置:', cameraPosition);
  console.log('回転:', rotation);
  console.log('スケール:', scale);
  console.log('ビューポート:', viewport);
  console.groupEnd();
};

/**
 * パフォーマンスメトリクスを計測
 * @param {Function} callback - 計測対象の関数
 * @param {string} label - 計測ラベル
 * @returns {Object} 計測結果
 */
export const measurePerformance = async (callback, label) => {
  const start = performance.now();
  const result = await callback();
  const end = performance.now();
  const duration = end - start;

  console.log(`パフォーマンス計測 [${label}]: ${duration.toFixed(2)}ms`);

  return {
    duration,
    label,
    result,
  };
};

/**
 * エラーを検出して報告
 * @param {Object} context - エラーコンテキスト
 * @returns {Object} エラー情報
 */
export const detectErrors = (context) => {
  const errors = [];

  // WebGLコンテキストのエラーチェック
  if (context.gl) {
    const glError = context.gl.getError();
    if (glError !== context.gl.NO_ERROR) {
      errors.push({
        type: 'WebGL',
        code: glError,
        message: `WebGLエラー: ${glError}`,
      });
    }
  }

  // メモリ使用量のチェック
  if (window.performance && window.performance.memory) {
    const memory = window.performance.memory;
    if (memory.usedJSHeapSize > memory.jsHeapSizeLimit * 0.9) {
      errors.push({
        type: 'Memory',
        message: 'メモリ使用量が90%を超えています',
        usage: memory.usedJSHeapSize,
        limit: memory.jsHeapSizeLimit,
      });
    }
  }

  // フレームレートのチェック
  if (context.fps && context.fps < 30) {
    errors.push({
      type: 'Performance',
      message: 'フレームレートが30FPS未満です',
      fps: context.fps,
    });
  }

  if (errors.length > 0) {
    console.error('検出されたエラー:', errors);
  }

  return {
    hasErrors: errors.length > 0,
    errors,
    timestamp: Date.now(),
  };
};

/**
 * デバッグモードの設定を管理
 */
export const DebugConfig = {
  enabled: false,
  logLevel: 'info', // 'error' | 'warn' | 'info' | 'debug'
  showGrid: false,
  showAxes: false,
  showBoundingBox: false,
  performanceMonitoring: false,
};

/**
 * デバッグ設定を更新
 * @param {Object} config - 新しい設定
 */
export const updateDebugConfig = (config) => {
  Object.assign(DebugConfig, config);
  console.log('デバッグ設定を更新:', DebugConfig);
};
