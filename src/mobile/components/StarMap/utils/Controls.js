/**
 * タッチ操作による星図の制御を行うクラス
 */
export class Controls {
  constructor(onRotationChange) {
    this.onRotationChange = onRotationChange;
    
    // カメラの状態
    this.rotation = { x: 0, y: 0 };
    this.velocity = { x: 0, y: 0 };
    this.lastTouch = null;
    this.isDragging = false;
    
    // 定数
    this.ROTATION_SENSITIVITY = 0.5;  // 回転の感度
    this.DECELERATION = 0.95;        // 減速率
    this.MIN_VELOCITY = 0.01;        // 最小速度
    this.MAX_Y_ROTATION = 85;        // Y軸回転の最大角度
    
    // アニメーションフレーム
    this.animationFrame = null;
  }

  /**
   * タッチ開始時の処理
   */
  handleTouchStart(event) {
    // シングルタッチのみ処理
    if (event.touches.length !== 1) return;

    this.isDragging = true;
    this.lastTouch = {
      x: event.touches[0].clientX,
      y: event.touches[0].clientY,
      time: Date.now()
    };
    this.velocity = { x: 0, y: 0 };
    
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }
  }

  /**
   * タッチ移動時の処理
   */
  handleTouchMove(event) {
    // シングルタッチのみ処理
    if (event.touches.length !== 1 || !this.isDragging || !this.lastTouch) return;

    const touch = {
      x: event.touches[0].clientX,
      y: event.touches[0].clientY,
      time: Date.now()
    };

    // 移動量と経過時間を計算
    const deltaX = touch.x - this.lastTouch.x;
    const deltaY = touch.y - this.lastTouch.y;
    const deltaTime = touch.time - this.lastTouch.time;

    if (deltaTime > 0) {
      // 速度を更新（ピクセル/ミリ秒）
      this.velocity = {
        x: (deltaX / deltaTime) * this.ROTATION_SENSITIVITY,
        y: (deltaY / deltaTime) * this.ROTATION_SENSITIVITY
      };

      // 回転を更新
      this.updateRotation(deltaX * this.ROTATION_SENSITIVITY, deltaY * this.ROTATION_SENSITIVITY);
    }
    
    this.lastTouch = touch;
  }

  /**
   * タッチ終了時の処理
   */
  handleTouchEnd(event) {
    // 他のタッチが残っている場合は処理しない
    if (event.touches.length > 0) return;

    this.isDragging = false;
    this.lastTouch = null;
    
    // 慣性アニメーションを開始
    if (Math.abs(this.velocity.x) > this.MIN_VELOCITY ||
        Math.abs(this.velocity.y) > this.MIN_VELOCITY) {
      this.animate();
    }
  }

  /**
   * 回転を更新
   */
  updateRotation(deltaX, deltaY) {
    // X軸回転（方位）は360度で正規化
    this.rotation.x = (this.rotation.x + deltaX) % 360;
    if (this.rotation.x < 0) this.rotation.x += 360;

    // Y軸回転（高度）は範囲を制限
    this.rotation.y = Math.max(
      -this.MAX_Y_ROTATION,
      Math.min(this.MAX_Y_ROTATION, this.rotation.y + deltaY)
    );

    // 回転の変更を通知
    this.onRotationChange(this.rotation);
  }

  /**
   * 慣性アニメーション
   */
  animate = () => {
    if (Math.abs(this.velocity.x) > this.MIN_VELOCITY ||
        Math.abs(this.velocity.y) > this.MIN_VELOCITY) {
      
      // 回転を更新
      this.updateRotation(this.velocity.x, this.velocity.y);

      // 速度を減衰
      this.velocity.x *= this.DECELERATION;
      this.velocity.y *= this.DECELERATION;

      // 次のフレームをリクエスト
      this.animationFrame = requestAnimationFrame(this.animate);
    }
  }

  /**
   * クリーンアップ
   */
  dispose() {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }
  }
}
