// 星図データを取得するサービス
// デバッグ情報をコンソールに出力
console.log('DEBUG - process.env.REACT_APP_API_URL:', process.env.REACT_APP_API_URL);
console.log('DEBUG - window.location.hostname:', window.location.hostname);
console.log('DEBUG - hostname === localhost:', window.location.hostname === 'localhost');

// 問題回避のため、Replitの公開URLを直接指定（一時的な対処）
const API_BASE_URL = 'https://2c7a46f6-9675-4c8c-8ec0-0d442d938f4e-00-2px10lidqstxs.sisko.replit.dev';

// 元のコード（コメントアウト）
// const API_BASE_URL = 'http://localhost:8000';

console.log('DEBUG - 最終的なAPI_BASE_URL:', API_BASE_URL);

export const fetchStars = async (latitude, longitude, altitude = 0, datetime = null) => {
    const params = new URLSearchParams({
        latitude: latitude.toString(),
        longitude: longitude.toString(),
        altitude: altitude.toString(),
        ...(datetime && { datetime_str: datetime.toISOString() })
    });

    const response = await fetch(`${API_BASE_URL}/stars?${params}`);
    if (!response.ok) {
        throw new Error('星のデータの取得に失敗しました');
    }
    return await response.json();
};

export const searchCelestialObjects = async (query, type = 'all') => {
  try {
    // デバッグ: 実際のリクエストURLをコンソールに出力
    const url = `${API_BASE_URL}/search?query=${encodeURIComponent(query)}&type=${type}`;
    console.log('DEBUG - 検索リクエストURL:', url);
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('検索に失敗しました');
    }
    return await response.json();
  } catch (error) {
    console.error('検索エラー:', error);
    throw error;
  }
};

export const fetchConstellations = async (selectedDate) => {
    const params = new URLSearchParams();
    if (selectedDate) {
        params.append('datetime_str', selectedDate.toISOString());
    }
    const response = await fetch(`${API_BASE_URL}/constellations?${params}`);
    if (!response.ok) {
        throw new Error('星座データの取得に失敗しました');
    }
    return await response.json();
};
