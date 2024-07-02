// /redux/reducers/userReducer.js
import { createSlice } from "@reduxjs/toolkit";

const agentSlice = createSlice({
  name: "agent",
  initialState: {
   isAgent: false,
   agentResponse: ""
  },
  reducers: {
    setIsAgent: (state, action) => {
      const isAgent = action.payload;
      state.isAgent = isAgent;
    },

    setAgentResponse: (state, action) => {
        const agentResponse = action.payload;
        state.agentResponse = agentResponse;
      },
  },
});

export const { setIsAgent, setAgentResponse } = agentSlice.actions;
export default agentSlice.reducer;
