import React from 'react';

const CompassRose = () => {
  const radius = 450; // 方位円の半径
  const directions = [
    { angle: 0, text: 'N' },
    { angle: 90, text: 'E' },
    { angle: 180, text: 'S' },
    { angle: 270, text: 'W' }
  ];

  // 方位点の位置を計算
  const calculatePosition = (angle, radius) => {
    const radian = (angle - 90) * (Math.PI / 180); // -90度回転して北を上にする
    return {
      x: radius * Math.cos(radian),
      y: radius * Math.sin(radian)
    };
  };

  return (
    <g className="compass-rose">
      {/* 方位円 */}
      <circle
        r={radius}
        fill="none"
        stroke="rgba(255, 255, 255, 0.2)"
        strokeWidth="1"
        strokeDasharray="4 4"
      />

      {/* 方位点と文字 */}
      {directions.map(({ angle, text }) => {
        const pos = calculatePosition(angle, radius);
        return (
          <g key={text} transform={`translate(${pos.x}, ${pos.y})`}>
            {/* 方位点 */}
            <circle
              r="3"
              fill="rgba(255, 255, 255, 0.5)"
            />
            {/* 方位文字 */}
            <text
              x="0"
              y="0"
              dx={text === 'E' ? 10 : text === 'W' ? -20 : 0}
              dy={text === 'N' ? -10 : text === 'S' ? 20 : 5}
              fill="rgba(255, 255, 255, 0.7)"
              fontSize="14"
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
            stroke="rgba(255, 255, 255, 0.1)"
            strokeWidth="1"
            strokeDasharray="4 4"
          />
        );
      })}
    </g>
  );
};

export default CompassRose;
