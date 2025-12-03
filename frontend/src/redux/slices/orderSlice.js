import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

export const createOrder = createAsyncThunk(
  'orders/createOrder',
  async (orderData, { rejectWithValue }) => {
    try {
      const response = await api.post('/orders', orderData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const fetchOrders = createAsyncThunk(
  'orders/fetchOrders',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/orders', { params });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const fetchOrderById = createAsyncThunk(
  'orders/fetchOrderById',
  async (orderId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/orders/${orderId}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

const orderSlice = createSlice({
  name: 'orders',
  initialState: {
    orders: [],
    currentOrder: null,
    isLoading: false,
    error: null,
  },
  reducers: {
    clearCurrentOrder: (state) => {
      state.currentOrder = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createOrder.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createOrder.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchOrders.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orders = action.payload;
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchOrderById.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchOrderById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentOrder = action.payload;
      })
      .addCase(fetchOrderById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearCurrentOrder } = orderSlice.actions;
export default orderSlice.reducer;
