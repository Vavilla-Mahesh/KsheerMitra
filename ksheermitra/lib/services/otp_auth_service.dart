import '../models/user_model.dart';
import '../config/api_config.dart';
import 'api_service.dart';

class OtpAuthService {
  final ApiService _apiService;

  OtpAuthService(this._apiService);

  /// Request OTP for login/signup
  Future<Map<String, dynamic>> sendOtp({
    required String phone,
  }) async {
    try {
      final response = await _apiService.post(
        '/api/auth/send-otp',
        data: {
          'phone': phone,
        },
      );

      if (response.data['success']) {
        return {
          'success': true,
          'message': response.data['message'] ?? 'OTP sent successfully',
        };
      } else {
        return {
          'success': false,
          'message': response.data['message'] ?? 'Failed to send OTP',
        };
      }
    } catch (e) {
      return {
        'success': false,
        'message': e.toString(),
      };
    }
  }

  /// Verify OTP and login
  Future<Map<String, dynamic>> verifyOtp({
    required String phone,
    required String otp,
  }) async {
    try {
      final response = await _apiService.post(
        '/api/auth/verify-otp',
        data: {
          'phone': phone,
          'otp': otp,
        },
      );

      if (response.data['success']) {
        final token = response.data['token'];
        final user = User.fromJson(response.data['user']);

        // Save token
        await _apiService.saveTokens(token, token); // Using same token for both

        return {
          'success': true,
          'user': user,
          'message': response.data['message'] ?? 'Login successful',
        };
      } else {
        return {
          'success': false,
          'message': response.data['message'] ?? 'Invalid OTP',
        };
      }
    } catch (e) {
      return {
        'success': false,
        'message': e.toString(),
      };
    }
  }

  /// Update profile with location and other details
  Future<Map<String, dynamic>> updateProfile({
    String? name,
    String? email,
    String? address,
    double? latitude,
    double? longitude,
  }) async {
    try {
      final data = <String, dynamic>{};
      if (name != null) data['name'] = name;
      if (email != null) data['email'] = email;
      if (address != null) data['address'] = address;
      if (latitude != null) data['latitude'] = latitude;
      if (longitude != null) data['longitude'] = longitude;

      final response = await _apiService.put(
        '/api/auth/profile',
        data: data,
      );

      if (response.data['success']) {
        final user = User.fromJson(response.data['user']);
        return {
          'success': true,
          'user': user,
          'message': 'Profile updated successfully',
        };
      } else {
        return {
          'success': false,
          'message': response.data['message'] ?? 'Failed to update profile',
        };
      }
    } catch (e) {
      return {
        'success': false,
        'message': e.toString(),
      };
    }
  }

  /// Get current user profile
  Future<User?> getProfile() async {
    try {
      final response = await _apiService.get('/api/auth/profile');
      if (response.data['success']) {
        return User.fromJson(response.data['user']);
      }
      return null;
    } catch (e) {
      return null;
    }
  }
}
