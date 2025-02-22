import React from 'react';

const CompassRose = () => {
  const radius = 180; // 方位円の半径
  const labelRadius = radius * 1.2; // ラベルの表示位置を外側に
  const directions = [
    { angle: 0, text: '北' },
    { angle: 90, text: '東' },
    { angle: 180, text: '南' },
    { angle: 270, text: '西' }
  ];

  // 方位点の位置を計算（3D空間での投影を考慮）
  const calculatePosition = (angle, radius) => {
    const radian = angle * (Math.PI / 180);
    const x = radius * Math.sin(radian);    // 東方向（右）
    const z = radius * Math.cos(radian);    // 北方向（奥）
    // SVGの3D投影を計算
    const scale = 1000 / (1000 + z);
    return {
      x: x * scale,
      y: -z * scale  // 北を奥に向ける
    };
  };

  return (
    <g className="compass-rose">
      {/* 方位円（3D投影） */}
      <ellipse
        cx="0"
        cy="0"
        rx={radius}
        ry={radius * 0.7}  // 遠近感を出すために縦方向を縮める
        transform="rotate(-90)"
        fill="none"
        stroke="rgba(255, 255, 255, 0.2)"
        strokeWidth="2"
        strokeDasharray="4 4"
      />

      {/* 方位点と文字 */}
      {directions.map(({ angle, text }) => {
        const pos = calculatePosition(angle, radius);
        const labelPos = calculatePosition(angle, labelRadius);
        const projectedX = pos.x;
        const projectedY = pos.y;
        const labelX = labelPos.x;
        const labelY = labelPos.y;
        
        return (
          <g key={text}>
            {/* 方位点 */}
            <circle
              cx={projectedX}
              cy={projectedY}
              r="4"
              fill="rgba(255, 255, 255, 0.7)"
            />
            {/* 方位文字 */}
            <text
              x={labelX}
              y={labelY}
              fill="rgba(255, 255, 255, 0.9)"
              fontSize="18"
              fontWeight="bold"
              textAnchor="middle"
              style={{
                userSelect: 'none',
                pointerEvents: 'none'
              }}
            >
              {text}
            </text>
          </g>
        );
      })}

      {/* 補助線（45度ごと） */}
      {[45, 135, 225, 315].map(angle => {
        const pos = calculatePosition(angle, radius);
        return (
          <line
            key={angle}
            x1={0}
            y1={0}
            x2={pos.x}
            y2={pos.y}
            stroke="rgba(255, 255, 255, 0.15)"
            strokeWidth="1.5"
            strokeDasharray="8 8"
          />
        );
      })}
    </g>
  );
};

export default CompassRose;
