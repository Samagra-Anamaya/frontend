import { createAsyncThunk } from '@reduxjs/toolkit';

// Create an async thunk for saving user submission
export const saveCitizenFormData = createAsyncThunk('user/saveCitizenFormData', async (recordToAdd, thunkAPI) => {
    try {
        return recordToAdd;
    } catch (error) {
        return thunkAPI.rejectWithValue(error.message || 'failed');
    }
});
