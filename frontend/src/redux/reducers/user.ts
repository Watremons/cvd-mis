import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { defaultUser } from '../../pages/user/constant';

const initialState: Entity.User = defaultUser;

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    changeUser: (state, action: PayloadAction<Entity.User>) => {
      state.uid = action.payload.uid;
      state.userName = action.payload.userName;
      state.userDes = action.payload.userDes;
      state.createDate = action.payload.createDate;
      state.authority = action.payload.authority;
      state.userProjectNum = action.payload.userProjectNum;
      state.description = action.payload.description;
    }
  }
});

// Action creators are generated for each case reducer function
export const { changeUser } = userSlice.actions;

export default userSlice.reducer;
