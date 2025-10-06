import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getPublicDiaries, getUserDiaries, toggleLike, addComment, deleteComment, createDiary } from '../lib/api';

// Async thunks
export const fetchPublicDiaries = createAsyncThunk(
  'diaries/fetchPublic',
  async (_, { rejectWithValue }) => {
    try {
      const response = await getPublicDiaries();
      if (response.success) {
        return response.data;
      }
      return rejectWithValue('Failed to fetch diaries');
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchUserDiaries = createAsyncThunk(
  'diaries/fetchUser',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await getUserDiaries(userId);
      if (response.success) {
        return response.data;
      }
      return rejectWithValue('Failed to fetch user diaries');
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const likeDiary = createAsyncThunk(
  'diaries/like',
  async (diaryId, { rejectWithValue }) => {
    try {
      const response = await toggleLike(diaryId);
      console.log('✅ LIKE API RESPONSE:', response);
      console.log('✅ is_liked from server:', response.is_liked);
      console.log('✅ Full diary data:', response.data);
      
      if (response.success) {
        return { 
          diaryId, 
          diary: response.data, // Full diary object
          isLiked: response.data.is_liked_by_user, // Use the ACTUAL value from diary
          likesCount: response.data.likes_count
        };
      }
      return rejectWithValue('Failed to like diary');
    } catch (error) {
      console.error('❌ Like API Error:', error);
      return rejectWithValue(error.message);
    }
  }
);

export const commentOnDiary = createAsyncThunk(
  'diaries/comment',
  async ({ diaryId, comment }, { rejectWithValue }) => {
    try {
      const response = await addComment(diaryId, comment);
      if (response.success) {
        return { diaryId, comment: response.data };
      }
      return rejectWithValue('Failed to add comment');
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const removeComment = createAsyncThunk(
  'diaries/deleteComment',
  async ({ commentId, diaryId }, { rejectWithValue }) => {
    try {
      const response = await deleteComment(commentId);
      if (response.success) {
        return { commentId, diaryId };
      }
      return rejectWithValue('Failed to delete comment');
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const createNewDiary = createAsyncThunk(
  'diaries/create',
  async (diaryData, { rejectWithValue }) => {
    try {
      const response = await createDiary(diaryData);
      if (response.success) {
        return response.data;
      }
      return rejectWithValue('Failed to create diary');
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const diariesSlice = createSlice({
  name: 'diaries',
  initialState: {
    items: [],
    loading: false,
    error: null,
    likingDiaryId: null,
    commentingDiaryId: null,
    creating: false,
    expandedComments: {}, // Track which diary's comments are expanded
  },
  reducers: {
    clearDiaries: (state) => {
      state.items = [];
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    // Optimistic like toggle
    toggleLikeOptimistic: (state, action) => {
      const diaryId = action.payload;
      const diary = state.items.find(d => d.id === diaryId);
      if (diary) {
        console.log(`Optimistic update - diary ID: ${diaryId}, was liked: ${diary.is_liked_by_user}, will be: ${!diary.is_liked_by_user}`);
        diary.is_liked_by_user = !diary.is_liked_by_user;
        diary.likes_count = diary.is_liked_by_user 
          ? diary.likes_count + 1 
          : diary.likes_count - 1;
      }
    },
    // Toggle comments visibility
    toggleComments: (state, action) => {
      const diaryId = action.payload;
      state.expandedComments[diaryId] = !state.expandedComments[diaryId];
    },
  },
  extraReducers: (builder) => {
    // Fetch public diaries
    builder.addCase(fetchPublicDiaries.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchPublicDiaries.fulfilled, (state, action) => {
      state.loading = false;
      state.items = action.payload;
    });
    builder.addCase(fetchPublicDiaries.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });

    // Fetch user diaries
    builder.addCase(fetchUserDiaries.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchUserDiaries.fulfilled, (state, action) => {
      state.loading = false;
      state.items = action.payload;
    });
    builder.addCase(fetchUserDiaries.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });

    // Like diary
    builder.addCase(likeDiary.pending, (state, action) => {
      state.likingDiaryId = action.meta.arg;
    });
    builder.addCase(likeDiary.fulfilled, (state, action) => {
      state.likingDiaryId = null;
      const { diaryId, diary: updatedDiary, isLiked, likesCount } = action.payload;
      const diaryIndex = state.items.findIndex(d => d.id === diaryId);
      
      if (diaryIndex !== -1) {
        console.log('🔄 UPDATING REDUX STATE:');
        console.log('   Old state:', state.items[diaryIndex].is_liked_by_user);
        console.log('   New state:', isLiked);
        console.log('   Full diary:', updatedDiary);
        
        // REPLACE the entire diary object with server data
        state.items[diaryIndex] = {
          ...state.items[diaryIndex],
          ...updatedDiary,
          // FORCE these values
          is_liked_by_user: isLiked,
          likes_count: likesCount
        };
        
        console.log('   ✅ Updated state:', state.items[diaryIndex].is_liked_by_user);
      }
    });
    builder.addCase(likeDiary.rejected, (state, action) => {
      state.likingDiaryId = null;
      // Revert optimistic update
      const diaryId = action.meta.arg;
      const diary = state.items.find(d => d.id === diaryId);
      if (diary) {
        diary.is_liked_by_user = !diary.is_liked_by_user;
        diary.likes_count = diary.is_liked_by_user 
          ? diary.likes_count + 1 
          : diary.likes_count - 1;
      }
    });

    // Add comment
    builder.addCase(commentOnDiary.pending, (state, action) => {
      state.commentingDiaryId = action.meta.arg.diaryId;
    });
    builder.addCase(commentOnDiary.fulfilled, (state, action) => {
      state.commentingDiaryId = null;
      const { diaryId, comment } = action.payload;
      const diary = state.items.find(d => d.id === diaryId);
      if (diary) {
        if (!diary.comments) {
          diary.comments = [];
        }
        diary.comments.push(comment);
        diary.comments_count = diary.comments.length;
      }
    });
    builder.addCase(commentOnDiary.rejected, (state) => {
      state.commentingDiaryId = null;
    });

    // Delete comment
    builder.addCase(removeComment.fulfilled, (state, action) => {
      const { commentId, diaryId } = action.payload;
      const diary = state.items.find(d => d.id === diaryId);
      if (diary && diary.comments) {
        diary.comments = diary.comments.filter(c => c.id !== commentId);
        diary.comments_count = diary.comments.length;
      }
    });

    // Create diary
    builder.addCase(createNewDiary.pending, (state) => {
      state.creating = true;
      state.error = null;
    });
    builder.addCase(createNewDiary.fulfilled, (state, action) => {
      state.creating = false;
      // Add new diary at the beginning
      state.items.unshift(action.payload);
    });
    builder.addCase(createNewDiary.rejected, (state, action) => {
      state.creating = false;
      state.error = action.payload;
    });
  },
});

export const { clearDiaries, clearError, toggleLikeOptimistic, toggleComments } = diariesSlice.actions;

// Selectors
export const selectDiaries = (state) => state.diaries.items;
export const selectDiariesLoading = (state) => state.diaries.loading;
export const selectDiariesError = (state) => state.diaries.error;
export const selectLikingDiaryId = (state) => state.diaries.likingDiaryId;
export const selectCommentingDiaryId = (state) => state.diaries.commentingDiaryId;
export const selectCreating = (state) => state.diaries.creating;
export const selectExpandedComments = (state) => state.diaries.expandedComments;

export default diariesSlice.reducer;
