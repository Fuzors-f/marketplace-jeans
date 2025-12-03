import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/products', { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const fetchProductBySlug = createAsyncThunk(
  'products/fetchProductBySlug',
  async (slug, { rejectWithValue }) => {
    try {
      const response = await api.get(`/products/${slug}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

const productSlice = createSlice({
  name: 'products',
  initialState: {
    products: [],
    currentProduct: null,
    pagination: null,
    isLoading: false,
    error: null,
  },
  reducers: {
    clearCurrentProduct: (state) => {
      state.currentProduct = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.products = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchProductBySlug.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchProductBySlug.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentProduct = action.payload;
      })
      .addCase(fetchProductBySlug.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearCurrentProduct } = productSlice.actions;
export default productSlice.reducer;
