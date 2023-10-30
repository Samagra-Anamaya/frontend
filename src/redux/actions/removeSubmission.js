import {  createAsyncThunk } from '@reduxjs/toolkit';

// Create an async thunk for fetching user data
export const removeSubmission = createAsyncThunk('user/removeSubmission', async (recordToRemove, thunkAPI) => {
    try {
        const state = thunkAPI.getState(); 
        console.log("ram ram",{state,recordToRemove})
        return recordToRemove;
      } catch (error) {
        return thunkAPI.rejectWithValue(error.message || 'Failed to fetch user.');
      }
});
