// import React, { useState, useEffect } from 'react'; // React is likely unused with new JSX transform
import React, { useState, useEffect } from 'react'; // Keep React for useState, useEffect
import { Autocomplete, TextField, CircularProgress } from '@mui/material';
import { searchCelestialObjects } from '../services/starService'; // Updated path again
import StarIcon from '@mui/icons-material/Star';
import PublicIcon from '@mui/icons-material/Public';

export const SearchBar = ({ onResultSelect, sx = {} }) => {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // 検索クエリが空の場合は検索しない
    if (!inputValue.trim()) {
      setOptions([]);
      return;
    }

    // 検索を実行
    const searchTimer = setTimeout(async () => {
      setLoading(true);
      try {
        const results = await searchCelestialObjects(inputValue);
        // 星と星座の結果を統合
        const combinedResults = [
          ...results.stars.map(star => ({
            ...star,
            type: 'star',
            label: `${star.name_jp || star.name} (${star.bayer_designation || '名称不明'})`
          })),
          ...results.constellations.map(constellation => ({
            ...constellation,
            type: 'constellation',
            label: `${constellation.name_jp} (${constellation.name})`,
            right_ascension_center: parseFloat(constellation.right_ascension_center),
            declination_center: parseFloat(constellation.declination_center)
          }))
        ];
        setOptions(combinedResults);
      } catch (error) {
        console.error('検索エラー:', error);
        setOptions([]);
      } finally {
        setLoading(false);
      }
    }, 300); // 300ms後に検索を実行（タイピング中の過剰なAPIコールを防ぐ）

    return () => clearTimeout(searchTimer);
  }, [inputValue]);

  return (
    <Autocomplete
      sx={{ width: 300, ...sx }}
      open={open}
      onOpen={() => setOpen(true)}
      onClose={() => setOpen(false)}
      inputValue={inputValue}
      onInputChange={(event, newInputValue) => {
        setInputValue(newInputValue);
      }}
      onChange={(event, newValue) => {
        onResultSelect(newValue || null);
      }}
      clearOnBlur={false}
      clearOnEscape={true}
      isOptionEqualToValue={(option, value) => 
        option.type === value.type && option.id === value.id
      }
      getOptionLabel={(option) => option.label || ''}
      options={options}
      loading={loading}
      renderOption={(props, option) => (
        <li {...props}>
          {option.type === 'star' ? <StarIcon sx={{ mr: 1 }} /> : <PublicIcon sx={{ mr: 1 }} />}
          {option.label}
        </li>
      )}
      renderInput={(params) => (
        <TextField
          {...params}
          label="星・星座を検索"
          inputProps={{ // Add data-testid to the input element itself
            ...params.inputProps,
            'data-testid': 'search-input',
          }}
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <React.Fragment>
                {loading ? <CircularProgress color="inherit" size={20} /> : null}
                {params.InputProps.endAdornment}
              </React.Fragment>
            ),
          }}
        />
      )}
    />
  );
};

export default SearchBar;
