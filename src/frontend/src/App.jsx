import React, { useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Constellation } from './components/Constellation';
import { CompassRose } from './components/CompassRose';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import ExploreIcon from '@mui/icons-material/Explore';
import dayjs from 'dayjs';
import { DateTimePicker } from './components/DateTimePicker';
import { SearchBar } from './components/SearchBar';

// スターマップコンポーネント
function StarMap({ showCompass, selectedDate, focusedObject }) {
  return (
    <Constellation 
      selectedDate={selectedDate} 
      showCompass={showCompass}
      focusedObject={focusedObject}
    />
  );
}

// メインアプリケーション
export default function App() {
  const [darkMode, setDarkMode] = useState(true);
  const [showCompass, setShowCompass] = useState(true);
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [focusedObject, setFocusedObject] = useState(null);

  // フォーカス解除のハンドラー
  const handleClearFocus = () => {
    setFocusedObject(null);
  };

  // 検索結果選択のハンドラー
  const handleSearchResult = (result) => {
    setFocusedObject(result);
  };

  // ESCキーでフォーカス解除
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        handleClearFocus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // 背景クリックでフォーカス解除
  const handleBackgroundClick = (event) => {
    // クリックがツールバーやUI要素以外の場合のみフォーカス解除
    if (event.target.tagName === 'CANVAS') {
      handleClearFocus();
    }
  };

  const theme = createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
      primary: {
        main: darkMode ? '#1a237e' : '#3f51b5',
      },
      background: {
        default: darkMode ? '#000000' : '#ffffff',
        paper: darkMode ? '#1a1a1a' : '#f5f5f5',
      },
    },
  });

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
        <AppBar position="static" color="primary" enableColorOnDark>
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 0, mr: 2 }}>
              星図表示アプリケーション
            </Typography>
            <SearchBar onResultSelect={handleSearchResult} />
            <Box sx={{ flexGrow: 1 }} />
            <DateTimePicker
              selectedDate={selectedDate}
              onDateChange={setSelectedDate}
            />
            <IconButton
              onClick={() => setShowCompass(!showCompass)}
              color="inherit"
              sx={{ mr: 1 }}
            >
              <ExploreIcon />
            </IconButton>
            <IconButton 
              onClick={() => setDarkMode(!darkMode)} 
              color="inherit"
            >
              {darkMode ? <Brightness7Icon /> : <Brightness4Icon />}
            </IconButton>
          </Toolbar>
        </AppBar>
        
        <Box 
          sx={{ 
            flexGrow: 1, 
            position: 'relative',
            backgroundColor: darkMode ? '#000000' : '#ffffff',
            overflow: 'hidden'
          }}
          onClick={handleBackgroundClick}
        >
          <StarMap 
            showCompass={showCompass}
            selectedDate={selectedDate}
            focusedObject={focusedObject}
          />
        </Box>
      </Box>
    </ThemeProvider>
  );
}
