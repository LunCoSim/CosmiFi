import { configureStore } from '@reduxjs/toolkit';
import designerSlice from './slices/designerSlice';
import collectionSlice from './slices/collectionSlice';
import uiSlice from './slices/uiSlice';

export const store = configureStore({
  reducer: {
    designer: designerSlice,
    collection: collectionSlice,
    ui: uiSlice,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;