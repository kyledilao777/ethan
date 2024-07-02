// src/redux/store.js
import { configureStore } from '@reduxjs/toolkit';
import userReducer from '../reducers/userReducer';
import agentReducer from '../reducers/agentReducer';
import uiReducer from '../reducers/uiReducer';

const store = configureStore({
  reducer: {
    user: userReducer, 
    agent:  agentReducer,
    ui: uiReducer, // Make sure the state slice is named 'user'
  },
});

export default store;
