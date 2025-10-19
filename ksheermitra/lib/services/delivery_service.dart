import 'api_service.dart';

class DeliveryService {
  final ApiService _apiService;

  DeliveryService(this._apiService);

  /// Get assigned customers with route optimization
  Future<Map<String, dynamic>> getAssignedCustomers({
    String? date,
  }) async {
    try {
      final queryParams = date != null ? '?date=$date' : '';
      final response = await _apiService.get(
        '/api/delivery/assigned-customers$queryParams',
      );

      if (response.data['success']) {
        return {
          'success': true,
          'customers': response.data['data']['customers'] ?? [],
          'route': response.data['data']['route'],
        };
      } else {
        return {
          'success': false,
          'message': response.data['message'] ?? 'Failed to fetch customers',
        };
      }
    } catch (e) {
      return {
        'success': false,
        'message': e.toString(),
      };
    }
  }

  /// Update delivery status
  Future<Map<String, dynamic>> updateDeliveryStatus({
    required String deliveryStatusId,
    required String status, // DELIVERED, MISSED
  }) async {
    try {
      final response = await _apiService.put(
        '/api/delivery/status/$deliveryStatusId',
        data: {
          'status': status,
        },
      );

      if (response.data['success']) {
        return {
          'success': true,
          'message': response.data['message'] ?? 'Status updated successfully',
        };
      } else {
        return {
          'success': false,
          'message': response.data['message'] ?? 'Failed to update status',
        };
      }
    } catch (e) {
      return {
        'success': false,
        'message': e.toString(),
      };
    }
  }

  /// Generate daily invoice (end of day)
  Future<Map<String, dynamic>> generateDailyInvoice({
    String? date,
  }) async {
    try {
      final data = date != null ? {'date': date} : {};
      final response = await _apiService.post(
        '/api/delivery/invoice/daily',
        data: data,
      );

      if (response.data['success']) {
        return {
          'success': true,
          'invoice': response.data['data'],
          'message': response.data['message'] ?? 'Invoice generated successfully',
        };
      } else {
        return {
          'success': false,
          'message': response.data['message'] ?? 'Failed to generate invoice',
        };
      }
    } catch (e) {
      return {
        'success': false,
        'message': e.toString(),
      };
    }
  }

  /// Get delivery statistics
  Future<Map<String, dynamic>> getDeliveryStats() async {
    try {
      final response = await _apiService.get('/api/delivery/stats');

      if (response.data['success']) {
        return {
          'success': true,
          'stats': response.data['data'],
        };
      } else {
        return {
          'success': false,
          'message': response.data['message'] ?? 'Failed to fetch stats',
        };
      }
    } catch (e) {
      return {
        'success': false,
        'message': e.toString(),
      };
    }
  }
}
