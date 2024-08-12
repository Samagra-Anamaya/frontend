import { createAsyncThunk } from '@reduxjs/toolkit';

// Create an async thunk for fetching user data
export const _updateSubmissionMedia = createAsyncThunk(
	'submission/updateSubmissionMedia',
	async (records, thunkAPI) => {
		try {
			return records;
		} catch (error) {
			return thunkAPI.rejectWithValue(error.message || 'Failed to fetch user.');
		}
	}
);
