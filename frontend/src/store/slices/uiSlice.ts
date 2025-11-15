import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UIState {
  isRegisterModalOpen: boolean;
  isCreateCollectionModalOpen: boolean;
  isMintModalOpen: boolean;
  isEditProfileModalOpen: boolean;
  theme: 'light' | 'dark';
  notifications: Notification[];
}

interface Notification {
  id: string;
  type: 'success' | 'error' | 'info';
  title: string;
  message: string;
  timestamp: number;
}

const initialState: UIState = {
  isRegisterModalOpen: false,
  isCreateCollectionModalOpen: false,
  isMintModalOpen: false,
  isEditProfileModalOpen: false,
  theme: 'light',
  notifications: [],
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setRegisterModalOpen: (state, action: PayloadAction<boolean>) => {
      state.isRegisterModalOpen = action.payload;
    },
    setCreateCollectionModalOpen: (state, action: PayloadAction<boolean>) => {
      state.isCreateCollectionModalOpen = action.payload;
    },
    setMintModalOpen: (state, action: PayloadAction<boolean>) => {
      state.isMintModalOpen = action.payload;
    },
    setEditProfileModalOpen: (state, action: PayloadAction<boolean>) => {
      state.isEditProfileModalOpen = action.payload;
    },
    setTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
      state.theme = action.payload;
    },
    addNotification: (state, action: PayloadAction<Omit<Notification, 'id' | 'timestamp'>>) => {
      const notification: Notification = {
        ...action.payload,
        id: Date.now().toString(),
        timestamp: Date.now(),
      };
      state.notifications.push(notification);
    },
    removeNotification: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter(
        (notification) => notification.id !== action.payload
      );
    },
  },
});

export const {
  setRegisterModalOpen,
  setCreateCollectionModalOpen,
  setMintModalOpen,
  setEditProfileModalOpen,
  setTheme,
  addNotification,
  removeNotification,
} = uiSlice.actions;

export default uiSlice.reducer;