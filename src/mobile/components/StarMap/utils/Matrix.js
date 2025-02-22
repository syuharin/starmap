/**
 * 3D行列演算を行うクラス
 */
export class Matrix {
  /**
   * 4x4行列を生成
   */
  static identity() {
    return [
      1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 1, 0,
      0, 0, 0, 1
    ];
  }

  /**
   * 平行移動行列を生成
   */
  static translation(x, y, z) {
    return [
      1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 1, 0,
      x, y, z, 1
    ];
  }

  /**
   * X軸回転行列を生成
   */
  static rotationX(angle) {
    const rad = angle * Math.PI / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);
    return [
      1, 0,    0,   0,
      0, cos,  sin, 0,
      0, -sin, cos, 0,
      0, 0,    0,   1
    ];
  }

  /**
   * Y軸回転行列を生成
   */
  static rotationY(angle) {
    const rad = angle * Math.PI / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);
    return [
      cos, 0, -sin, 0,
      0,   1, 0,    0,
      sin, 0, cos,  0,
      0,   0, 0,    1
    ];
  }

  /**
   * Z軸回転行列を生成
   */
  static rotationZ(angle) {
    const rad = angle * Math.PI / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);
    return [
      cos,  sin, 0, 0,
      -sin, cos, 0, 0,
      0,    0,   1, 0,
      0,    0,   0, 1
    ];
  }

  /**
   * スケール行列を生成
   */
  static scale(x, y, z) {
    return [
      x, 0, 0, 0,
      0, y, 0, 0,
      0, 0, z, 0,
      0, 0, 0, 1
    ];
  }

  /**
   * 透視投影行列を生成
   */
  static perspective(fov, aspect, near, far) {
    const f = Math.tan(Math.PI * 0.5 - 0.5 * fov * Math.PI / 180);
    const rangeInv = 1.0 / (near - far);

    return [
      f / aspect, 0, 0,                         0,
      0,          f, 0,                         0,
      0,          0, (near + far) * rangeInv,   -1,
      0,          0, near * far * rangeInv * 2, 0
    ];
  }

  /**
   * 行列の乗算
   */
  static multiply(a, b) {
    const result = new Array(16);
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        let sum = 0;
        for (let k = 0; k < 4; k++) {
          sum += a[i * 4 + k] * b[k * 4 + j];
        }
        result[i * 4 + j] = sum;
      }
    }
    return result;
  }

  /**
   * ベクトルと行列の乗算
   */
  static multiplyVector(matrix, vector) {
    const result = new Array(4);
    for (let i = 0; i < 4; i++) {
      let sum = 0;
      for (let j = 0; j < 4; j++) {
        sum += matrix[i * 4 + j] * (j < 3 ? vector[j] : 1);
      }
      result[i] = sum;
    }
    return {
      x: result[0] / result[3],
      y: result[1] / result[3],
      z: result[2] / result[3]
    };
  }

  /**
   * 複数の行列を乗算
   */
  static chain(...matrices) {
    return matrices.reduce((acc, matrix) => Matrix.multiply(acc, matrix));
  }
}
