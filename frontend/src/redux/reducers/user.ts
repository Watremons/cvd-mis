import { createSlice, PayloadAction } from '@reduxjs/toolkit';

const initialState: API.IUserInfo = {
  uid: 0,
  userName: '未知用户',
  createDate: 0,
  authority: 0
};

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    changeUser: (state, action: PayloadAction<API.IUserInfo>) => {
      state.uid = action.payload.uid;
      state.userName = action.payload.userName;
      state.createDate = action.payload.createDate;
      state.authority = action.payload.authority;
    }
  }
});

// Action creators are generated for each case reducer function
export const { changeUser } = userSlice.actions;

export default userSlice.reducer;
