// 星図データを取得するサービス
// 環境変数からAPI URLを取得、またはホスト名に基づいて決定
const API_BASE_URL =
  process.env.REACT_APP_API_URL ||
  (window.location.hostname === "localhost"
    ? "http://localhost:8000"
    : "https://starmap-backend.replit.app"); // ReplitのバックエンドURLに変更

// --- 新しく追加するヘルパー関数 ---
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const fetchWithRetry = async (url, options, retries = 3, delay = 1000) => {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, options);
      // 成功した場合、またはリトライ対象外のエラー(4xxなどクライアントエラー)
      if (response.ok || (response.status >= 400 && response.status < 500)) {
        return response;
      }
      // リトライ対象のエラー (5xx系サーバーエラー)
      console.warn(
        `[fetchWithRetry] Attempt ${i + 1} failed for ${url} with status ${
          response.status
        }. Retrying in ${delay / 1000}s...`,
      );
    } catch (error) {
      // ネットワークエラーなど fetch 自体の失敗
      console.warn(
        `[fetchWithRetry] Attempt ${
          i + 1
        } failed for ${url} with error: ${error}. Retrying in ${
          delay / 1000
        }s...`,
      );
    }

    // リトライ前に待機 (最後の試行では待機しない)
    if (i < retries - 1) {
      await sleep(delay);
      delay *= 2; // 指数バックオフ
    }
  }
  // リトライ上限に達した場合、最後の試行を再度実行して、その結果を返す（エラーハンドリングは呼び出し元に任せる）
  console.error(
    `[fetchWithRetry] All ${retries} attempts failed for ${url}. Returning the result of the last attempt.`,
  );
  return fetch(url, options);
};
// --- ヘルパー関数ここまで ---

export const fetchStars = async (
  latitude,
  longitude,
  altitude = 0,
  datetime = null,
) => {
  const params = new URLSearchParams({
    latitude: latitude.toString(),
    longitude: longitude.toString(),
    altitude: altitude.toString(),
    ...(datetime && { datetime_str: datetime.toISOString() }),
  });

  const response = await fetchWithRetry(`${API_BASE_URL}/stars?${params}`);
  if (!response.ok) {
    throw new Error(
      `星のデータの取得に失敗しました (Status: ${response.status})`,
    );
  }
  return await response.json();
};

export const searchCelestialObjects = async (query, type = "all") => {
  try {
    const url = `${API_BASE_URL}/search?query=${encodeURIComponent(
      query,
    )}&type=${type}`;
    const response = await fetchWithRetry(url);
    if (!response.ok) {
      // fetchWithRetry内でリトライ失敗時のログは出るので、ここではシンプルに
      throw new Error(`検索に失敗しました (Status: ${response.status})`);
    }
    return await response.json();
  } catch (error) {
    console.error("検索API呼び出しで最終的なエラー:", error);
    throw error; // エラーを再スロー
  }
};

export const fetchConstellations = async (selectedDate) => {
  const params = new URLSearchParams();
  if (selectedDate) {
    params.append("datetime_str", selectedDate.toISOString());
  }
  const response = await fetchWithRetry(
    `${API_BASE_URL}/constellations?${params}`,
  );
  if (!response.ok) {
    throw new Error(
      `星座データの取得に失敗しました (Status: ${response.status})`,
    );
  }
  return await response.json();
};
