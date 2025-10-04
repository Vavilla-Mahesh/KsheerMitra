import '../models/user_model.dart';
import '../config/api_config.dart';
import 'api_service.dart';

class AuthService {
  final ApiService _apiService;

  AuthService(this._apiService);

  Future<Map<String, dynamic>> signup({
    required String name,
    required String phone,
    required String email,
    required String location,
    required String password,
    String role = 'customer',
  }) async {
    try {
      final response = await _apiService.post(
        ApiConfig.signup,
        data: {
          'name': name,
          'phone': phone,
          'email': email,
          'location': location,
          'password': password,
          'role': role,
        },
      );

      if (response.data['success']) {
        final data = response.data['data'];
        final user = User.fromJson(data['user']);
        final accessToken = data['accessToken'];
        final refreshToken = data['refreshToken'];

        await _apiService.saveTokens(accessToken, refreshToken);

        return {
          'success': true,
          'user': user,
        };
      } else {
        return {
          'success': false,
          'message': response.data['message'],
        };
      }
    } catch (e) {
      return {
        'success': false,
        'message': e.toString(),
      };
    }
  }

  Future<Map<String, dynamic>> login({
    required String email,
    required String password,
  }) async {
    try {
      final response = await _apiService.post(
        ApiConfig.login,
        data: {
          'email': email,
          'password': password,
        },
      );

      if (response.data['success']) {
        final data = response.data['data'];
        final user = User.fromJson(data['user']);
        final accessToken = data['accessToken'];
        final refreshToken = data['refreshToken'];

        await _apiService.saveTokens(accessToken, refreshToken);

        return {
          'success': true,
          'user': user,
        };
      } else {
        return {
          'success': false,
          'message': response.data['message'],
        };
      }
    } catch (e) {
      return {
        'success': false,
        'message': e.toString(),
      };
    }
  }

  Future<void> logout() async {
    try {
      final refreshToken = await _apiService.getRefreshToken();
      if (refreshToken != null) {
        await _apiService.post(
          ApiConfig.logout,
          data: {'refreshToken': refreshToken},
        );
      }
    } catch (e) {
      // Continue with logout even if server request fails
    } finally {
      await _apiService.clearTokens();
    }
  }

  Future<bool> isLoggedIn() async {
    final refreshToken = await _apiService.getRefreshToken();
    return refreshToken != null;
  }

  Future<User?> getCurrentUser() async {
    try {
      final response = await _apiService.get(ApiConfig.me);
      if (response.data['success']) {
        return User.fromJson(response.data['data']);
      }
      return null;
    } catch (e) {
      return null;
    }
  }
}
