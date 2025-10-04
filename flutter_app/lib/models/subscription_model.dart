class Subscription {
  final String id;
  final String customerId;
  final String productId;
  final int quantityPerDay;
  final DateTime startDate;
  final DateTime? endDate;
  final bool isActive;
  final DateTime createdAt;
  final DateTime updatedAt;
  final String? productName;
  final double? unitPrice;

  Subscription({
    required this.id,
    required this.customerId,
    required this.productId,
    required this.quantityPerDay,
    required this.startDate,
    this.endDate,
    required this.isActive,
    required this.createdAt,
    required this.updatedAt,
    this.productName,
    this.unitPrice,
  });

  factory Subscription.fromJson(Map<String, dynamic> json) {
    return Subscription(
      id: json['id'],
      customerId: json['customer_id'],
      productId: json['product_id'],
      quantityPerDay: json['quantity_per_day'],
      startDate: DateTime.parse(json['start_date']),
      endDate: json['end_date'] != null ? DateTime.parse(json['end_date']) : null,
      isActive: json['is_active'],
      createdAt: DateTime.parse(json['created_at']),
      updatedAt: DateTime.parse(json['updated_at']),
      productName: json['product_name'],
      unitPrice: json['unit_price'] != null
          ? double.parse(json['unit_price'].toString())
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'customer_id': customerId,
      'product_id': productId,
      'quantity_per_day': quantityPerDay,
      'start_date': startDate.toIso8601String(),
      'end_date': endDate?.toIso8601String(),
      'is_active': isActive,
      'created_at': createdAt.toIso8601String(),
      'updated_at': updatedAt.toIso8601String(),
      'product_name': productName,
      'unit_price': unitPrice,
    };
  }
}
