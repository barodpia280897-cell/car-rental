import { configureStore } from '@reduxjs/toolkit';
import fleetReducer from './fleetSlice';
import authReducer from './authSlice';
import bookingReducer from './bookingSlice';
import analyticsReducer from './analyticsSlice';
import { injectStore } from '../api/axiosClient';

export const store = configureStore({
  reducer: {
    fleet: fleetReducer,
    auth: authReducer,
    booking: bookingReducer,
    analytics: analyticsReducer,
  },
});

injectStore(store);
