import {  createAsyncThunk } from '@reduxjs/toolkit';

// Create an async thunk for fetching user data
export const replaceMediaObject = createAsyncThunk('user/replaceMedia', async (records, thunkAPI) => {
    try {
        const state = thunkAPI.getState(); 
        return records;
      } catch (error) {
        return thunkAPI.rejectWithValue(error.message || 'Failed to fetch user.');
      }
});
