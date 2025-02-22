import React from 'react';

const AltitudeLines = () => {
  const radius = 450; // 方位円の半径
  const altitudes = [-30, -10, 10, 30, 50, 70]; // 高度（度）を20度間隔に

  // 円周上の点を生成する関数
  const createCirclePoints = (altitude) => {
    const points = [];
    const segments = 64; // 円の分割数
    
    for (let i = 0; i <= segments; i++) {
      const theta = (i / segments) * Math.PI * 2;
      // 高度から円の半径を計算
      const circleRadius = radius * Math.cos(altitude * Math.PI / 180);
      // 円周上の点を計算（3D投影を考慮）
      const x = circleRadius * Math.sin(theta);
      const z = circleRadius * Math.cos(theta);
      const y = radius * Math.sin(altitude * Math.PI / 180);
      
      // SVGの3D投影を計算
      const scale = 1000 / (1000 + z);
      points.push(`${x * scale},${-z * scale}`);
    }
    
    return points.join(' ');
  };

  // 高度ラベルの位置を計算
  const calculateLabelPosition = (altitude) => {
    const radian = altitude * Math.PI / 180;
    const y = radius * Math.sin(radian);
    const z = radius * Math.cos(radian);
    const scale = 1000 / (1000 + z);
    return {
      x: 5 * scale,
      y: -z * scale
    };
  };

  return (
    <g className="altitude-lines" style={{ transformStyle: 'preserve-3d' }}>
      {/* 高度線 */}
      {altitudes.map(altitude => {
        const points = createCirclePoints(altitude);
        const labelPos = calculateLabelPosition(altitude);
        
        return (
          <g key={altitude} style={{ transformStyle: 'preserve-3d' }}>
            {/* 高度円 */}
            <polyline
              points={points}
              fill="none"
              stroke={altitude === 0 ? "rgba(255, 255, 255, 0.4)" : "rgba(255, 255, 255, 0.08)"}
              strokeWidth={altitude === 0 ? 2 : 1}
              strokeDasharray={altitude === 0 ? "" : "8 12"}
              transform={`translate(0 ${altitude * 2})`}
            />
            
            {/* 高度ラベル */}
            <text
              x={labelPos.x}
              y={labelPos.y}
              fill="rgba(255, 255, 255, 0.6)"
              fontSize="14"
              fontWeight="bold"
              style={{
                userSelect: 'none',
                pointerEvents: 'none'
              }}
            >
              {`${altitude}°`}
            </text>
          </g>
        );
      })}

      {/* 天頂マーク */}
      <g transform="translate(0 -450)">
        <circle
          r="4"
          fill="rgba(255, 255, 255, 0.7)"
        />
        <text
          x="0"
          y="-15"
          fill="rgba(255, 255, 255, 0.9)"
          fontSize="16"
          fontWeight="bold"
          textAnchor="middle"
          style={{
            userSelect: 'none',
            pointerEvents: 'none'
          }}
        >
          天頂
        </text>
      </g>
    </g>
  );
};

export default AltitudeLines;
