import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface PathState {
  path: string;
}

const initialState: PathState = {
  path: ''
};

export const pathSlice = createSlice({
  name: 'path',
  initialState,
  reducers: {
    switchPath: (state, action: PayloadAction<string>) => {
      state.path = action.payload;
    }
  }
});

// Action creators are generated for each case reducer function
export const { switchPath } = pathSlice.actions;

export default pathSlice.reducer;
