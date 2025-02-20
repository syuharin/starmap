import React from 'react';

const AltitudeLines = () => {
  const radius = 450; // 方位円の半径
  const altitudes = [0, 10, 20, 30, 40, 50, 60, 70, 80]; // 高度（度）

  return (
    <g className="altitude-lines">
      {/* 高度線 */}
      {altitudes.map(altitude => {
        // 高度から円の半径を計算
        const circleRadius = radius * Math.cos(altitude * Math.PI / 180);
        // 高度から文字のY座標を計算
        const textY = -radius * Math.sin(altitude * Math.PI / 180);

        return (
          <g key={altitude}>
            {/* 高度円 */}
            <circle
              r={circleRadius}
              fill="none"
              stroke="rgba(255, 255, 255, 0.1)"
              strokeWidth="1"
              strokeDasharray="4 4"
            />
            
            {/* 高度ラベル */}
            <text
              x="5"
              y={textY}
              fill="rgba(255, 255, 255, 0.5)"
              fontSize="12"
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
      <g transform="translate(0, -450)">
        <circle
          r="3"
          fill="rgba(255, 255, 255, 0.5)"
        />
        <text
          x="0"
          y="-10"
          fill="rgba(255, 255, 255, 0.7)"
          fontSize="12"
          textAnchor="middle"
          style={{
            userSelect: 'none',
            pointerEvents: 'none'
          }}
        >
          天頂
        </text>
      </g>

      {/* 地平線（0度） */}
      <circle
        r={radius}
        fill="none"
        stroke="rgba(255, 255, 255, 0.3)"
        strokeWidth="1.5"
      />
    </g>
  );
};

export default AltitudeLines;
