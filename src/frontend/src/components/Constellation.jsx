import React, { useEffect, useState, useMemo, useRef } from 'react';
import { Box, Typography } from '@mui/material';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Line, Html, OrbitControls } from '@react-three/drei';
import { CompassRose } from './CompassRose';
import * as THREE from 'three';
import { fetchConstellations } from '../services/starService';

// 星を表示するコンポーネント
const Star = ({ position, magnitude, name }) => {
  // 等級から星の大きさを計算（等級が小さいほど明るい＝大きく表示）
  const size = Math.max(0.05, 0.2 - magnitude * 0.03);
  
  return (
    <group position={position}>
      <mesh>
        <sphereGeometry args={[size, 32, 32]} />
        <meshBasicMaterial color="white" />
      </mesh>
      {name && (
        <Html distanceFactor={10}>
          <div style={{ color: 'white', fontSize: '12px' }}>
            {name}
          </div>
        </Html>
      )}
    </group>
  );
};

// 星座線を表示するコンポーネント
const ConstellationLine = ({ start, end }) => {
  const points = [start, end];
  
  return (
    <Line
      points={points}
      color="white"
      lineWidth={1}
      opacity={0.3}
      transparent
    />
  );
};

// 2Dキャンバスで星を描画するコンポーネント
const Star2D = ({ position, magnitude, name }) => {
  const canvasRef = useRef(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const size = Math.max(2, 8 - magnitude * 1.5);
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(position.x + canvas.width/2, -position.y + canvas.height/2, size, 0, Math.PI * 2);
    ctx.fill();
    
    if (name) {
      ctx.fillStyle = 'white';
      ctx.font = '12px Arial';
      ctx.fillText(name, position.x + canvas.width/2 + size + 2, -position.y + canvas.height/2);
    }
  }, [position, magnitude, name]);
  
  return <canvas ref={canvasRef} width={900} height={600} style={{ position: 'absolute', top: 0, left: 0 }} />;
};

// 3Dモードの星座表示コンポーネント
// カメラコントロールコンポーネント
const CameraController = ({ focusedObject }) => {
  const { camera, controls } = useThree();
  const targetRotation = useRef(new THREE.Euler());
  const isTransitioning = useRef(false);

  useEffect(() => {
    if (focusedObject) {
      const radius = 100;
      let objectPosition = new THREE.Vector3();

      if (focusedObject.type === 'star') {
        const { right_ascension: ra, declination: dec } = focusedObject;
        objectPosition.set(
          radius * Math.cos(THREE.MathUtils.degToRad(dec)) * Math.cos(THREE.MathUtils.degToRad(ra)),
          radius * Math.sin(THREE.MathUtils.degToRad(dec)),
          radius * Math.cos(THREE.MathUtils.degToRad(dec)) * Math.sin(THREE.MathUtils.degToRad(ra))
        );
      } else if (focusedObject.type === 'constellation') {
        const ra = parseFloat(focusedObject.right_ascension_center);
        const dec = parseFloat(focusedObject.declination_center);
        if (!isNaN(ra) && !isNaN(dec)) {
          objectPosition.set(
            radius * Math.cos(THREE.MathUtils.degToRad(dec)) * Math.cos(THREE.MathUtils.degToRad(ra)),
            radius * Math.sin(THREE.MathUtils.degToRad(dec)),
            radius * Math.cos(THREE.MathUtils.degToRad(dec)) * Math.sin(THREE.MathUtils.degToRad(ra))
          );
        } else {
          console.error('Invalid constellation center coordinates:', focusedObject);
          return;
        }
      }

      // 方位円の中心から天体への方向を計算
      const direction = objectPosition.normalize();
      
      // 方向ベクトルから回転を計算
      const rotation = new THREE.Euler();
      rotation.setFromRotationMatrix(
        new THREE.Matrix4().lookAt(
          new THREE.Vector3(0, 0, 0),
          objectPosition,
          new THREE.Vector3(0, 1, 0)
        )
      );

      targetRotation.current.copy(rotation);
      isTransitioning.current = true;

      // OrbitControlsの中心は常に原点
      if (controls) {
        controls.target.set(0, 0, 0);
      }
    }
  }, [focusedObject, controls]);

  useFrame(() => {
    if (focusedObject && isTransitioning.current) {
      // カメラの回転をスムーズに補間
      camera.rotation.x = THREE.MathUtils.lerp(
        camera.rotation.x,
        targetRotation.current.x,
        0.05
      );
      camera.rotation.y = THREE.MathUtils.lerp(
        camera.rotation.y,
        targetRotation.current.y,
        0.05
      );
      camera.rotation.z = THREE.MathUtils.lerp(
        camera.rotation.z,
        targetRotation.current.z,
        0.05
      );

      // 回転が十分に近づいたら遷移を終了
      if (
        Math.abs(camera.rotation.x - targetRotation.current.x) < 0.01 &&
        Math.abs(camera.rotation.y - targetRotation.current.y) < 0.01 &&
        Math.abs(camera.rotation.z - targetRotation.current.z) < 0.01
      ) {
        isTransitioning.current = false;
      }

      camera.updateProjectionMatrix();
    }
  });

  return null;
};

const Constellation3D = ({ constellationData, selectedDate, showCompass, focusedObject }) => {
  return (
    <Canvas
      camera={{
        position: [0, 0, 0],
        up: [0, 1, 0],
        near: 0.1,
        far: 200,
        fov: 75
      }}
      onCreated={({ gl, camera }) => {
        gl.setClearColor('#000000', 1);
        // 初期の視点を北向きに設定
        camera.lookAt(0, 0, 100);
      }}
    >
      <ambientLight intensity={0.1} />
      <group>
        {/* 星座の星を表示 */}
        {constellationData.constellations.map(constellation => 
          constellation.stars.map(star => {
            // 赤経・赤緯から方位角・高度に変換
            // 注: 実際の変換には観測地点の緯度・経度と時刻を使用
            // 現在は東京の位置（35.6762° N, 139.6503° E）を仮定
            const lat = 35.6762;
            const lng = 139.6503;
            
            // LST（地方恒星時）の計算
            const utc = selectedDate.valueOf(); // UTCミリ秒を取得
            const jd = 2440587.5 + utc / 86400000; // ユリウス日
            const t = (jd - 2451545.0) / 36525.0;
            const lst = (280.46061837 + 360.98564736629 * (jd - 2451545.0) +
                       0.000387933 * t * t - t * t * t / 38710000.0) % 360;
            
            // 時角の計算
            const ha = lst - star.ra;
            
            // 方位角・高度の計算
            const dec = THREE.MathUtils.degToRad(star.dec);
            const latitude = THREE.MathUtils.degToRad(lat);
            const hourAngle = THREE.MathUtils.degToRad(ha);
            
            // 高度の計算
            const sinAlt = Math.sin(dec) * Math.sin(latitude) +
                          Math.cos(dec) * Math.cos(latitude) * Math.cos(hourAngle);
            const altitude = Math.asin(sinAlt);
            
            // 方位角の計算
            const cosA = (Math.sin(dec) - Math.sin(altitude) * Math.sin(latitude)) /
                        (Math.cos(altitude) * Math.cos(latitude));
            const azimuth = Math.sin(hourAngle) > 0 ? 
                           2 * Math.PI - Math.acos(cosA) : Math.acos(cosA);
            const radius = 100; // 星までの距離（固定値）
            
            // 方位角・高度から3D座標に変換（北が+Z、東が+X）
            const position = new THREE.Vector3(
              radius * Math.sin(azimuth) * Math.cos(altitude),
              radius * Math.sin(altitude),
              radius * Math.cos(azimuth) * Math.cos(altitude)
            );

            return (
              <Star
                key={star.name}
                position={position}
                magnitude={2} // 仮の等級値
                name={star.name}
              />
            );
          })
        )}

        {/* 星座線を表示 */}
        {constellationData.constellations.map(constellation => 
          constellation.lines.map(line => {
            // LST（地方恒星時）の計算
            const utc = selectedDate.valueOf();
            const jd = 2440587.5 + utc / 86400000;
            const t = (jd - 2451545.0) / 36525.0;
            const lst = (280.46061837 + 360.98564736629 * (jd - 2451545.0) +
                       0.000387933 * t * t - t * t * t / 38710000.0) % 360;
            
            // 観測地点の設定（東京）
            const lat = 35.6762;
            const lng = 139.6503;
            const radius = 100;

            // 始点の星の位置を計算
            const ha1 = lst - line.star1.ra;
            const dec1 = THREE.MathUtils.degToRad(line.star1.dec);
            const latitude = THREE.MathUtils.degToRad(lat);
            const hourAngle1 = THREE.MathUtils.degToRad(ha1);
            
            const sinAlt1 = Math.sin(dec1) * Math.sin(latitude) +
                           Math.cos(dec1) * Math.cos(latitude) * Math.cos(hourAngle1);
            const altitude1 = Math.asin(sinAlt1);
            
            const cosA1 = (Math.sin(dec1) - Math.sin(altitude1) * Math.sin(latitude)) /
                         (Math.cos(altitude1) * Math.cos(latitude));
            const azimuth1 = Math.sin(hourAngle1) > 0 ? 
                            2 * Math.PI - Math.acos(cosA1) : Math.acos(cosA1);
            
            const start = new THREE.Vector3(
              radius * Math.sin(azimuth1) * Math.cos(altitude1),
              radius * Math.sin(altitude1),
              radius * Math.cos(azimuth1) * Math.cos(altitude1)
            );

            // 終点の星の位置を計算
            const ha2 = lst - line.star2.ra;
            const dec2 = THREE.MathUtils.degToRad(line.star2.dec);
            const hourAngle2 = THREE.MathUtils.degToRad(ha2);
            
            const sinAlt2 = Math.sin(dec2) * Math.sin(latitude) +
                           Math.cos(dec2) * Math.cos(latitude) * Math.cos(hourAngle2);
            const altitude2 = Math.asin(sinAlt2);
            
            const cosA2 = (Math.sin(dec2) - Math.sin(altitude2) * Math.sin(latitude)) /
                         (Math.cos(altitude2) * Math.cos(latitude));
            const azimuth2 = Math.sin(hourAngle2) > 0 ? 
                            2 * Math.PI - Math.acos(cosA2) : Math.acos(cosA2);
            
            const end = new THREE.Vector3(
              radius * Math.sin(azimuth2) * Math.cos(altitude2),
              radius * Math.sin(altitude2),
              radius * Math.cos(azimuth2) * Math.cos(altitude2)
            );

            return (
              <ConstellationLine
                key={`${line.star1.name}-${line.star2.name}`}
                start={start}
                end={end}
              />
            );
          })
        )}
      </group>
      <CameraController focusedObject={focusedObject} />
      <CompassRose visible={showCompass} />
      <OrbitControls 
        enableZoom={true}
        enablePan={false}
        enableRotate={true}
        zoomSpeed={0.6}
        rotateSpeed={0.4}
        minDistance={0.1}
        maxDistance={0.1}
        minPolarAngle={0}
        maxPolarAngle={Math.PI}
      />
    </Canvas>
  );
};

// 星座全体を表示するコンポーネント
export const Constellation = ({ selectedDate, showCompass, focusedObject }) => {
  const [constellationData, setConstellationData] = useState(null);
  const [error, setError] = useState(null);
  const [use2D, setUse2D] = useState(false);
  
  // WebGLサポートチェック
  useEffect(() => {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) {
      setUse2D(true);
      console.log('WebGLがサポートされていないため、2Dモードで表示します。');
    }
  }, []);

  useEffect(() => {
    const loadConstellationData = async () => {
      try {
        const data = await fetchConstellations(selectedDate);
        setConstellationData(data);
      } catch (err) {
        console.error('星座データの取得に失敗しました:', err);
        setError(err.message);
      }
    };

    loadConstellationData();
  }, [selectedDate]);

  if (error) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="error">
          データの取得に失敗しました: {error}
        </Typography>
      </Box>
    );
  }

  if (!constellationData) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography>データを読み込み中...</Typography>
      </Box>
    );
  }

  if (use2D) {
    return (
      <div style={{ position: 'relative', width: '100%', height: '100%', backgroundColor: 'black' }}>
        {constellationData.constellations.map(constellation =>
          constellation.stars.map(star => {
            const scale = 200;
            const position = {
              x: Math.cos(THREE.MathUtils.degToRad(star.ra)) * scale,
              y: Math.sin(THREE.MathUtils.degToRad(star.dec)) * scale
            };

            return (
              <Star2D
                key={star.name}
                position={position}
                magnitude={2}
                name={star.name}
              />
            );
          })
        )}
      </div>
    );
  }

  return <Constellation3D 
    constellationData={constellationData} 
    selectedDate={selectedDate}
    showCompass={showCompass}
    focusedObject={focusedObject}
  />;
};
