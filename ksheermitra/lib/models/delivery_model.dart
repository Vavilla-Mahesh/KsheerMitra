class Delivery {
  final String id;
  final String customerId;
  final String? deliveryBoyId;
  final DateTime deliveryDate;
  final String status;
  final String? notes;
  final DateTime createdAt;
  final DateTime updatedAt;
  final String? customerName;
  final String? customerLocation;
  final String? deliveryBoyName;

  Delivery({
    required this.id,
    required this.customerId,
    this.deliveryBoyId,
    required this.deliveryDate,
    required this.status,
    this.notes,
    required this.createdAt,
    required this.updatedAt,
    this.customerName,
    this.customerLocation,
    this.deliveryBoyName,
  });

  factory Delivery.fromJson(Map<String, dynamic> json) {
    return Delivery(
      id: json['id'],
      customerId: json['customer_id'],
      deliveryBoyId: json['delivery_boy_id'],
      deliveryDate: DateTime.parse(json['delivery_date']),
      status: json['status'],
      notes: json['notes'],
      createdAt: DateTime.parse(json['created_at']),
      updatedAt: DateTime.parse(json['updated_at']),
      customerName: json['customer_name'],
      customerLocation: json['customer_location'],
      deliveryBoyName: json['delivery_boy_name'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'customer_id': customerId,
      'delivery_boy_id': deliveryBoyId,
      'delivery_date': deliveryDate.toIso8601String(),
      'status': status,
      'notes': notes,
      'created_at': createdAt.toIso8601String(),
      'updated_at': updatedAt.toIso8601String(),
      'customer_name': customerName,
      'customer_location': customerLocation,
      'delivery_boy_name': deliveryBoyName,
    };
  }
}
