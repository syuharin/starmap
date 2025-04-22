const { app, BrowserWindow } = require("electron");
const path = require("path");

// 開発モードの判定
const isDev = process.env.NODE_ENV === "development";

function createWindow() {
  // ブラウザウィンドウの作成
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  // 開発モードの場合はローカルサーバー、本番の場合はビルドされたファイルを読み込む
  if (isDev) {
    mainWindow.loadURL("http://localhost:3002");
    // 開発ツールを開く
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, "../dist", "index.html")); // Updated path
  }
}

// Electronの初期化完了時にウィンドウを作成
app.whenReady().then(createWindow);

// すべてのウィンドウが閉じられた時の処理
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
