import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';

const API_BASE_URL = 'http://localhost:8000'; // Change this to your server URL

class AuthService {
  static async login(email, password) {
    try {
      // Get device location for security
      const location = await this.getDeviceLocation();
      
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          device_info: {
            platform: 'mobile',
            location: location,
            timestamp: new Date().toISOString()
          }
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'خطأ في تسجيل الدخول');
      }

      // Store user data and token
      await AsyncStorage.setItem('userToken', data.access_token);
      await AsyncStorage.setItem('userData', JSON.stringify(data.user));
      await AsyncStorage.setItem('refreshToken', data.refresh_token || '');

      return {
        token: data.access_token,
        user: data.user,
        permissions: data.permissions || []
      };
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  static async logout() {
    try {
      const token = await AsyncStorage.getItem('userToken');
      
      if (token) {
        await fetch(`${API_BASE_URL}/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
      }

      // Clear stored data
      await AsyncStorage.multiRemove(['userToken', 'userData', 'refreshToken']);
      
    } catch (error) {
      console.error('Logout error:', error);
      // Even if logout API fails, clear local storage
      await AsyncStorage.multiRemove(['userToken', 'userData', 'refreshToken']);
    }
  }

  static async validateToken(token) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Invalid token');
      }

      const userData = await response.json();
      return userData;
    } catch (error) {
      console.error('Token validation error:', error);
      // If token is invalid, clear storage
      await AsyncStorage.multiRemove(['userToken', 'userData', 'refreshToken']);
      return null;
    }
  }

  static async refreshAccessToken() {
    try {
      const refreshToken = await AsyncStorage.getItem('refreshToken');
      
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          refresh_token: refreshToken,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Failed to refresh token');
      }

      // Update stored token
      await AsyncStorage.setItem('userToken', data.access_token);
      
      return data.access_token;
    } catch (error) {
      console.error('Token refresh error:', error);
      // If refresh fails, user needs to login again
      await AsyncStorage.multiRemove(['userToken', 'userData', 'refreshToken']);
      throw error;
    }
  }

  static async getDeviceLocation() {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        return null;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy: location.coords.accuracy,
      };
    } catch (error) {
      console.error('Location error:', error);
      return null;
    }
  }

  static async getCurrentUser() {
    try {
      const userData = await AsyncStorage.getItem('userData');
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  }

  static async getAuthToken() {
    try {
      return await AsyncStorage.getItem('userToken');
    } catch (error) {
      console.error('Get auth token error:', error);
      return null;
    }
  }

  static async changePassword(currentPassword, newPassword) {
    try {
      const token = await this.getAuthToken();
      
      if (!token) {
        throw new Error('User not authenticated');
      }

      const response = await fetch(`${API_BASE_URL}/security/password/change`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          current_password: currentPassword,
          new_password: newPassword,
          confirm_password: newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'فشل في تغيير كلمة المرور');
      }

      return data;
    } catch (error) {
      console.error('Change password error:', error);
      throw error;
    }
  }

  static async enableTwoFactor(password) {
    try {
      const token = await this.getAuthToken();
      
      if (!token) {
        throw new Error('User not authenticated');
      }

      const response = await fetch(`${API_BASE_URL}/security/2fa/setup`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          password: password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'فشل في إعداد المصادقة الثنائية');
      }

      return data;
    } catch (error) {
      console.error('Enable 2FA error:', error);
      throw error;
    }
  }

  static async verifyTwoFactor(token) {
    try {
      const authToken = await this.getAuthToken();
      
      if (!authToken) {
        throw new Error('User not authenticated');
      }

      const response = await fetch(`${API_BASE_URL}/security/2fa/verify`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: token,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'رمز التحقق غير صحيح');
      }

      return data;
    } catch (error) {
      console.error('Verify 2FA error:', error);
      throw error;
    }
  }
}

export default AuthService;
