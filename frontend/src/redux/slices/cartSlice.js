import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

// Async thunks
export const fetchCart = createAsyncThunk(
  'cart/fetchCart',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/cart');
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch cart');
    }
  }
);

export const addToCart = createAsyncThunk(
  'cart/addToCart',
  async ({ product_variant_id, quantity }, { rejectWithValue }) => {
    try {
      await api.post('/cart', { product_variant_id, quantity });
      const response = await api.get('/cart');
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add to cart');
    }
  }
);

export const updateCartItem = createAsyncThunk(
  'cart/updateCartItem',
  async ({ itemId, quantity }, { rejectWithValue }) => {
    try {
      await api.put(`/cart/${itemId}`, { quantity });
      const response = await api.get('/cart');
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update cart');
    }
  }
);

export const removeFromCart = createAsyncThunk(
  'cart/removeFromCart',
  async (itemId, { rejectWithValue }) => {
    try {
      await api.delete(`/cart/${itemId}`);
      const response = await api.get('/cart');
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to remove item');
    }
  }
);

export const clearCart = createAsyncThunk(
  'cart/clearCart',
  async (_, { rejectWithValue }) => {
    try {
      await api.delete('/cart');
      return { items: [], total: 0 };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to clear cart');
    }
  }
);

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    items: [],
    total: 0,
    isLoading: false,
    error: null,
  },
  reducers: {
    clearCartError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch Cart
    builder
      .addCase(fetchCart.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload.items;
        state.total = action.payload.total;
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Add to Cart
    builder
      .addCase(addToCart.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload.items;
        state.total = action.payload.total;
      })
      .addCase(addToCart.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Update Cart Item
    builder
      .addCase(updateCartItem.fulfilled, (state, action) => {
        state.items = action.payload.items;
        state.total = action.payload.total;
      });

    // Remove from Cart
    builder
      .addCase(removeFromCart.fulfilled, (state, action) => {
        state.items = action.payload.items;
        state.total = action.payload.total;
      });

    // Clear Cart
    builder
      .addCase(clearCart.fulfilled, (state) => {
        state.items = [];
        state.total = 0;
      });
  },
});

export const { clearCartError } = cartSlice.actions;
export default cartSlice.reducer;
