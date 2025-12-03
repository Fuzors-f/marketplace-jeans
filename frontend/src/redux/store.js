import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import authReducer from './slices/authSlice';
import cartReducer from './slices/cartSlice';
import productReducer from './slices/productSlice';
import orderReducer from './slices/orderSlice';

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['auth', 'cart'], // Only persist auth and cart
};

const persistedAuthReducer = persistReducer(
  { ...persistConfig, key: 'auth' },
  authReducer
);

const persistedCartReducer = persistReducer(
  { ...persistConfig, key: 'cart' },
  cartReducer
);

export const store = configureStore({
  reducer: {
    auth: persistedAuthReducer,
    cart: persistedCartReducer,
    products: productReducer,
    orders: orderReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
});

export const persistor = persistStore(store);
