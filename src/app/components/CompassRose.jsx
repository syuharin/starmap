import React from "react";
import { Html, Line } from "@react-three/drei";
import * as THREE from "three";

// 方位点の生成関数
const createDirectionPoint = (angle, radius) => {
  const phi = THREE.MathUtils.degToRad(angle);
  return new THREE.Vector3(radius * Math.sin(phi), 0, -radius * Math.cos(phi));
};

// 方位表示コンポーネント
export const CompassRose = ({ radius = 110, visible = true }) => {
  if (!visible) return null;

  // 主要方位のデータ
  const cardinalDirections = [
    { angle: 0, label: "北" },
    { angle: 90, label: "東" },
    { angle: 180, label: "南" },
    { angle: 270, label: "西" },
  ];

  // 中間方位のデータ
  const intermediateDirections = [
    { angle: 45, label: "北東" },
    { angle: 135, label: "南東" },
    { angle: 225, label: "南西" },
    { angle: 315, label: "北西" },
  ];

  return (
    <group>
      {/* 方位円 */}
      <Line
        points={[...Array(37)].map((_, i) =>
          createDirectionPoint(i * 10, radius),
        )}
        color="white"
        lineWidth={1}
        opacity={0.3}
        transparent
        closed
      />

      {/* 主要方位のラベルと線 */}
      {cardinalDirections.map(({ angle, label }) => {
        const point = createDirectionPoint(angle, radius);
        const innerPoint = createDirectionPoint(angle, radius * 0.9);

        return (
          <group key={label}>
            <Line
              points={[innerPoint, point]}
              color="white"
              lineWidth={2}
              opacity={0.5}
              transparent
            />
            <Html position={[point.x * 1.1, 0, point.z * 1.1]}>
              <div
                style={{
                  color: "white",
                  fontSize: "14px",
                  fontWeight: "bold",
                  textShadow: "2px 2px 2px rgba(0,0,0,0.5)",
                }}
              >
                {label}
              </div>
            </Html>
          </group>
        );
      })}

      {/* 中間方位のラベルと線 */}
      {intermediateDirections.map(({ angle, label }) => {
        const point = createDirectionPoint(angle, radius);
        const innerPoint = createDirectionPoint(angle, radius * 0.95);

        return (
          <group key={label}>
            <Line
              points={[innerPoint, point]}
              color="white"
              lineWidth={1}
              opacity={0.3}
              transparent
            />
            <Html position={[point.x * 1.1, 0, point.z * 1.1]}>
              <div
                style={{
                  color: "white",
                  fontSize: "12px",
                  opacity: 0.7,
                  textShadow: "2px 2px 2px rgba(0,0,0,0.5)",
                }}
              >
                {label}
              </div>
            </Html>
          </group>
        );
      })}
    </group>
  );
};
