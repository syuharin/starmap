import React, { useState } from 'react';
import { Box, AppBar, Toolbar, IconButton, Typography } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import ExploreIcon from '@mui/icons-material/Explore';
import HeightIcon from '@mui/icons-material/Height';
import dayjs from 'dayjs';

import StarMap from './components/StarMap';
import SearchBar from '../shared/components/SearchBar';
import DateTimePicker from '../shared/components/DateTimePicker';

const App = () => {
  const [darkMode, setDarkMode] = useState(true);
  const [showCompass, setShowCompass] = useState(true);
  const [showAltitude, setShowAltitude] = useState(true);
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [focusedObject, setFocusedObject] = useState(null);

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
    components: {
      MuiAppBar: {
        styleOverrides: {
          root: {
            background: darkMode ? 'rgba(26, 35, 126, 0.9)' : 'rgba(63, 81, 181, 0.9)',
            backdropFilter: 'blur(10px)',
          },
        },
      },
    },
  });

  const handleSearchResult = (result) => {
    setFocusedObject(result);
  };

  const handleClearFocus = () => {
    setFocusedObject(null);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
        <AppBar position="fixed" elevation={0}>
          <Toolbar sx={{ minHeight: { xs: '48px' } }}>
            <Typography variant="h6" component="div" sx={{ 
              flexGrow: 0,
              mr: 2,
              fontSize: { xs: '1rem', sm: '1.25rem' }
            }}>
              星図
            </Typography>
            <SearchBar 
              onResultSelect={handleSearchResult}
              sx={{ flexGrow: 1 }}
            />
          </Toolbar>
          <Toolbar sx={{ 
            minHeight: { xs: '48px' },
            pt: 0,
            pb: 1,
            display: 'flex',
            justifyContent: 'space-between'
          }}>
            <DateTimePicker
              selectedDate={selectedDate}
              onDateChange={setSelectedDate}
            />
            <Box>
              <IconButton
                onClick={() => setShowCompass(!showCompass)}
                color="inherit"
                size="small"
                sx={{ mr: 1 }}
                title="方位表示の切り替え"
              >
                <ExploreIcon />
              </IconButton>
              <IconButton
                onClick={() => setShowAltitude(!showAltitude)}
                color="inherit"
                size="small"
                sx={{ mr: 1 }}
                title="高度線の表示/非表示"
              >
                <HeightIcon />
              </IconButton>
              <IconButton 
                onClick={() => setDarkMode(!darkMode)}
                color="inherit"
                size="small"
                title="ダークモード切り替え"
              >
                {darkMode ? <Brightness7Icon /> : <Brightness4Icon />}
              </IconButton>
            </Box>
          </Toolbar>
        </AppBar>
        
        <Box 
          sx={{ 
            flexGrow: 1, 
            mt: '96px', // AppBarの高さ分のマージン
            position: 'relative',
            backgroundColor: darkMode ? '#000000' : '#ffffff',
            overflow: 'hidden'
          }}
          onClick={handleClearFocus}
        >
          <StarMap 
            showCompass={showCompass}
            showAltitude={showAltitude}
            selectedDate={selectedDate}
            focusedObject={focusedObject}
          />
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default App;
