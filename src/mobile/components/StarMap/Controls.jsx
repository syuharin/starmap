import React, { useState, useRef, useCallback, useEffect } from 'react';

// 定数定義
const INITIAL_ALTITUDE = 0; // 初期仰角（画面中央に配置）
const MAX_ALTITUDE = 90;     // 最大仰角（天頂）
const MIN_ALTITUDE = -10;    // 最小仰角（地平線以下）
const VIEW_ANGLE = 75;       // 視野角
const ROTATION_SENSITIVITY = 0.1; // 回転の感度

const Controls = ({ children, onRotationChange, initialRotation = { x: 0, y: INITIAL_ALTITUDE } }) => {
  const [isDragging, setIsDragging] = useState(false);
  const lastPosition = useRef({ x: 0, y: 0 });
  const velocity = useRef({ x: 0, y: 0 });
  const animationFrame = useRef(null);
  const rotation = useRef(initialRotation);

  // 回転の制限を行う関数
  const constrainRotation = useCallback((newRotation) => {
    return {
      x: ((newRotation.x % 360) + 360) % 360, // 方位角は0-359度の範囲に正規化
      y: Math.max(MIN_ALTITUDE, Math.min(MAX_ALTITUDE, newRotation.y)) // 仰角の制限
    };
  }, []);

  const animate = useCallback(() => {
    if (Math.abs(velocity.current.x) > 0.01 || Math.abs(velocity.current.y) > 0.01) {
      const newRotation = constrainRotation({
        x: rotation.current.x + velocity.current.x,
        y: rotation.current.y + velocity.current.y
      });

      rotation.current = newRotation;
      onRotationChange(newRotation);
      
      // 減衰を適用
      velocity.current.x *= 0.95;
      velocity.current.y *= 0.95;
      
      animationFrame.current = requestAnimationFrame(animate);
    }
  }, [onRotationChange, constrainRotation]);

  const handleTouchStart = (e) => {
    setIsDragging(true);
    lastPosition.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY
    };
    cancelAnimationFrame(animationFrame.current);
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    
    const deltaX = e.touches[0].clientX - lastPosition.current.x;
    const deltaY = e.touches[0].clientY - lastPosition.current.y;
    
    velocity.current = {
      x: deltaX * ROTATION_SENSITIVITY,
      y: deltaY * ROTATION_SENSITIVITY
    };
    
    lastPosition.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY
    };
    
    const newRotation = constrainRotation({
      x: rotation.current.x + deltaX * ROTATION_SENSITIVITY,
      y: rotation.current.y + deltaY * ROTATION_SENSITIVITY
    });

    rotation.current = newRotation;
    onRotationChange(newRotation);
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    animationFrame.current = requestAnimationFrame(animate);
  };

  // コンポーネントのアンマウント時にアニメーションをクリーンアップ
  useEffect(() => {
    return () => {
      if (animationFrame.current) {
        cancelAnimationFrame(animationFrame.current);
      }
    };
  }, []);

  return (
    <g
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{
        touchAction: 'none', // タッチイベントのブラウザデフォルト動作を防止
        cursor: isDragging ? 'grabbing' : 'grab'
      }}
    >
      {children}
    </g>
  );
};

export default Controls;
