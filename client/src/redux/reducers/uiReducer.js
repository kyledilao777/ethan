// /redux/reducers/userReducer.js
import { createSlice } from "@reduxjs/toolkit";

const uiSlice = createSlice({
  name: "ui",
  initialState: {
    displayInput: false
  },
  reducers: {
    setDisplayInput: (state, action) => { //for homepage display input bar
      const displayInput = action.payload;
      state.displayInput = displayInput;
    },

    
  },
});

export const { setDisplayInput } = uiSlice.actions;
export default uiSlice.reducer;
