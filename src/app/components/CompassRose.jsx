import React from 'react'; // Reactインポートを復元
import { Html, Line } from '@react-three/drei';
import * as THREE from 'three';

// 方位点の生成関数
const createDirectionPoint = (angle, radius) => {
  const phi = THREE.MathUtils.degToRad(angle);
  return new THREE.Vector3(
    radius * Math.sin(phi),
    0,
    -radius * Math.cos(phi)
  );
};

// 座標計算のためのヘルパー関数（Constellation.jsxと同じ関数）
const calculatePosition = (rightAscension, declination, selectedDate, radius = 100) => {
  // 観測地点の設定（東京）
  const lat = 35.6762;
  const lng = 139.6503;
  
  // LST（地方恒星時）の計算
  const utc = selectedDate.valueOf(); // UTCミリ秒を取得
  const jd = 2440587.5 + utc / 86400000; // ユリウス日
  const t = (jd - 2451545.0) / 36525.0;
  // グリニッジ平均恒星時 (GMST) を度で計算
  const gmst = (280.46061837 + 360.98564736629 * (jd - 2451545.0) +
              0.000387933 * t * t - t * t * t / 38710000.0) % 360;
  // 地方恒星時 (LST) = GMST + 経度 (度)
  const lst = (gmst + lng) % 360; // lng は度単位

  // 時角の計算
  const ha = lst - rightAscension;
  
  // 方位角・高度の計算
  const decRad = THREE.MathUtils.degToRad(declination);
  const latitudeRad = THREE.MathUtils.degToRad(lat);
  const hourAngleRad = THREE.MathUtils.degToRad(ha);
  
  // 高度の計算
  const sinAlt = Math.sin(decRad) * Math.sin(latitudeRad) +
                Math.cos(decRad) * Math.cos(latitudeRad) * Math.cos(hourAngleRad);
  const altitude = Math.asin(sinAlt);
  
  // 方位角の計算
  const cosA = (Math.sin(decRad) - Math.sin(altitude) * Math.sin(latitudeRad)) /
              (Math.cos(altitude) * Math.cos(latitudeRad));
  // Clamp cosA to prevent Math.acos returning NaN
  const clampedCosA = Math.max(-1, Math.min(1, cosA));
  const azimuth = Math.sin(hourAngleRad) > 0 ? 
                 2 * Math.PI - Math.acos(clampedCosA) : Math.acos(clampedCosA);
  
  // 方位角・高度から3D座標に変換（北が-Z、東が+X）
  const position = new THREE.Vector3(
    radius * Math.sin(azimuth) * Math.cos(altitude),
    radius * Math.sin(altitude),
    -radius * Math.cos(azimuth) * Math.cos(altitude)
  );
  
  // デバッグ情報を含むオブジェクトを返す
  return {
    position,
    debug: {
      lst,
      ha,
      altitude: THREE.MathUtils.radToDeg(altitude),
      azimuth: THREE.MathUtils.radToDeg(azimuth)
    }
  };
};

// 方位角から方角の文字列を取得する関数
const getDirectionLabel = (azimuth) => {
  // 方位角を0-360度の範囲に正規化
  const normalizedAzimuth = (azimuth + 360) % 360;
  
  // 方角の範囲（22.5度ずつ）
  if (normalizedAzimuth >= 337.5 || normalizedAzimuth < 22.5) return '北';
  if (normalizedAzimuth >= 22.5 && normalizedAzimuth < 67.5) return '北東';
  if (normalizedAzimuth >= 67.5 && normalizedAzimuth < 112.5) return '東';
  if (normalizedAzimuth >= 112.5 && normalizedAzimuth < 157.5) return '南東';
  if (normalizedAzimuth >= 157.5 && normalizedAzimuth < 202.5) return '南';
  if (normalizedAzimuth >= 202.5 && normalizedAzimuth < 247.5) return '南西';
  if (normalizedAzimuth >= 247.5 && normalizedAzimuth < 292.5) return '西';
  if (normalizedAzimuth >= 292.5 && normalizedAzimuth < 337.5) return '北西';
  
  return '不明'; // 念のため
};

// 方位表示コンポーネント
export const CompassRose = ({ radius = 110, visible = true, focusedObject = null, selectedDate = null }) => {
  if (!visible) return null;

  // 主要方位のデータ
  const cardinalDirections = [
    { angle: 0, label: '北' },
    { angle: 90, label: '東' },
    { angle: 180, label: '南' },
    { angle: 270, label: '西' }
  ];

  // 中間方位のデータ
  const intermediateDirections = [
    { angle: 45, label: '北東' },
    { angle: 135, label: '南東' },
    { angle: 225, label: '南西' },
    { angle: 315, label: '北西' }
  ];

  // 検索された星座の方位角と高度を計算
  let objectDirection = null;
  let objectAltitude = null;
  let objectAzimuth = null;
  let objectName = null;
  
  if (focusedObject && selectedDate) {
    let targetRA, targetDec;
    
    if (focusedObject.type === 'star') {
      targetRA = focusedObject.right_ascension;
      targetDec = focusedObject.declination;
      objectName = focusedObject.name;
    } else if (focusedObject.type === 'constellation') {
      targetRA = parseFloat(focusedObject.right_ascension_center);
      targetDec = parseFloat(focusedObject.declination_center);
      objectName = focusedObject.name_jp || focusedObject.name;
    }
    
    if (!isNaN(targetRA) && !isNaN(targetDec)) {
      const result = calculatePosition(targetRA, targetDec, selectedDate, radius);
      objectDirection = result.position;
      objectAltitude = result.debug.altitude;
      objectAzimuth = result.debug.azimuth;
    }
  }

  return (
    <group>
      {/* 方位円 */}
      <Line
        points={[...Array(37)].map((_, i) => createDirectionPoint(i * 10, radius))}
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
              <div style={{
                color: 'white',
                fontSize: '14px',
                fontWeight: 'bold',
                textShadow: '2px 2px 2px rgba(0,0,0,0.5)'
              }}>
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
              <div style={{
                color: 'white',
                fontSize: '12px',
                opacity: 0.7,
                textShadow: '2px 2px 2px rgba(0,0,0,0.5)'
              }}>
                {label}
              </div>
            </Html>
          </group>
        );
      })}

      {/* 検索された星座の方向を示す矢印 */}
      {objectDirection && (
        <group>
          {/* 原点から星座の実際の3D位置へ向かう矢印 */}
          <Line
            points={[
              new THREE.Vector3(0, 0, 0),
              new THREE.Vector3(
                objectDirection.x * 0.9,
                objectDirection.y * 0.9,
                objectDirection.z * 0.9
              )
            ]}
            color="#ffcc00" // 黄色で目立たせる
            lineWidth={3}
            opacity={0.8}
            transparent
          />
          
          {/* 矢印の先端（3D空間で適切に表示） */}
          <Line
            points={[
              new THREE.Vector3(
                objectDirection.x * 0.85,
                objectDirection.y * 0.85,
                objectDirection.z * 0.85
              ),
              new THREE.Vector3(
                objectDirection.x * 0.9,
                objectDirection.y * 0.9,
                objectDirection.z * 0.9
              ),
              new THREE.Vector3(
                objectDirection.x * 0.85 + objectDirection.z * 0.03,
                objectDirection.y * 0.85,
                objectDirection.z * 0.85 - objectDirection.x * 0.03
              )
            ]}
            color="#ffcc00"
            lineWidth={3}
            opacity={0.8}
            transparent
          />
          
          {/* 星座名と方位情報のラベル */}
          <Html
            position={[
              objectDirection.x * 0.7,
              objectDirection.y * 0.7,
              objectDirection.z * 0.7
            ]}
          >
            <div style={{
              color: '#ffcc00',
              fontSize: '14px',
              fontWeight: 'bold',
              textShadow: '2px 2px 2px rgba(0,0,0,0.8)',
              backgroundColor: 'rgba(0,0,0,0.5)',
              padding: '3px 6px',
              borderRadius: '4px',
              whiteSpace: 'nowrap'
            }}>
              {objectName} {getDirectionLabel(objectAzimuth)} 
              {objectAltitude >= 0 
                ? `高度 ${Math.round(objectAltitude)}°` 
                : '地平線下'}
            </div>
          </Html>
          
          {/* 高度を示す補助線（垂直方向の投影） */}
          <Line
            points={[
              new THREE.Vector3(
                objectDirection.x * 0.9,
                0,
                objectDirection.z * 0.9
              ),
              new THREE.Vector3(
                objectDirection.x * 0.9,
                objectDirection.y * 0.9,
                objectDirection.z * 0.9
              )
            ]}
            color="#ffcc00"
            lineWidth={2}
            opacity={0.5}
            transparent
            dashed={true}
          />
        </group>
      )}
    </group>
  );
};
