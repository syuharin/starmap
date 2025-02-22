import React, { useState, useEffect } from 'react';
import { Box } from '@mui/material';
import { fetchConstellations } from '../../../shared/services/starService';
import StarMapCanvas from './StarMapCanvas';

const StarMap = ({ selectedDate, showCompass, showAltitude, focusedObject }) => {
  const [constellationData, setConstellationData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadConstellationData = async () => {
      try {
        const data = await fetchConstellations(selectedDate);
        
        // データ構造の検証
        if (!data) {
          throw new Error('星座データが取得できませんでした');
        }
        
        if (!Array.isArray(data.lines)) {
          throw new Error('星座線データの形式が不正です');
        }
        
        if (!Array.isArray(data.stars)) {
          throw new Error('星データの形式が不正です');
        }

        // データの整合性チェック
        data.lines.forEach((line, index) => {
          if (!line || !line.start || !line.end) {
            throw new Error(`星座線データが不正です (index: ${index})`);
          }
        });

        data.stars.forEach((star, index) => {
          if (!star || typeof star.x !== 'number' || typeof star.y !== 'number' || typeof star.z !== 'number') {
            throw new Error(`星データが不正です (index: ${index})`);
          }
        });

        setConstellationData(data);
      } catch (err) {
        console.error('星座データの取得に失敗しました:', err);
        setError(err.message);
      }
    };

    loadConstellationData();
  }, [selectedDate]);

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
    <Box sx={{ width: '100%', height: '100%', overflow: 'hidden', bgcolor: 'black' }}>
      <StarMapCanvas
        constellationData={constellationData}
        showCompass={showCompass}
        showAltitude={showAltitude}
        focusedObject={focusedObject}
      />
    </Box>
  );
};

export default StarMap;
