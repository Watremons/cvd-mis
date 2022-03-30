import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface UserState {
  username: string;
  authority: string;
}

const initialState: UserState = {
  username: '',
  authority: ''
};

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    changeUser: (state, action: PayloadAction<UserState>) => {
      state = action.payload;
    }
  }
});

// Action creators are generated for each case reducer function
export const { changeUser } = userSlice.actions;

export default userSlice.reducer;
