import 'package:dio/dio.dart';
import '../config/api_config.dart';
import 'api_service.dart';

class WhatsAppAuthService {
  final ApiService _apiService;

  WhatsAppAuthService(this._apiService);

  /// Send OTP to WhatsApp number
  Future<Map<String, dynamic>> sendOtp(String whatsappNumber) async {
    try {
      final response = await _apiService.post(
        '/auth/whatsapp/send-otp',
        data: {'whatsapp_number': whatsappNumber},
      );
      return response.data['data'];
    } catch (e) {
      throw _handleError(e);
    }
  }

  /// Verify OTP
  Future<Map<String, dynamic>> verifyOtp(String whatsappNumber, String otpCode) async {
    try {
      final response = await _apiService.post(
        '/auth/whatsapp/verify-otp',
        data: {
          'whatsapp_number': whatsappNumber,
          'otp_code': otpCode,
        },
      );
      return response.data['data'];
    } catch (e) {
      throw _handleError(e);
    }
  }

  /// Complete WhatsApp signup
  Future<Map<String, dynamic>> completeSignup({
    required String name,
    required String whatsappNumber,
    String? phone,
    required double latitude,
    required double longitude,
    String? addressManual,
  }) async {
    try {
      final response = await _apiService.post(
        '/auth/whatsapp/complete-signup',
        data: {
          'name': name,
          'whatsapp_number': whatsappNumber,
          'phone': phone,
          'latitude': latitude,
          'longitude': longitude,
          'address_manual': addressManual,
        },
      );
      return response.data['data'];
    } catch (e) {
      throw _handleError(e);
    }
  }

  String _handleError(dynamic error) {
    if (error is DioException) {
      if (error.response?.data != null && error.response?.data['message'] != null) {
        return error.response!.data['message'];
      }
      return error.message ?? 'Network error occurred';
    }
    return error.toString();
  }
}
