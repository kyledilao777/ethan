// /redux/reducers/userReducer.js
import { createSlice } from "@reduxjs/toolkit";

const authSlice = createSlice({
  name: "auth",
  initialState: {
   isLoggedIn: false,
  },
  reducers: {
    setLogin: (state, action) => {
      const isLoggedIn = action.payload;
      state.isLoggedIn = isLoggedIn;
    },
  },
});

export const { setLogin } = authSlice.actions;
export default authSlice.reducer;
