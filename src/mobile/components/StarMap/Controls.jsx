import React, { useState, useRef, useCallback, useEffect } from 'react';

const Controls = ({ children, onRotationChange }) => {
  const [isDragging, setIsDragging] = useState(false);
  const lastPosition = useRef({ x: 0, y: 0 });
  const velocity = useRef({ x: 0, y: 0 });
  const animationFrame = useRef(null);
  const rotation = useRef({ x: 0, y: 0 });

  const animate = useCallback(() => {
    if (Math.abs(velocity.current.x) > 0.01 || Math.abs(velocity.current.y) > 0.01) {
      rotation.current = {
        x: rotation.current.x + velocity.current.x,
        y: rotation.current.y + velocity.current.y
      };

      onRotationChange(rotation.current);
      
      // 減衰を適用
      velocity.current.x *= 0.95;
      velocity.current.y *= 0.95;
      
      animationFrame.current = requestAnimationFrame(animate);
    }
  }, [onRotationChange]);

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
      x: deltaX * 0.1,
      y: deltaY * 0.1
    };
    
    lastPosition.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY
    };
    
    rotation.current = {
      x: rotation.current.x + deltaX,
      y: rotation.current.y + deltaY
    };

    onRotationChange(rotation.current);
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
