import React from 'react'; // Reactインポートを復元
import { createRoot } from 'react-dom/client';
import App from './App';

// Material UIのフォントを読み込み
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

const container = document.getElementById('root');
const root = createRoot(container);

root.render(<App />);
