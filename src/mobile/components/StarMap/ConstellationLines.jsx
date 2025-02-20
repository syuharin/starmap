import React from 'react';

const ConstellationLines = ({ constellationData }) => {
  const calculateStarPosition = (star, radius = 400) => {
    // 赤経・赤緯から2D座標に変換
    const ra = star.ra * (Math.PI / 180);  // 赤経をラジアンに変換
    const dec = star.dec * (Math.PI / 180); // 赤緯をラジアンに変換

    // 球面座標から直交座標に変換
    const x = radius * Math.cos(dec) * Math.cos(ra);
    const y = radius * Math.sin(dec);

    return { x, y };
  };

  return (
    <g className="constellation-lines">
      {constellationData.constellations.map(constellation =>
        constellation.lines.map(line => {
          const start = calculateStarPosition(line.star1);
          const end = calculateStarPosition(line.star2);

          return (
            <line
              key={`${line.star1.name}-${line.star2.name}`}
              x1={start.x}
              y1={start.y}
              x2={end.x}
              y2={end.y}
              stroke="rgba(255, 255, 255, 0.3)"
              strokeWidth="1"
              style={{
                transition: "stroke-opacity 0.3s ease-in-out",
              }}
            />
          );
        })
      )}
    </g>
  );
};

export default ConstellationLines;
