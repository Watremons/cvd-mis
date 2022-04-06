import { createSlice, PayloadAction } from '@reduxjs/toolkit';

const initialState: Entity.User = {
  uid: 0,
  userName: '未知用户',
  createDate: 0,
  userProjectNum: 0,
  authority: 0
};

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    changeUser: (state, action: PayloadAction<Entity.User>) => {
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
