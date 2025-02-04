import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const subredditMap = {
  gaming: ['gaming', 'Games', 'pcgaming', 'GameDeals', 'Steam', 'videogames', 'esports', 'gamernews'],
  sports: ['sports', 'nba', 'soccer', 'nfl', 'baseball', 'hockey', 'formula1', 'MMA', 'tennis'],
  news: ['news', 'worldnews', 'politics', 'technews', 'UpliftingNews', 'science', 'business'],
  technology: ['technology', 'tech', 'gadgets', 'hardware', 'artificial', 'Futurology', 'cybersecurity'],
  programming: ['programming', 'coding', 'webdev', 'learnprogramming', 'javascript', 'reactjs', 'python'],
  popular: ['popular'],
  all: ['all']
};

const initialState = {
  items: [],
  loading: false,
  error: null,
  currentCategory: 'popular',
  after: null,
  hasMore: true,
  loadingMore: false,
  searchTerm: '',
  isSearching: false
};

const buildUrl = (category, after = null) => {
  if (category === 'popular' || category === 'all') {
    return `https://www.reddit.com/r/${category}.json${after ? `?after=${after}` : ''}`;
  }
  const subreddits = subredditMap[category].join('+');
  return `https://www.reddit.com/r/${subreddits}.json${after ? `?after=${after}` : ''}`;
};

const processRedditResponse = (data) => {
  return data.data.children.map(child => ({
    id: child.data.id,
    title: child.data.title,
    author: child.data.author,
    subreddit: child.data.subreddit,
    score: child.data.score,
    num_comments: child.data.num_comments,
    created_utc: child.data.created_utc,
    permalink: child.data.permalink,
    url: child.data.url,
    thumbnail: child.data.thumbnail,
    name: child.data.name,
    is_video: child.data.is_video,
    media: child.data.media,
    post_hint: child.data.post_hint,
    selftext: child.data.selftext,
    selftext_html: child.data.selftext_html,
    preview: child.data.preview
  }));
};

export const fetchPosts = createAsyncThunk(
  'posts/fetchPosts',
  async ({ category = 'popular', after = null }, { rejectWithValue }) => {
    try {
      const url = buildUrl(category, after);
      const response = await axios.get(url);
      const posts = processRedditResponse(response.data);

      return {
        posts,
        after: response.data.data.after,
        hasMore: !!response.data.data.after && posts.length > 0
      };
    } catch (error) {
      console.error('Fetch error:', error);
      return rejectWithValue(`Failed to fetch posts from ${category}`);
    }
  }
);

export const searchPosts = createAsyncThunk(
  'posts/searchPosts',
  async ({ searchTerm, category }, { rejectWithValue }) => {
    try {
      if (!searchTerm || searchTerm.trim().length < 3) {
        return { posts: [], after: null, hasMore: false, searchTerm: '' };
      }

      let url;
      if (category === 'popular' || category === 'all') {
        url = `https://www.reddit.com/search.json?q=${encodeURIComponent(searchTerm)}&sort=relevance&limit=25`;
      } else {
        const subreddits = subredditMap[category].join('+');
        url = `https://www.reddit.com/r/${subreddits}/search.json?q=${encodeURIComponent(searchTerm)}&restrict_sr=on&sort=relevance&limit=25`;
      }

      const response = await axios.get(url);
      const posts = processRedditResponse(response.data);

      return {
        posts,
        after: response.data.data.after,
        hasMore: !!response.data.data.after && posts.length > 0,
        searchTerm
      };
    } catch (error) {
      console.error('Search error:', error);
      return rejectWithValue('Failed to search posts');
    }
  }
);

const postsSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {
    setCurrentCategory: (state, action) => {
      state.currentCategory = action.payload;
      state.items = [];
      state.after = null;
      state.error = null;
      state.hasMore = true;
      state.loadingMore = false;
      state.searchTerm = '';
      state.isSearching = false;
    },
    clearPosts: (state) => {
      state.items = [];
      state.after = null;
      state.hasMore = true;
      state.loadingMore = false;
      state.searchTerm = '';
      state.isSearching = false;
    },
    clearSearch: (state) => {
      state.searchTerm = '';
      state.isSearching = false;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Posts
      .addCase(fetchPosts.pending, (state) => {
        if (state.items.length === 0) {
          state.loading = true;
        } else {
          state.loadingMore = true;
        }
        state.error = null;
      })
      .addCase(fetchPosts.fulfilled, (state, action) => {
        state.loading = false;
        state.loadingMore = false;
        state.error = null;
        
        if (action.payload.posts.length > 0) {
          const newPosts = action.payload.posts.filter(
            newPost => !state.items.some(existingPost => existingPost.id === newPost.id)
          );
          if (newPosts.length > 0) {
            state.items = [...state.items, ...newPosts];
            state.after = action.payload.after;
            state.hasMore = action.payload.hasMore;
          } else {
            state.hasMore = false;
          }
        } else {
          state.hasMore = false;
        }
      })
      .addCase(fetchPosts.rejected, (state, action) => {
        state.loading = false;
        state.loadingMore = false;
        state.error = action.payload;
        state.hasMore = false;
      })
      // Search Posts
      .addCase(searchPosts.pending, (state) => {
        state.loading = true;
        state.isSearching = true;
        state.error = null;
      })
      .addCase(searchPosts.fulfilled, (state, action) => {
        state.loading = false;
        state.isSearching = false;
        state.searchTerm = action.payload.searchTerm || '';
        state.error = null;
        
        if (action.payload.posts.length > 0) {
          state.items = action.payload.posts;
          state.after = action.payload.after;
          state.hasMore = action.payload.hasMore;
        } else {
          state.items = [];
          state.after = null;
          state.hasMore = false;
        }
      })
      .addCase(searchPosts.rejected, (state, action) => {
        state.loading = false;
        state.isSearching = false;
        state.error = action.payload;
        state.hasMore = false;
      });
  },
});

// Selectors
export const selectPosts = (state) => state.posts.items;
export const selectCurrentCategory = (state) => state.posts.currentCategory;
export const selectLoading = (state) => state.posts.loading;
export const selectLoadingMore = (state) => state.posts.loadingMore;
export const selectError = (state) => state.posts.error;
export const selectAfter = (state) => state.posts.after;
export const selectHasMore = (state) => state.posts.hasMore;
export const selectSearchTerm = (state) => state.posts.searchTerm;
export const selectIsSearching = (state) => state.posts.isSearching;

export const { setCurrentCategory, clearPosts, clearSearch } = postsSlice.actions;
export default postsSlice.reducer;