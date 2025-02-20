import React from 'react';

const Stars = ({ constellationData, focusedObject }) => {
  const calculateStarPosition = (star, radius = 400) => {
    // 赤経・赤緯から2D座標に変換
    const ra = star.ra * (Math.PI / 180);  // 赤経をラジアンに変換
    const dec = star.dec * (Math.PI / 180); // 赤緯をラジアンに変換

    // 球面座標から直交座標に変換
    const x = radius * Math.cos(dec) * Math.cos(ra);
    const y = radius * Math.sin(dec);

    return { x, y };
  };

  const calculateStarSize = (magnitude) => {
    // 等級から星の大きさを計算（等級が小さいほど明るい＝大きく表示）
    return Math.max(2, 8 - magnitude * 1.5);
  };

  return (
    <g className="stars">
      {constellationData.constellations.map(constellation =>
        constellation.stars.map(star => {
          const position = calculateStarPosition(star);
          const size = calculateStarSize(star.magnitude || 2);
          const isFocused = focusedObject?.name === star.name;

          return (
            <g key={star.name} transform={`translate(${position.x}, ${position.y})`}>
              {/* 星の背景光 */}
              {isFocused && (
                <circle
                  r={size * 2}
                  fill="rgba(255, 255, 255, 0.1)"
                  filter="url(#glow)"
                />
              )}
              
              {/* 星本体 */}
              <circle
                r={size}
                fill={isFocused ? "#ffff00" : "white"}
                style={{
                  transition: "fill 0.3s ease-in-out",
                }}
              />
              
              {/* 星の名前 */}
              <text
                x={size + 5}
                y={5}
                fill="white"
                fontSize="12"
                style={{
                  userSelect: 'none',
                  pointerEvents: 'none',
                }}
              >
                {star.name}
              </text>
            </g>
          );
        })
      )}
      
      {/* 光彩効果のためのフィルター定義 */}
      <defs>
        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
    </g>
  );
};

export default Stars;
