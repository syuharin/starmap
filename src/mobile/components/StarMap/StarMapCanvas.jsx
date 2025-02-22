import React, { useEffect, useRef, useState } from 'react';
import { Box } from '@mui/material';
import { Renderer } from './utils/Renderer';
import { Controls } from './utils/Controls';

const StarMapCanvas = ({ 
  constellationData,
  showCompass = true,
  showAltitude = true,
  focusedObject = null
}) => {
  const canvasRef = useRef(null);
  const rendererRef = useRef(null);
  const controlsRef = useRef(null);
  const [rotation, setRotation] = useState({ x: 0, y: 25 }); // 初期仰角25度

  // キャンバスの初期化
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // キャンバスのサイズを設定
    const updateSize = () => {
      const scale = window.devicePixelRatio || 1;
      canvas.width = canvas.clientWidth * scale;
      canvas.height = canvas.clientHeight * scale;

      if (rendererRef.current) {
        rendererRef.current.width = canvas.width;
        rendererRef.current.height = canvas.height;
      }
    };

    // レンダラーを初期化
    updateSize();
    rendererRef.current = new Renderer(canvas);

    // コントロールを初期化
    controlsRef.current = new Controls(setRotation);

    // リサイズイベントの処理
    window.addEventListener('resize', updateSize);
    return () => {
      window.removeEventListener('resize', updateSize);
      if (controlsRef.current) {
        controlsRef.current.dispose();
      }
    };
  }, []);

  // アニメーションフレームの処理
  useEffect(() => {
    // レンダラーとデータの存在チェック
    if (!rendererRef.current || !constellationData) return;

    let animationFrame;
    const animate = () => {
      const renderer = rendererRef.current;
      
      // 画面をクリア
      renderer.clear();

      // カメラの位置を更新
      renderer.updateView({
        position: { x: 0, y: 0, z: 300 },
        rotationX: rotation.y,
        rotationY: rotation.x
      });

      // 方位円と高度線を描画
      if (showCompass) {
        renderer.drawCompassRose(180);
      }
      if (showAltitude) {
        renderer.drawAltitudeLines(450);
      }

      // 星座データを描画
      if (constellationData.lines && Array.isArray(constellationData.lines)) {
        // 星座線を描画
        constellationData.lines.forEach(line => {
          if (line && line.start && line.end) {
            renderer.drawConstellationLine(line.start, line.end);
          }
        });
      }

      if (constellationData.stars && Array.isArray(constellationData.stars)) {
        // 星を描画
        constellationData.stars.forEach(star => {
          if (star) {
            renderer.drawStar(star);
          }
        });
      }

      animationFrame = requestAnimationFrame(animate);
    };

    // アニメーションを開始
    animate();

    // クリーンアップ
    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [constellationData, showCompass, showAltitude, rotation]);

  // タッチイベントの処理
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const touchStartHandler = (event) => {
      if (controlsRef.current) {
        controlsRef.current.handleTouchStart(event);
      }
    };

    const touchMoveHandler = (event) => {
      if (controlsRef.current) {
        controlsRef.current.handleTouchMove(event);
      }
    };

    const touchEndHandler = (event) => {
      if (controlsRef.current) {
        controlsRef.current.handleTouchEnd(event);
      }
    };

    // パッシブイベントリスナーとして登録
    canvas.addEventListener('touchstart', touchStartHandler, { passive: true });
    canvas.addEventListener('touchmove', touchMoveHandler, { passive: true });
    canvas.addEventListener('touchend', touchEndHandler, { passive: true });

    return () => {
      canvas.removeEventListener('touchstart', touchStartHandler);
      canvas.removeEventListener('touchmove', touchMoveHandler);
      canvas.removeEventListener('touchend', touchEndHandler);
    };
  }, []);

  return (
    <Box sx={{ width: '100%', height: '100%', overflow: 'hidden', bgcolor: 'black' }}>
      <canvas
        ref={canvasRef}
        style={{
          width: '100%',
          height: '100%',
          touchAction: 'none'
        }}
      />
    </Box>
  );
};

export default StarMapCanvas;
