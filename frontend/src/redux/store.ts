import { configureStore } from '@reduxjs/toolkit';

import pathReducer from './path/path';

export const store = configureStore({
  reducer: {
    pathReducer
  }
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;
