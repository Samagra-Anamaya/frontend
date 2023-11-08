import { createAsyncThunk } from '@reduxjs/toolkit';

// Create an async thunk for fetching user data
export const loginUser = createAsyncThunk('user/login', async (userData, thunkAPI) => {
    try {
        const state = thunkAPI.getState();
        console.log("Login User Thunk", { state, userData })
        return userData;
    } catch (error) {
        return thunkAPI.rejectWithValue(error.message || 'Failed to login user.');
    }
});
