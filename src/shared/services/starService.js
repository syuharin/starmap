// 星図データを取得するサービス
// 環境変数からAPI URLを取得、またはホスト名に基づいて決定
const API_BASE_URL = process.env.REACT_APP_API_URL || 
  (window.location.hostname === 'localhost' 
    ? 'http://localhost:8000' 
    : 'https://api.example.com');

// APIリクエストのラッパー関数
const fetchAPI = async (endpoint, params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  const url = `${API_BASE_URL}${endpoint}${queryString ? `?${queryString}` : ''}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`APIリクエストエラー: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('APIエラー:', error);
    throw error;
  }
};

export const fetchStars = async (latitude, longitude, altitude = 0, datetime = null) => {
  const params = {
    latitude: latitude.toString(),
    longitude: longitude.toString(),
    altitude: altitude.toString(),
    ...(datetime && { datetime_str: datetime.toISOString() })
  };

  try {
    return await fetchAPI('/stars', params);
  } catch (error) {
    console.error('星のデータの取得に失敗しました:', error);
    throw new Error('星のデータの取得に失敗しました');
  }
};

export const searchCelestialObjects = async (query, type = 'all') => {
  try {
    return await fetchAPI('/search', {
      query: encodeURIComponent(query),
      type
    });
  } catch (error) {
    console.error('検索エラー:', error);
    throw new Error('検索に失敗しました');
  }
};

// APIレスポンスの検証関数
const validateApiResponse = (data) => {
  if (!data || !Array.isArray(data.constellations)) {
    throw new Error('APIレスポンスの形式が不正です');
  }

  data.constellations.forEach((constellation, index) => {
    if (!constellation.stars || !Array.isArray(constellation.stars)) {
      throw new Error(`星データが不正です (constellation: ${index})`);
    }

    constellation.stars.forEach((star, starIndex) => {
      if (!star || typeof star.right_ascension !== 'number' || typeof star.declination !== 'number') {
        throw new Error(`星の座標データが不正です (constellation: ${index}, star: ${starIndex})`);
      }
      if (typeof star.magnitude !== 'number') {
        throw new Error(`星の等級データが不正です (constellation: ${index}, star: ${starIndex})`);
      }
    });

    if (!constellation.lines || !Array.isArray(constellation.lines)) {
      throw new Error(`星座線データが不正です (constellation: ${index})`);
    }

    constellation.lines.forEach((line, lineIndex) => {
      if (!line || !line.star1 || !line.star2) {
        throw new Error(`星座線のデータが不正です (constellation: ${index}, line: ${lineIndex})`);
      }
    });
  });

  return data;
};

// 天球座標を3D座標に変換
const convertToCartesian = (ra, dec, radius = 100) => {
  // 赤経を度に変換（時→度）
  const raInDegrees = ra * 15;
  // ラジアンに変換
  const raRad = raInDegrees * Math.PI / 180;
  const decRad = dec * Math.PI / 180;
  
  // 天球座標から3D直交座標に変換
  return {
    x: radius * Math.cos(decRad) * Math.cos(raRad),
    y: radius * Math.sin(decRad),
    z: -radius * Math.cos(decRad) * Math.sin(raRad)
  };
};

// APIレスポンスを3D表示用のデータに変換
const transformConstellationData = (apiData) => {
  const stars = [];
  const lines = [];
  const starMap = new Map(); // star.nameと配列インデックスの対応を保持

  // 星データの変換
  apiData.constellations.forEach(constellation => {
    constellation.stars.forEach(star => {
      const coords = convertToCartesian(star.right_ascension, star.declination);
      const starIndex = stars.length;
      stars.push({
        ...coords,
        magnitude: star.magnitude,
        name: star.name
      });
      starMap.set(star.name, starIndex);
    });

    // 星座線データの変換
    constellation.lines.forEach(line => {
      const start = convertToCartesian(line.star1.right_ascension, line.star1.declination);
      const end = convertToCartesian(line.star2.right_ascension, line.star2.declination);
      lines.push({ start, end });
    });
  });

  return { stars, lines };
};

// 変換後のデータの検証
const validateTransformedData = (data) => {
  if (!data || typeof data !== 'object') {
    throw new Error('変換後のデータ形式が不正です');
  }

  if (!Array.isArray(data.lines)) {
    throw new Error('変換後の星座線データの形式が不正です');
  }

  if (!Array.isArray(data.stars)) {
    throw new Error('変換後の星データの形式が不正です');
  }

  // 星座線データの検証
  data.lines.forEach((line, index) => {
    if (!line || typeof line !== 'object') {
      throw new Error(`変換後の星座線データが不正です (index: ${index})`);
    }
    if (!line.start || typeof line.start !== 'object' ||
        !line.end || typeof line.end !== 'object') {
      throw new Error(`変換後の星座線の座標データが不正です (index: ${index})`);
    }
    ['start', 'end'].forEach(point => {
      ['x', 'y', 'z'].forEach(coord => {
        if (typeof line[point][coord] !== 'number') {
          throw new Error(`変換後の星座線の座標値が不正です (index: ${index}, point: ${point}, coord: ${coord})`);
        }
      });
    });
  });

  // 星データの検証
  data.stars.forEach((star, index) => {
    if (!star || typeof star !== 'object') {
      throw new Error(`変換後の星データが不正です (index: ${index})`);
    }
    ['x', 'y', 'z'].forEach(coord => {
      if (typeof star[coord] !== 'number') {
        throw new Error(`変換後の星の座標値が不正です (index: ${index}, coord: ${coord})`);
      }
    });
    if (typeof star.magnitude !== 'number') {
      throw new Error(`変換後の星の等級データが不正です (index: ${index})`);
    }
  });

  return data;
};

export const fetchConstellations = async (selectedDate) => {
  const params = selectedDate ? {
    datetime_str: selectedDate.toISOString()
  } : {};

  try {
    const apiData = await fetchAPI('/constellations', params);
    const validatedApiData = validateApiResponse(apiData);
    const transformedData = transformConstellationData(validatedApiData);
    return validateTransformedData(transformedData);
  } catch (error) {
    console.error('星座データの取得に失敗しました:', error);
    throw new Error(error.message || '星座データの取得に失敗しました');
  }
};
