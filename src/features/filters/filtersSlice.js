import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  searchTerm: '',
  category: 'popular',
  sortBy: 'hot',
};

const filtersSlice = createSlice({
  name: 'filters',
  initialState,
  reducers: {
    setSearchTerm: (state, action) => {
      state.searchTerm = action.payload;
    },
    setCategory: (state, action) => {
      state.category = action.payload;
    },
    setSortBy: (state, action) => {
      state.sortBy = action.payload;
    },
  },
});

export const { setSearchTerm, setCategory, setSortBy } = filtersSlice.actions;
export default filtersSlice.reducer;