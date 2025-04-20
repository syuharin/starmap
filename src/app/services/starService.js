// 星図データを取得するサービス
// 環境変数からAPI URLを取得、またはホスト名に基づいて決定
const API_BASE_URL = process.env.REACT_APP_API_URL || 
  (window.location.hostname === 'localhost' 
    ? 'http://localhost:8000' 
    : 'https://api.example.com'); // デフォルト値

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
    const url = `${API_BASE_URL}/search?query=${encodeURIComponent(query)}&type=${type}`;
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
