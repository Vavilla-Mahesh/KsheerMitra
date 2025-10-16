class DeliveryArea {
  final String id;
  final String name;
  final String? description;
  final String? deliveryBoyId;
  final List<LatLng> polygonCoordinates;
  final bool isActive;
  final DateTime createdAt;
  final DateTime updatedAt;

  DeliveryArea({
    required this.id,
    required this.name,
    this.description,
    this.deliveryBoyId,
    required this.polygonCoordinates,
    required this.isActive,
    required this.createdAt,
    required this.updatedAt,
  });

  factory DeliveryArea.fromJson(Map<String, dynamic> json) {
    List<LatLng> coordinates = [];
    if (json['polygon_coordinates'] is String) {
      // Parse JSON string
      final List<dynamic> coordList = 
          json['polygon_coordinates'] != null 
              ? List<dynamic>.from(
                  (json['polygon_coordinates'] as String).isNotEmpty
                      ? const [] 
                      : []
                )
              : [];
      coordinates = coordList.map((c) => 
        LatLng(c['lat'] as double, c['lng'] as double)
      ).toList();
    } else if (json['polygon_coordinates'] is List) {
      coordinates = (json['polygon_coordinates'] as List).map((c) => 
        LatLng(c['lat'] as double, c['lng'] as double)
      ).toList();
    }

    return DeliveryArea(
      id: json['id'],
      name: json['name'],
      description: json['description'],
      deliveryBoyId: json['delivery_boy_id'],
      polygonCoordinates: coordinates,
      isActive: json['is_active'] ?? true,
      createdAt: DateTime.parse(json['created_at']),
      updatedAt: DateTime.parse(json['updated_at']),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'description': description,
      'delivery_boy_id': deliveryBoyId,
      'polygon_coordinates': polygonCoordinates.map((c) => {
        'lat': c.latitude,
        'lng': c.longitude,
      }).toList(),
      'is_active': isActive,
      'created_at': createdAt.toIso8601String(),
      'updated_at': updatedAt.toIso8601String(),
    };
  }
}

class LatLng {
  final double latitude;
  final double longitude;

  LatLng(this.latitude, this.longitude);

  Map<String, dynamic> toJson() {
    return {
      'lat': latitude,
      'lng': longitude,
    };
  }
}

class DeliveryRoute {
  final String id;
  final String deliveryBoyId;
  final DateTime routeDate;
  final List<String> customerIds;
  final Map<String, dynamic>? routeData;
  final int? totalDistance;
  final int? estimatedDuration;
  final String status;
  final DateTime? startedAt;
  final DateTime? completedAt;
  final DateTime createdAt;
  final DateTime updatedAt;

  DeliveryRoute({
    required this.id,
    required this.deliveryBoyId,
    required this.routeDate,
    required this.customerIds,
    this.routeData,
    this.totalDistance,
    this.estimatedDuration,
    required this.status,
    this.startedAt,
    this.completedAt,
    required this.createdAt,
    required this.updatedAt,
  });

  factory DeliveryRoute.fromJson(Map<String, dynamic> json) {
    List<String> customerIds = [];
    if (json['customer_ids'] is String) {
      // Parse JSON string if needed
      customerIds = List<String>.from(
        json['customer_ids'] != null && (json['customer_ids'] as String).isNotEmpty
            ? []
            : []
      );
    } else if (json['customer_ids'] is List) {
      customerIds = List<String>.from(json['customer_ids']);
    }

    return DeliveryRoute(
      id: json['id'],
      deliveryBoyId: json['delivery_boy_id'],
      routeDate: DateTime.parse(json['route_date']),
      customerIds: customerIds,
      routeData: json['route_data'],
      totalDistance: json['total_distance'],
      estimatedDuration: json['estimated_duration'],
      status: json['status'],
      startedAt: json['started_at'] != null ? DateTime.parse(json['started_at']) : null,
      completedAt: json['completed_at'] != null ? DateTime.parse(json['completed_at']) : null,
      createdAt: DateTime.parse(json['created_at']),
      updatedAt: DateTime.parse(json['updated_at']),
    );
  }

  String getFormattedDistance() {
    if (totalDistance == null) return 'N/A';
    if (totalDistance! < 1000) {
      return '${totalDistance}m';
    }
    return '${(totalDistance! / 1000).toStringAsFixed(1)}km';
  }

  String getFormattedDuration() {
    if (estimatedDuration == null) return 'N/A';
    final hours = estimatedDuration! ~/ 3600;
    final minutes = (estimatedDuration! % 3600) ~/ 60;
    
    if (hours > 0) {
      return '${hours}h ${minutes}m';
    }
    return '${minutes}m';
  }
}

class DeliveryLog {
  final String id;
  final String routeId;
  final String customerId;
  final String? customerName;
  final String? whatsappNumber;
  final double? latitude;
  final double? longitude;
  final int deliveryOrder;
  final String status;
  final DateTime? completedAt;
  final String? notes;
  final DateTime createdAt;
  final DateTime updatedAt;

  DeliveryLog({
    required this.id,
    required this.routeId,
    required this.customerId,
    this.customerName,
    this.whatsappNumber,
    this.latitude,
    this.longitude,
    required this.deliveryOrder,
    required this.status,
    this.completedAt,
    this.notes,
    required this.createdAt,
    required this.updatedAt,
  });

  factory DeliveryLog.fromJson(Map<String, dynamic> json) {
    return DeliveryLog(
      id: json['id'],
      routeId: json['route_id'],
      customerId: json['customer_id'],
      customerName: json['customer_name'],
      whatsappNumber: json['whatsapp_number'],
      latitude: json['latitude']?.toDouble(),
      longitude: json['longitude']?.toDouble(),
      deliveryOrder: json['delivery_order'],
      status: json['status'],
      completedAt: json['completed_at'] != null ? DateTime.parse(json['completed_at']) : null,
      notes: json['notes'],
      createdAt: DateTime.parse(json['created_at']),
      updatedAt: DateTime.parse(json['updated_at']),
    );
  }
}
