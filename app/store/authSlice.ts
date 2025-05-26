import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User as UserType } from '../types';

// Auth state tipi
interface AuthState {
  isAuthenticated: boolean;
  user: UserType | null;
  loading: boolean;
  error: string | null;
  lastLogin?: string; // Son giriş zamanı
  accessToken?: string; // Kimlik doğrulama tokeni
}

// Başlangıç durumu
const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  loading: false,
  error: null,
};

// Auth slice oluşturma
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Yükleme başladı
    authStart: state => {
      state.loading = true;
      state.error = null;
    },

    // Giriş başarılı
    loginSuccess: (state, action: PayloadAction<UserType & { accessToken?: string }>) => {
      const { accessToken, ...userData } = action.payload;
      state.isAuthenticated = true;
      state.user = userData;
      state.loading = false;
      state.error = null;
      state.lastLogin = new Date().toISOString();
      if (accessToken) {
        state.accessToken = accessToken;
      }
    },

    // Kayıt başarılı
    registerSuccess: (state, action: PayloadAction<UserType & { accessToken?: string }>) => {
      const { accessToken, ...userData } = action.payload;
      state.isAuthenticated = true;
      state.user = userData;
      state.loading = false;
      state.error = null;
      state.lastLogin = new Date().toISOString();
      if (accessToken) {
        state.accessToken = accessToken;
      }
    },

    // Hata oluştu
    authFail: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Çıkış yap
    logout: state => {
      state.isAuthenticated = false;
      state.user = null;
      state.accessToken = undefined;
    },

    // Token'ı güncelle
    updateToken: (state, action: PayloadAction<string>) => {
      state.accessToken = action.payload;
    },

    // Kullanıcı bilgisini güncelle
    updateUserInfo: (state, action: PayloadAction<Partial<UserType>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },

    // Hata mesajını temizle
    clearError: state => {
      state.error = null;
    },
  },
});

// Action'ları dışa aktar
export const {
  authStart,
  loginSuccess,
  registerSuccess,
  authFail,
  logout,
  updateToken,
  updateUserInfo,
  clearError,
} = authSlice.actions;

export default authSlice.reducer;
