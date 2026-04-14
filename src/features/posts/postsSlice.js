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
  isSearching: false,
  comments: [],
  commentsLoading: false,
  commentsError: null
};

const PROXIES = [
  (url) => `https://corsproxy.io/?url=${encodeURIComponent(url)}`,
  (url) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
  (url) => `https://thingproxy.freeboard.io/fetch/${url}`,
];

const isLocal = () =>
  window.location.hostname === 'localhost' ||
  window.location.hostname === '127.0.0.1';

const fetchWithFallback = async (rawUrl, options = {}) => {
  if (isLocal()) {
    const response = await axios.get(rawUrl, { timeout: 10000, ...options });
    return response;
  }

  let lastError;
  for (const buildProxy of PROXIES) {
    try {
      const proxied = buildProxy(rawUrl);
      const response = await axios.get(proxied, { timeout: 10000, ...options });
      return response;
    } catch (err) {
      lastError = err;
    }
  }
  throw lastError;
};

const buildRawUrl = (category, after = null) => {
  const subreddit = subredditMap[category] || category;
  return `https://www.reddit.com/r/${subreddit}.json${after ? `?after=${after}` : ''}`;
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
      const rawUrl = buildRawUrl(category, after);
      const response = await fetchWithFallback(rawUrl);
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

      const response = await fetchWithFallback(rawUrl);
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

export const fetchComments = createAsyncThunk(
  'posts/fetchComments',
  async ({ postId }, { rejectWithValue }) => {
    try {
      const rawUrl = `https://www.reddit.com/comments/${postId}.json`;
      const response = await fetchWithFallback(rawUrl);
      const comments = response.data[1].data.children
        .filter(child => child.kind === 't1')
        .map(child => child.data);
      return comments;
    } catch (error) {
      const status = error.response?.status;
      if (status === 429) {
        return rejectWithValue({
          message: 'Reddit API rate limit reached. Please wait a moment and try again.',
          type: 'rate_limit'
        });
      }
      return rejectWithValue({
        message: 'Failed to load comments. Please try again later.',
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
    },
    clearComments: (state) => {
      state.comments = [];
      state.commentsLoading = false;
      state.commentsError = null;
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
      })
      .addCase(fetchComments.pending, (state) => {
        state.commentsLoading = true;
        state.commentsError = null;
        state.comments = [];
      })
      .addCase(fetchComments.fulfilled, (state, action) => {
        state.commentsLoading = false;
        state.commentsError = null;
        state.comments = action.payload;
      })
      .addCase(fetchComments.rejected, (state, action) => {
        state.commentsLoading = false;
        state.commentsError = action.payload?.message || 'Failed to load comments.';
        state.comments = [];
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
export const selectComments = (state) => state.posts.comments;
export const selectCommentsLoading = (state) => state.posts.commentsLoading;
export const selectCommentsError = (state) => state.posts.commentsError;

export const { setCurrentCategory, clearPosts, clearSearch, clearComments } = postsSlice.actions;
export default postsSlice.reducer;