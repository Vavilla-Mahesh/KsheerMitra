import 'package:dio/dio.dart';
import '../models/delivery_area_model.dart';
import 'api_service.dart';

class DeliveryManagementService {
  final ApiService _apiService;

  DeliveryManagementService(this._apiService);

  // Delivery Areas
  Future<List<DeliveryArea>> getDeliveryAreas() async {
    try {
      final response = await _apiService.get('/delivery-management/areas');
      final List<dynamic> data = response.data['data'];
      return data.map((json) => DeliveryArea.fromJson(json)).toList();
    } catch (e) {
      throw _handleError(e);
    }
  }

  Future<DeliveryArea> createDeliveryArea({
    required String name,
    String? description,
    String? deliveryBoyId,
    required List<LatLng> polygonCoordinates,
  }) async {
    try {
      final response = await _apiService.post(
        '/delivery-management/areas',
        data: {
          'name': name,
          'description': description,
          'delivery_boy_id': deliveryBoyId,
          'polygon_coordinates': polygonCoordinates.map((c) => c.toJson()).toList(),
        },
      );
      return DeliveryArea.fromJson(response.data['data']);
    } catch (e) {
      throw _handleError(e);
    }
  }

  Future<void> assignCustomersToArea(String areaId, List<String> customerIds) async {
    try {
      await _apiService.post(
        '/delivery-management/areas/$areaId/assign-customers',
        data: {'customer_ids': customerIds},
      );
    } catch (e) {
      throw _handleError(e);
    }
  }

  Future<List<Map<String, dynamic>>> getCustomersInArea(String areaId) async {
    try {
      final response = await _apiService.get('/delivery-management/areas/$areaId/customers');
      return List<Map<String, dynamic>>.from(response.data['data']);
    } catch (e) {
      throw _handleError(e);
    }
  }

  Future<List<Map<String, dynamic>>> getCustomersWithLocation() async {
    try {
      final response = await _apiService.get('/delivery-management/customers/locations');
      return List<Map<String, dynamic>>.from(response.data['data']);
    } catch (e) {
      throw _handleError(e);
    }
  }

  // Routes
  Future<Map<String, dynamic>> generateOptimizedRoute({
    required String deliveryBoyId,
    required DateTime routeDate,
    required LatLng deliveryBoyLocation,
    String? areaId,
  }) async {
    try {
      final response = await _apiService.post(
        '/delivery-management/routes/generate',
        data: {
          'delivery_boy_id': deliveryBoyId,
          'route_date': routeDate.toIso8601String().split('T')[0],
          'delivery_boy_location': deliveryBoyLocation.toJson(),
          'area_id': areaId,
        },
      );
      return response.data['data'];
    } catch (e) {
      throw _handleError(e);
    }
  }

  Future<List<DeliveryRoute>> getDeliveryBoyRoutes(
    String deliveryBoyId, {
    String? routeDate,
  }) async {
    try {
      final queryParams = routeDate != null ? '?route_date=$routeDate' : '';
      final response = await _apiService.get(
        '/delivery-management/routes/delivery-boy/$deliveryBoyId$queryParams',
      );
      final List<dynamic> data = response.data['data'];
      return data.map((json) => DeliveryRoute.fromJson(json)).toList();
    } catch (e) {
      throw _handleError(e);
    }
  }

  Future<Map<String, dynamic>> getRouteDetails(String routeId) async {
    try {
      final response = await _apiService.get('/delivery-management/routes/$routeId');
      return response.data['data'];
    } catch (e) {
      throw _handleError(e);
    }
  }

  Future<void> updateRouteStatus(String routeId, String status) async {
    try {
      await _apiService.put(
        '/delivery-management/routes/$routeId/status',
        data: {'status': status},
      );
    } catch (e) {
      throw _handleError(e);
    }
  }

  Future<void> updateDeliveryLog(String logId, String status, {String? notes}) async {
    try {
      await _apiService.put(
        '/delivery-management/logs/$logId',
        data: {
          'status': status,
          'notes': notes,
        },
      );
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
