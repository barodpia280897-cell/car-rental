import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosClient from '../api/axiosClient';

const initialState = {
  bookings: [],
  loading: false,
  error: null,
  bookingFlow: {
    step: 1,
    data: {
      startDate: null,
      endDate: null,
      pickupLocation: '',
      returnLocation: '',
      vehicleId: null,
      driverInfo: {
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
      },
    }
  }
};

export const fetchBookings = createAsyncThunk('booking/fetchBookings', async (_, { rejectWithValue }) => {
  try {
    const response = await axiosClient.get('/bookings');
    return response.data.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch bookings');
  }
});

export const createBooking = createAsyncThunk('booking/createBooking', async (bookingData, { rejectWithValue }) => {
  try {
    // Expected to send vehicleId, startDate, endDate, pickupLocation, returnLocation
    const response = await axiosClient.post('/bookings', bookingData);
    return response.data.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to create booking');
  }
});

export const cancelBooking = createAsyncThunk('booking/cancelBooking', async (bookingId, { rejectWithValue }) => {
  try {
    await axiosClient.put(`/bookings/${bookingId}/cancel`);
    return bookingId;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to cancel booking');
  }
});

const bookingSlice = createSlice({
  name: 'booking',
  initialState,
  reducers: {
    startBooking: (state, action) => {
      state.bookingFlow.data.vehicleId = action.payload.vehicleId;
      state.bookingFlow.step = 1;
    },
    updateBookingData: (state, action) => {
      state.bookingFlow.data = { ...state.bookingFlow.data, ...action.payload };
    },
    nextStep: (state) => {
      state.bookingFlow.step += 1;
    },
    prevStep: (state) => {
      state.bookingFlow.step -= 1;
    },
    resetBookingFlow: (state) => {
      state.bookingFlow = initialState.bookingFlow;
    },
    // Called when BookingFlow wizard finishes (step 7) — resets the flow
    completeBooking: (state) => {
      state.bookingFlow = initialState.bookingFlow;
    },
    // Called when a customer signs a contract — moves booking to 'Pending Approval'
    signContract: (state, action) => {
      const booking = state.bookings.find(b => b.id === action.payload);
      if (booking) booking.status = 'Pending Approval';
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Bookings
      .addCase(fetchBookings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBookings.fulfilled, (state, action) => {
        state.loading = false;
        state.bookings = action.payload;
      })
      .addCase(fetchBookings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create Booking
      .addCase(createBooking.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createBooking.fulfilled, (state, action) => {
        state.loading = false;
        state.bookings.unshift(action.payload);
        state.bookingFlow = initialState.bookingFlow; // Reset flow on success
      })
      .addCase(createBooking.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Cancel Booking
      .addCase(cancelBooking.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(cancelBooking.fulfilled, (state, action) => {
        state.loading = false;
        const booking = state.bookings.find(b => b.id === action.payload);
        if (booking) booking.status = 'Cancelled';
      })
      .addCase(cancelBooking.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { 
  startBooking, 
  updateBookingData, 
  nextStep, 
  prevStep,
  resetBookingFlow,
  completeBooking,
  signContract,
} = bookingSlice.actions;

export default bookingSlice.reducer;
