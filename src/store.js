// store.js
import { configureStore } from '@reduxjs/toolkit';
import astaReducer from './state/slices/astaSlice';
import errorReducer from './state/slices/errorSlice';

export const store = configureStore({
  reducer: {
    asta: astaReducer,
    error: errorReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ['asta/updateAsta/fulfilled'],
        // Ignore these field paths in all actions
        ignoredActionPaths: ['meta.arg.tempoInizio'],
        // Ignore these paths in the state
        ignoredPaths: ['asta.tempoInizio'],
      },
    }),
});

export default store;