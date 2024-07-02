// /redux/reducers/userReducer.js
import { createSlice } from "@reduxjs/toolkit";

const userSlice = createSlice({
  name: "user",
  initialState: {
    plan: "free", //professional, business
    isAuthenticated: false,
    name: "Default User",
    photo: "",
    email: "",
    calendarId: "",
    data: [],
    input: "",
  },
  reducers: {
    setUserInfo: (state, action) => {
      const { name, photo, email, calendarId } = action.payload;
      state.name = name;
      state.photo = photo;
      state.email = email;
      state.calendarId = calendarId;
    },

    setData: (state, action) => {
      const data = action.payload;
      state.data = data;
    },

    updateDataById: (state, action) => { //for update the data
      const { id, newData } = action.payload;
      const index = state.data.findIndex((item) => item.id === id); // Corrected to reference state.data
      console.log(id)
      if (index !== -1) {
        state.data[index] = { ...state.data[index], ...newData };
      }
    },

    setUserInput: (state, action) => {
      const input = action.payload;
      state.input = input;
    },

    setTypingEffect: (state, action) => {
      const { id, showTypingEffect } = action.payload;
      const index = state.data.findIndex((item) => item.id === id); // Corrected to reference state.data
      console.log(showTypingEffect)
      console.log(id)
      if (index !== -1) {
        state.data[index].showTypingEffect = showTypingEffect;
      }
    },

    setIsAuthenticated: (state, action) => {
      const isAuthenticated = action.payload;
      state.isAuthenticated = isAuthenticated;
    },
  },
});

export const { setUserInfo, setData, updateDataById, setTypingEffect, setIsAuthenticated, setUserInput } =
  userSlice.actions;
export default userSlice.reducer;
