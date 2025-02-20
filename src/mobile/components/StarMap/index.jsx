import React, { useState, useEffect, useMemo } from 'react';
import { Box } from '@mui/material';
import { fetchConstellations } from '../../../shared/services/starService';
import Stars from './Stars';
import ConstellationLines from './ConstellationLines';
import CompassRose from './CompassRose';
import AltitudeLines from './AltitudeLines';
import Controls from './Controls';

// 定数定義
const VIEW_ANGLE = 75; // 視野角（度）
const VIEWPORT_SIZE = 1000;
const SCALE = 0.5 / Math.tan((VIEW_ANGLE * Math.PI) / 360); // スケーリング係数をさらに調整

const StarMap = ({ selectedDate, showCompass, showAltitude, focusedObject }) => {
  // すべてのフックを最上部に配置
  const [constellationData, setConstellationData] = useState(null);
  const [error, setError] = useState(null);
  const [rotation, setRotation] = useState({ x: 0, y: 17 }); // 初期仰角17度

  // ビューポートの設定を最適化
  const viewportConfig = useMemo(() => ({
    width: VIEWPORT_SIZE,
    height: VIEWPORT_SIZE,
    x: -VIEWPORT_SIZE / 4,
    y: -VIEWPORT_SIZE / 4
  }), []);

  useEffect(() => {
    const loadConstellationData = async () => {
      try {
        const data = await fetchConstellations(selectedDate);
        setConstellationData(data);
      } catch (err) {
        console.error('星座データの取得に失敗しました:', err);
        setError(err.message);
      }
    };

    loadConstellationData();
  }, [selectedDate]);

  // エラーとローディング状態を統合
  if (!constellationData) {
    return error ? (
      <Box sx={{ p: 3, textAlign: 'center', color: 'error.main' }}>
        データの取得に失敗しました: {error}
      </Box>
    ) : (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        データを読み込み中...
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', height: '100%', overflow: 'hidden' }}>
      <svg
        viewBox={`${viewportConfig.x} ${viewportConfig.y} ${viewportConfig.width} ${viewportConfig.height}`}
        style={{
          width: '100%',
          height: '100%',
          backgroundColor: 'black',
        }}
      >
        <defs>
          <radialGradient id="sky" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
            <stop offset="0%" stopColor="#000033" />
            <stop offset="100%" stopColor="#000000" />
          </radialGradient>
        </defs>

        <rect
          x={viewportConfig.x}
          y={viewportConfig.y}
          width={viewportConfig.width}
          height={viewportConfig.height}
          fill="url(#sky)"
        />

        <Controls
          initialRotation={rotation}
          onRotationChange={setRotation}
        >
          <g transform={`
            translate(${viewportConfig.width / 2}, ${viewportConfig.height / 2})
            rotate(${rotation.x}, 0, 0)
            translate(0, ${-rotation.y})
            scale(${SCALE})
          `}>
            {showAltitude && <AltitudeLines />}
            {showCompass && <CompassRose />}
            <ConstellationLines constellationData={constellationData} />
            <Stars
              constellationData={constellationData}
              focusedObject={focusedObject}
            />
          </g>
        </Controls>
      </svg>
    </Box>
  );
};

export default StarMap;
