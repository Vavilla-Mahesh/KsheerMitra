class Order {
  final String id;
  final String customerId;
  final String productId;
  final int quantity;
  final DateTime orderDate;
  final String status;
  final DateTime createdAt;
  final DateTime updatedAt;
  final String? productName;
  final double? unitPrice;

  Order({
    required this.id,
    required this.customerId,
    required this.productId,
    required this.quantity,
    required this.orderDate,
    required this.status,
    required this.createdAt,
    required this.updatedAt,
    this.productName,
    this.unitPrice,
  });

  factory Order.fromJson(Map<String, dynamic> json) {
    return Order(
      id: json['id'],
      customerId: json['customer_id'],
      productId: json['product_id'],
      quantity: json['quantity'],
      orderDate: DateTime.parse(json['order_date']),
      status: json['status'],
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
      'quantity': quantity,
      'order_date': orderDate.toIso8601String(),
      'status': status,
      'created_at': createdAt.toIso8601String(),
      'updated_at': updatedAt.toIso8601String(),
      'product_name': productName,
      'unit_price': unitPrice,
    };
  }
}
