// 星図データを取得するサービス
const API_BASE_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:8000' 
  : 'https://api.example.com';

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

export const fetchConstellations = async (selectedDate) => {
  const params = selectedDate ? {
    datetime_str: selectedDate.toISOString()
  } : {};

  try {
    return await fetchAPI('/constellations', params);
  } catch (error) {
    console.error('星座データの取得に失敗しました:', error);
    throw new Error('星座データの取得に失敗しました');
  }
};
