import React from 'react'; // Reactインポートを復元
import { Line, Html } from '@react-three/drei';
import * as THREE from 'three';

export const AltitudeLines = ({ visible = true }) => {
  // 高度線を10度間隔で生成（-30度から80度まで）
  const altitudes = Array.from({ length: 12 }, (_, i) => -30 + i * 10);
  
  // 円周上の点を生成する関数
  const createCirclePoints = (altitude) => {
    const points = [];
    const segments = 64; // 円の分割数
    const radius = 100; // 球の半径
    
    for (let i = 0; i <= segments; i++) {
      const theta = (i / segments) * Math.PI * 2;
      // 高度から円の半径を計算
      const circleRadius = radius * Math.cos(THREE.MathUtils.degToRad(altitude));
      // 円周上の点を計算
      const x = circleRadius * Math.sin(theta);
      const y = radius * Math.sin(THREE.MathUtils.degToRad(altitude));
      const z = -circleRadius * Math.cos(theta);
      points.push(new THREE.Vector3(x, y, z));
    }
    
    return points;
  };

  if (!visible) return null;

  return (
    <group>
      {altitudes.map((altitude) => (
        <group key={altitude}>
          <Line
            points={createCirclePoints(altitude)}
            color="white"
            lineWidth={altitude === 0 ? 2 : 1}
            opacity={altitude === 0 ? 0.4 : altitude < 0 ? 0.15 : 0.2}
            transparent
          />
          {/* 高度のラベルを北側に表示 */}
          <Html
            position={[
              0,
              100 * Math.sin(THREE.MathUtils.degToRad(altitude)),
              -100 * Math.cos(THREE.MathUtils.degToRad(altitude))
            ]}
            center
          >
            <div style={{
              color: 'white',
              opacity: altitude === 0 ? 0.7 : altitude < 0 ? 0.4 : 0.5,
              fontSize: '12px',
              textShadow: '1px 1px 2px black'
            }}>
              {`${altitude}°`}
            </div>
          </Html>
        </group>
      ))}
    </group>
  );
};
