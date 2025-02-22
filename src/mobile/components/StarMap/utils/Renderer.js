import { Matrix } from './Matrix';

export class Renderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.width = canvas.width;
    this.height = canvas.height;
    this.view = {
      position: { x: 0, y: 0, z: 300 },
      rotationX: 0,
      rotationY: 0
    };
  }

  clear() {
    this.ctx.fillStyle = 'black';
    this.ctx.fillRect(0, 0, this.width, this.height);
  }

  updateView(view) {
    this.view = view;
  }

  // 3D座標を2D画面座標に変換
  project(point) {
    // ビュー行列を生成
    const viewMatrix = Matrix.chain(
      Matrix.translation(-this.view.position.x, -this.view.position.y, -this.view.position.z),
      Matrix.rotationX(this.view.rotationX),
      Matrix.rotationY(this.view.rotationY)
    );

    // 透視投影行列を生成
    const aspect = this.width / this.height;
    const projectionMatrix = Matrix.perspective(60, aspect, 0.1, 1000);

    // 変換行列を適用
    const transformed = Matrix.multiplyVector(
      Matrix.multiply(projectionMatrix, viewMatrix),
      [point.x, point.y, point.z]
    );

    // NDC座標からスクリーン座標に変換
    const x = (transformed.x + 1) * this.width / 2;
    const y = (-transformed.y + 1) * this.height / 2;
    const scale = this.view.position.z / (this.view.position.z - transformed.z);

    return { x, y, scale };
  }

  // 星を描画
  drawStar(star) {
    const projected = this.project(star);
    
    // 星の大きさを計算（等級に基づく）
    const size = Math.max(1, (6 - star.magnitude) * projected.scale);
    
    // グラデーションを作成
    const gradient = this.ctx.createRadialGradient(
      projected.x, projected.y, 0,
      projected.x, projected.y, size
    );
    gradient.addColorStop(0, 'white');
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

    // 星を描画
    this.ctx.fillStyle = gradient;
    this.ctx.beginPath();
    this.ctx.arc(projected.x, projected.y, size, 0, Math.PI * 2);
    this.ctx.fill();
  }

  // 星座線を描画
  drawConstellationLine(start, end) {
    const projectedStart = this.project(start);
    const projectedEnd = this.project(end);

    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    this.ctx.lineWidth = 1;
    this.ctx.beginPath();
    this.ctx.moveTo(projectedStart.x, projectedStart.y);
    this.ctx.lineTo(projectedEnd.x, projectedEnd.y);
    this.ctx.stroke();
  }

  // 方位円を描画
  drawCompassRose(radius) {
    const center = { x: 0, y: 0, z: 0 };
    const projected = this.project(center);
    const scale = projected.scale;
    const r = radius * scale;

    // 方位円を描画
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    this.ctx.lineWidth = 1;
    this.ctx.beginPath();
    this.ctx.arc(projected.x, projected.y, r, 0, Math.PI * 2);
    this.ctx.stroke();

    // 方位点を描画
    const directions = ['N', 'E', 'S', 'W'];
    const angles = [0, Math.PI / 2, Math.PI, Math.PI * 3 / 2];
    
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    this.ctx.font = '14px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';

    directions.forEach((dir, i) => {
      const x = projected.x + r * Math.sin(angles[i]);
      const y = projected.y - r * Math.cos(angles[i]);
      this.ctx.fillText(dir, x, y);
    });
  }

  // 高度線を描画
  drawAltitudeLines(radius) {
    const center = { x: 0, y: 0, z: 0 };
    const projected = this.project(center);
    const scale = projected.scale;
    const r = radius * scale;

    // 高度線を描画（30度ごと）
    for (let alt = 30; alt <= 90; alt += 30) {
      const altRadius = r * Math.cos(alt * Math.PI / 180);
      
      this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      this.ctx.lineWidth = 1;
      this.ctx.beginPath();
      this.ctx.arc(projected.x, projected.y, altRadius, 0, Math.PI * 2);
      this.ctx.stroke();

      // 高度の数値を表示
      this.ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      this.ctx.font = '12px Arial';
      this.ctx.textAlign = 'left';
      this.ctx.fillText(`${alt}°`, projected.x + altRadius, projected.y);
    }
  }
}
