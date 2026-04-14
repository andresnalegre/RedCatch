import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const subredditMap = {
  gaming: 'gaming',
  sports: 'sports',
  news: 'worldnews',
  technology: 'technology',
  programming: 'programming',
  popular: 'popular',
  all: 'all'
};

const initialState = {
  items: [],
  loading: false,
  error: null,
  errorType: null,
  currentCategory: 'popular',
  after: null,
  hasMore: true,
  loadingMore: false,
  searchTerm: '',
  isSearching: false
};

const PROXY = 'https://corsproxy.io/?url=';

const proxyUrl = (url) => {
  const isLocal =
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1';
  return isLocal ? url : `${PROXY}${encodeURIComponent(url)}`;
};

const buildUrl = (category, after = null) => {
  const subreddit = subredditMap[category] || category;
  const base = `https://www.reddit.com/r/${subreddit}.json${after ? `?after=${after}` : ''}`;
  return proxyUrl(base);
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
      const response = await axios.get(url, { timeout: 10000 });
      const posts = processRedditResponse(response.data);
      return {
        posts,
        after: response.data.data.after,
        hasMore: !!response.data.data.after && posts.length > 0
      };
    } catch (error) {
      const status = error.response?.status;
      if (status === 429) {
        return rejectWithValue({
          message: 'Reddit API rate limit reached. Please wait a moment and try again.',
          type: 'rate_limit'
        });
      }
      return rejectWithValue({
        message: `Failed to fetch posts from ${category}`,
        type: 'generic'
      });
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

      const subreddit = subredditMap[category] || category;
      let rawUrl;
      if (category === 'popular' || category === 'all') {
        rawUrl = `https://www.reddit.com/search.json?q=${encodeURIComponent(searchTerm)}&sort=relevance&limit=25`;
      } else {
        rawUrl = `https://www.reddit.com/r/${subreddit}/search.json?q=${encodeURIComponent(searchTerm)}&restrict_sr=on&sort=relevance&limit=25`;
      }

      const url = proxyUrl(rawUrl);
      const response = await axios.get(url, { timeout: 10000 });
      const posts = processRedditResponse(response.data);
      return {
        posts,
        after: response.data.data.after,
        hasMore: !!response.data.data.after && posts.length > 0,
        searchTerm
      };
    } catch (error) {
      const status = error.response?.status;
      if (status === 429) {
        return rejectWithValue({
          message: 'Reddit API rate limit reached. Please wait a moment and try again.',
          type: 'rate_limit'
        });
      }
      return rejectWithValue({
        message: 'Failed to search posts',
        type: 'generic'
      });
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
      state.errorType = null;
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
      .addCase(fetchPosts.pending, (state) => {
        if (state.items.length === 0) {
          state.loading = true;
        } else {
          state.loadingMore = true;
        }
        state.error = null;
        state.errorType = null;
      })
      .addCase(fetchPosts.fulfilled, (state, action) => {
        state.loading = false;
        state.loadingMore = false;
        state.error = null;
        state.errorType = null;
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
        state.error = action.payload?.message || action.payload;
        state.errorType = action.payload?.type || 'generic';
        state.hasMore = false;
      })
      .addCase(searchPosts.pending, (state) => {
        state.loading = true;
        state.isSearching = true;
        state.error = null;
        state.errorType = null;
      })
      .addCase(searchPosts.fulfilled, (state, action) => {
        state.loading = false;
        state.isSearching = false;
        state.searchTerm = action.payload.searchTerm || '';
        state.error = null;
        state.errorType = null;
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
        state.error = action.payload?.message || action.payload;
        state.errorType = action.payload?.type || 'generic';
        state.hasMore = false;
      });
  },
});

export const selectPosts = (state) => state.posts.items;
export const selectCurrentCategory = (state) => state.posts.currentCategory;
export const selectLoading = (state) => state.posts.loading;
export const selectLoadingMore = (state) => state.posts.loadingMore;
export const selectError = (state) => state.posts.error;
export const selectErrorType = (state) => state.posts.errorType;
export const selectAfter = (state) => state.posts.after;
export const selectHasMore = (state) => state.posts.hasMore;
export const selectSearchTerm = (state) => state.posts.searchTerm;
export const selectIsSearching = (state) => state.posts.isSearching;

export const { setCurrentCategory, clearPosts, clearSearch } = postsSlice.actions;
export default postsSlice.reducer;