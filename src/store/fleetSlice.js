import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosClient from '../api/axiosClient';

const initialState = {
  vehicles: [],
  loading: false,
  error: null,
};

export const fetchVehicles = createAsyncThunk('fleet/fetchVehicles', async (_, { rejectWithValue }) => {
  try {
    const response = await axiosClient.get('/vehicles');
    return response.data.data; // Array of vehicles
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch vehicles');
  }
});

const fleetSlice = createSlice({
  name: 'fleet',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchVehicles.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchVehicles.fulfilled, (state, action) => {
        state.loading = false;
        state.vehicles = action.payload;
      })
      .addCase(fetchVehicles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export default fleetSlice.reducer;
