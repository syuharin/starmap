import React, { useState, useEffect } from 'react';
import { Box } from '@mui/material';
import { fetchConstellations } from '../../../shared/services/starService';
import Stars from './Stars';
import ConstellationLines from './ConstellationLines';
import CompassRose from './CompassRose';
import AltitudeLines from './AltitudeLines';
import Controls from './Controls';

const StarMap = ({ selectedDate, showCompass, showAltitude, focusedObject }) => {
  const [constellationData, setConstellationData] = useState(null);
  const [error, setError] = useState(null);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });

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

  if (error) {
    return (
      <Box sx={{ p: 3, textAlign: 'center', color: 'error.main' }}>
        データの取得に失敗しました: {error}
      </Box>
    );
  }

  if (!constellationData) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        データを読み込み中...
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', height: '100%', overflow: 'hidden' }}>
      <svg
        viewBox="-500 -500 1000 1000"
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

        <rect x="-500" y="-500" width="1000" height="1000" fill="url(#sky)" />

        <Controls onRotationChange={setRotation}>
          <g transform={`rotate(${rotation.x}, 0, 0)`}>
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
