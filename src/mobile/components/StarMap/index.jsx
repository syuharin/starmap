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
const VIEWPORT_WIDTH = 390; // モバイル画面の幅に合わせる
const VIEWPORT_HEIGHT = 844; // モバイル画面の高さに合わせる
const SCALE = 0.5; // スケーリング係数を縮小

const StarMap = ({ selectedDate, showCompass, showAltitude, focusedObject }) => {
  // すべてのフックを最上部に配置
  const [constellationData, setConstellationData] = useState(null);
  const [error, setError] = useState(null);
  const [rotation, setRotation] = useState({ x: 0, y: 0 }); // 初期仰角0度

  // ビューポートの設定を最適化
  const viewportConfig = useMemo(() => ({
    width: VIEWPORT_WIDTH,
    height: VIEWPORT_HEIGHT,
    x: 0,  // 原点を(0,0)に設定
    y: 0
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
        viewBox={`0 0 ${viewportConfig.width} ${viewportConfig.height}`}
        preserveAspectRatio="xMidYMid meet"
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
          x="0"
          y="0"
          width={viewportConfig.width}
          height={viewportConfig.height}
          fill="url(#sky)"
        />

        <g transform={`translate(${VIEWPORT_WIDTH/2} ${VIEWPORT_HEIGHT/2})`}>
          <Controls
            initialRotation={rotation}
            onRotationChange={setRotation}
          >
            <g transform={`scale(${SCALE}) rotate(${rotation.x} 0 0)`}>
            {showAltitude && <AltitudeLines />}
            {showCompass && <CompassRose />}
            <ConstellationLines constellationData={constellationData} />
            <Stars
              constellationData={constellationData}
              focusedObject={focusedObject}
            />
            </g>
          </Controls>
        </g>
      </svg>
    </Box>
  );
};

export default StarMap;
