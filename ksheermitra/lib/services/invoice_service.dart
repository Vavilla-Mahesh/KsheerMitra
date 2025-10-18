import 'api_service.dart';

class InvoiceService {
  final ApiService _apiService;

  InvoiceService(this._apiService);

  /// Generate monthly invoice for a customer
  Future<Map<String, dynamic>> generateMonthlyInvoice({
    required String customerId,
    int? month,
    int? year,
  }) async {
    try {
      final data = <String, dynamic>{};
      if (month != null) data['month'] = month;
      if (year != null) data['year'] = year;

      final response = await _apiService.post(
        '/api/invoice/monthly/$customerId',
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

  /// Get invoices for a customer
  Future<Map<String, dynamic>> getCustomerInvoices({
    required String customerId,
    String? type, // DAILY, MONTHLY
    String? startDate,
    String? endDate,
  }) async {
    try {
      final queryParams = <String>[];
      if (type != null) queryParams.add('type=$type');
      if (startDate != null) queryParams.add('startDate=$startDate');
      if (endDate != null) queryParams.add('endDate=$endDate');

      final queryString = queryParams.isNotEmpty ? '?${queryParams.join('&')}' : '';
      final response = await _apiService.get(
        '/api/invoice/customer/$customerId$queryString',
      );

      if (response.data['success']) {
        return {
          'success': true,
          'invoices': response.data['data'] ?? [],
        };
      } else {
        return {
          'success': false,
          'message': response.data['message'] ?? 'Failed to fetch invoices',
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
