import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface DesignerState {
  isRegistered: boolean;
  profile: {
    name?: string;
    bio?: string;
    avatarUrl?: string;
  } | null;
  collections: string[];
  isLoading: boolean;
  error: string | null;
}

const initialState: DesignerState = {
  isRegistered: false,
  profile: null,
  collections: [],
  isLoading: false,
  error: null,
};

const designerSlice = createSlice({
  name: 'designer',
  initialState,
  reducers: {
    setDesignerStatus: (state, action: PayloadAction<boolean>) => {
      state.isRegistered = action.payload;
    },
    setDesignerProfile: (state, action: PayloadAction<DesignerState['profile']>) => {
      state.profile = action.payload;
    },
    setCollections: (state, action: PayloadAction<string[]>) => {
      state.collections = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  setDesignerStatus,
  setDesignerProfile,
  setCollections,
  setLoading,
  setError,
  clearError,
} = designerSlice.actions;

export default designerSlice.reducer;