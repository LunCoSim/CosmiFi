import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Collection {
  address: string;
  name: string;
  symbol: string;
  designer: string;
  totalSupply: number;
}

interface CollectionState {
  collections: Collection[];
  selectedCollection: Collection | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: CollectionState = {
  collections: [],
  selectedCollection: null,
  isLoading: false,
  error: null,
};

const collectionSlice = createSlice({
  name: 'collection',
  initialState,
  reducers: {
    setCollections: (state, action: PayloadAction<Collection[]>) => {
      state.collections = action.payload;
    },
    addCollection: (state, action: PayloadAction<Collection>) => {
      state.collections.push(action.payload);
    },
    setSelectedCollection: (state, action: PayloadAction<Collection | null>) => {
      state.selectedCollection = action.payload;
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
  setCollections,
  addCollection,
  setSelectedCollection,
  setLoading,
  setError,
  clearError,
} = collectionSlice.actions;

export default collectionSlice.reducer;