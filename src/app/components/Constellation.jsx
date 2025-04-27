import React, { useEffect, useState, useRef } from 'react';
import { Box, Typography } from '@mui/material'; // Re-add Box and Typography for error/loading states
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Line, Html, OrbitControls } from '@react-three/drei';
import { CompassRose } from './CompassRose';
import { AltitudeLines } from './AltitudeLines'; // Keep even if unused for now, might be needed
import * as THREE from 'three';
import { fetchConstellations } from '../services/starService'; // Updated path again

// 座標計算のためのヘルパー関数
// 赤経・赤緯から方位角・高度を計算し、3D座標に変換する
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
const CameraController = ({ focusedObject, selectedDate }) => { // selectedDate を受け取る
  const { camera, controls } = useThree();
  const targetRotation = useRef(new THREE.Euler()); // targetRotation を再導入
  const isTransitioning = useRef(false); // isTransitioning を再導入
  const isInitialized = useRef(false);

  // 初期視点の設定
  useEffect(() => {
    if (!isInitialized.current) {
      // カメラを南側に配置し、北向きに設定
      const radius = 100;
      const elevation = 17; // 度単位
      const elevationRad = THREE.MathUtils.degToRad(elevation);
      
      // カメラの位置を設定（南側の高い位置）
      camera.position.set(
        0,
        radius * Math.sin(elevationRad),
        radius * Math.cos(elevationRad)
      );
      
      // 原点（方位円の中心）を見る
      camera.lookAt(0, 0, 0);
      camera.updateProjectionMatrix();
      
      if (controls) {
        controls.target.set(0, 0, 0);
        controls.update();
      }
      
      isInitialized.current = true;
    }
  }, [camera, controls]);

  useEffect(() => {
    if (focusedObject && selectedDate) { // selectedDate もチェック
      let targetRA, targetDec;

      // focusedObject から赤経・赤緯を取得
      if (focusedObject.type === 'star') {
        targetRA = focusedObject.right_ascension;
        targetDec = focusedObject.declination;
      } else if (focusedObject.type === 'constellation') {
        targetRA = parseFloat(focusedObject.right_ascension_center);
        targetDec = parseFloat(focusedObject.declination_center);
      } else {
        console.error('Unknown focused object type:', focusedObject);
        return;
      }

      if (isNaN(targetRA) || isNaN(targetDec)) {
        console.error('Invalid coordinates for focused object:', focusedObject);
        return;
      }

      console.log('[CameraController] Focusing on:', focusedObject); // Log focused object
      console.log('[CameraController] Selected Date:', selectedDate.toString()); // Log selected date

      // 共通の座標計算関数を使用
      const result = calculatePosition(targetRA, targetDec, selectedDate);
      const objectPosition = result.position;
      
      // デバッグログ
      console.log(`[CameraController] LST: ${result.debug.lst.toFixed(4)}`);
      console.log(`[CameraController] Hour Angle (HA): ${result.debug.ha.toFixed(4)}`);
      console.log(`[CameraController] Altitude (deg): ${result.debug.altitude.toFixed(4)}`);
      console.log(`[CameraController] Azimuth (deg): ${result.debug.azimuth.toFixed(4)}`);
      console.log(`[CameraController] Calculated Target Position: x=${objectPosition.x.toFixed(4)}, y=${objectPosition.y.toFixed(4)}, z=${objectPosition.z.toFixed(4)}`);

      // NaNチェック
      if (isNaN(objectPosition.x) || isNaN(objectPosition.y) || isNaN(objectPosition.z)) {
          console.error("NaN detected in camera target calculation for:", focusedObject);
          return;
      }
      // Removed extra closing brace here

      // !!! カメラの位置を(0,0,0)に設定するのを削除 !!!
      // camera.position.set(0, 0, 0); 
      
      // --- 目標回転の計算 (lookAtを使用) ---
      // 一時的にカメラを目標に向け、その回転角度を取得する
      const originalQuaternion = camera.quaternion.clone(); // 元の回転を保存
      const originalPosition = camera.position.clone(); // 元の位置も保存 (念のため)
      // lookAtはカメラの位置に依存するため、一時的に原点に置くか、現在の位置から見る
      // ここでは現在の位置から見る方法を採用
      camera.lookAt(objectPosition); // 目標を見る
      targetRotation.current.copy(camera.rotation); // 目標のEuler角を保存
      camera.quaternion.copy(originalQuaternion); // カメラの回転を元に戻す
      camera.position.copy(originalPosition); // カメラの位置も元に戻す
      console.log(`[CameraController] Calculated Target Rotation (Euler): x=${targetRotation.current.x.toFixed(4)}, y=${targetRotation.current.y.toFixed(4)}, z=${targetRotation.current.z.toFixed(4)}`);
      // --- 計算終了 ---

      // OrbitControlsの中心を方位円の中心に設定
      if (controls) {
        controls.target.set(0, 0, 0);
        controls.enabled = false; // Disable controls during transition
        console.log('[CameraController] OrbitControls disabled for transition.');
      }
      isTransitioning.current = true; // アニメーション開始
      console.log('[CameraController] Set isTransitioning to true'); 

    } else {
       // focusedObject が null になったらアニメーションを停止し、Controlsを有効化
       if (isTransitioning.current && controls) {
           controls.enabled = true; // Re-enable controls if transition is interrupted
           console.log('[CameraController] Focus cleared during transition. OrbitControls re-enabled.');
       }
       isTransitioning.current = false; 
    }
  }, [focusedObject, controls, camera, selectedDate]); // selectedDate を依存配列に追加

  // useFrame フック (アニメーションを再有効化)
  useFrame(() => {
    if (isTransitioning.current) { 
      console.log('[CameraController] useFrame: Transitioning...'); // アニメーション実行確認用ログ
      
      // 現在のカメラの状態を記録
      console.log(`[CameraController] Current Camera Position: x=${camera.position.x.toFixed(4)}, y=${camera.position.y.toFixed(4)}, z=${camera.position.z.toFixed(4)}`);
      console.log(`[CameraController] Current Camera Rotation: x=${camera.rotation.x.toFixed(4)}, y=${camera.rotation.y.toFixed(4)}, z=${camera.rotation.z.toFixed(4)}`);
      
      // 目標位置を取得
      let targetPosition;
      if (focusedObject && selectedDate) {
        let targetRA, targetDec;
        
        if (focusedObject.type === 'star') {
          targetRA = focusedObject.right_ascension;
          targetDec = focusedObject.declination;
        } else if (focusedObject.type === 'constellation') {
          targetRA = parseFloat(focusedObject.right_ascension_center);
          targetDec = parseFloat(focusedObject.declination_center);
        }
        
        const result = calculatePosition(targetRA, targetDec, selectedDate);
        targetPosition = result.position;
        console.log(`[CameraController] Target Position: x=${targetPosition.x.toFixed(4)}, y=${targetPosition.y.toFixed(4)}, z=${targetPosition.z.toFixed(4)}`);
      }
      
      if (targetPosition) {
        // カメラの位置を変更せずに、目標を直接見るように設定
        camera.lookAt(targetPosition);
        console.log('[CameraController] Applied lookAt directly');
        
        // カメラの行列を更新
        camera.updateMatrix();
        camera.updateMatrixWorld();
        camera.updateProjectionMatrix();
        
        console.log(`[CameraController] Camera Rotation After lookAt: x=${camera.rotation.x.toFixed(4)}, y=${camera.rotation.y.toFixed(4)}, z=${camera.rotation.z.toFixed(4)}`);
        
        // 単純なアプローチ：カメラの位置を変更せず、回転だけを設定
        if (window.orbitControlsRef) {
          console.log(`[CameraController] Original Camera Position: x=${camera.position.x.toFixed(4)}, y=${camera.position.y.toFixed(4)}, z=${camera.position.z.toFixed(4)}`);
          
          // OrbitControlsのtargetは原点のまま
          window.orbitControlsRef.target.set(0, 0, 0);
          console.log('[CameraController] OrbitControls target set to origin (0,0,0)');
          
          // カメラの回転を直接設定
          camera.rotation.copy(targetRotation.current);
          console.log(`[CameraController] Applied Target Rotation directly: x=${camera.rotation.x.toFixed(4)}, y=${camera.rotation.y.toFixed(4)}, z=${camera.rotation.z.toFixed(4)}`);
          
          // カメラの行列を更新
          camera.updateMatrix();
          camera.updateMatrixWorld();
          camera.updateProjectionMatrix();
          
          // OrbitControlsを更新
          window.orbitControlsRef.update();
          console.log('[CameraController] Updated OrbitControls');
        } else {
          console.log('[CameraController] orbitControlsRef not available');
        }
      }
      
      // 遷移を終了
      isTransitioning.current = false;
      console.log('[CameraController] Transition completed');
      
      // OrbitControlsを再有効化
      if (controls) {
        controls.enabled = true;
        controls.update();
        console.log('[CameraController] OrbitControls re-enabled and updated');
        
        // カメラの最終状態を確認
        console.log(`[CameraController] Final Camera Position: x=${camera.position.x.toFixed(4)}, y=${camera.position.y.toFixed(4)}, z=${camera.position.z.toFixed(4)}`);
        console.log(`[CameraController] Final Camera Rotation: x=${camera.rotation.x.toFixed(4)}, y=${camera.rotation.y.toFixed(4)}, z=${camera.rotation.z.toFixed(4)}`);
        console.log(`[CameraController] Final Camera LookAt: x=${controls.target.x.toFixed(4)}, y=${controls.target.y.toFixed(4)}, z=${controls.target.z.toFixed(4)}`);
      }
    } else if (controls) {
      // アニメーション中でない場合も controls.update() を呼ぶ (ユーザー操作のため)
      controls.update();
    }
  });

  return null; 
};

const Constellation3D = ({ constellationData, selectedDate, showCompass, showAltitude, focusedObject }) => {
  return (
    <Canvas
      camera={{
        position: [0, 0, 100],  // 南側に配置
        up: [0, 1, 0],          // Y軸を上に設定
        near: 0.1,
        far: 200,
        fov: 75
      }}
      onCreated={({ gl }) => {
        gl.setClearColor('#000000', 1);
      }}
    >
      <ambientLight intensity={0.1} />
      <group>
        {/* 星座の星を表示 */}
        {constellationData.constellations.map(constellation => 
          constellation.stars.map(star => {
            // 共通の座標計算関数を使用
            const result = calculatePosition(star.right_ascension, star.declination, selectedDate);
            
            return (
              <Star
                key={star.name}
                position={result.position}
                magnitude={star.magnitude}
                name={star.name}
              />
            );
          })
        )}

        {/* 星座線を表示 */}
        {constellationData.constellations.map(constellation => 
          constellation.lines.map(line => {
            // 共通の座標計算関数を使用
            const startResult = calculatePosition(line.star1.right_ascension, line.star1.declination, selectedDate);
            const endResult = calculatePosition(line.star2.right_ascension, line.star2.declination, selectedDate);
            
            // NaNチェックを追加
            if (isNaN(startResult.position.x) || isNaN(startResult.position.y) || isNaN(startResult.position.z) || 
                isNaN(endResult.position.x) || isNaN(endResult.position.y) || isNaN(endResult.position.z)) {
              console.error("NaN detected in line calculation for:", line);
              return null; // NaNが含まれる場合は線を描画しない
            }

            return (
              <ConstellationLine
                key={`${line.star1.name}-${line.star2.name}`}
                start={startResult.position}
                end={endResult.position}
              />
            );
          })
        )}
      </group>
      <CameraController focusedObject={focusedObject} selectedDate={selectedDate} /> 
      <CompassRose 
        visible={showCompass} 
        focusedObject={focusedObject} 
        selectedDate={selectedDate} 
      />
      <AltitudeLines visible={showAltitude} />
      {/* OrbitControlsを再度有効化 */}
      <OrbitControls 
        ref={(ref) => {
          if (ref) {
            // OrbitControlsのインスタンスをコンソールに出力（デバッグ用）
            console.log('[Constellation3D] OrbitControls instance:', ref);
            
            // OrbitControlsのtargetを動的に設定するためのグローバル変数
            window.orbitControlsRef = ref;
          }
        }}
        enableZoom={false}     // ズームを無効化
        enablePan={false}      // パンを無効化
        enableRotate={true}    // 回転を有効化
        rotateSpeed={0.4}      // 回転速度
        minDistance={100}      // カメラを球面上に固定
        maxDistance={100}      // カメラを球面上に固定
        minPolarAngle={Math.PI * 0.05}  // 天頂付近まで（約9度）
        maxPolarAngle={Math.PI * 0.9}   // 地平線付近まで（約162度）
        target={[0, 0, 0]}     // 回転の中心を方位円の中心に設定
        enableDamping={false}  // 減衰を無効化（カメラの回転を即座に反映させるため）
        dampingFactor={0.05}   // 減衰係数
        reverseOrbit={true}    // 回転方向を反転
      />
    </Canvas>
  );
};

// 星座全体を表示するコンポーネント
export const Constellation = ({ selectedDate, showCompass, showAltitude, focusedObject }) => {
  const [constellationData, setConstellationData] = useState(null);
  const [error, setError] = useState(null);
  const [use2D, setUse2D] = useState(false);
  // Star, ConstellationLine, Star2D, Constellation3D は内部コンポーネントなので no-unused-vars は無視されるはず

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
              x: Math.cos(THREE.MathUtils.degToRad(star.right_ascension)) * scale,
              y: Math.sin(THREE.MathUtils.degToRad(star.declination)) * scale
            };

            return (
              <Star2D
                key={star.name}
                position={position}
                magnitude={star.magnitude}
                name={star.name}
              />
            );
          })
        )}
      </div>
    );
  }

  // Add data-testid for testing
  const containerProps = { 'data-testid': 'constellation-container' };

  if (use2D) {
    return (
      <div style={{ position: 'relative', width: '100%', height: '100%', backgroundColor: 'black' }} {...containerProps}>
        {constellationData.constellations.map(constellation =>
          constellation.stars.map(star => {
            const scale = 200;
            const position = {
              x: Math.cos(THREE.MathUtils.degToRad(star.right_ascension)) * scale,
              y: Math.sin(THREE.MathUtils.degToRad(star.declination)) * scale
            };

            return (
              <Star2D
                key={star.name}
                position={position}
                magnitude={star.magnitude}
                name={star.name}
              />
            );
          })
        )}
      </div>
    );
  }

  // Note: Wrapping Constellation3D in a div to reliably apply data-testid for testing.
  // Add height: 100% to the wrapper div to ensure it fills the parent Box.
  return (
    <div data-testid="constellation-container" style={{ height: '100%' }}>
      <Constellation3D
        constellationData={constellationData}
        selectedDate={selectedDate}
        showCompass={showCompass}
        showAltitude={showAltitude}
        focusedObject={focusedObject}
      />
    </div>
  );
  /* Previous attempt:
  return <Constellation3D
    {...containerProps} // Pass test id props (might need adjustment based on Constellation3D)
    constellationData={constellationData}
    selectedDate={selectedDate}
    showCompass={showCompass}
    showAltitude={showAltitude}
    focusedObject={focusedObject}
  />; */ // Add closing comment tag
};
