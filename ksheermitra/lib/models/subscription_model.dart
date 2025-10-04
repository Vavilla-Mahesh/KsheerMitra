class SubscriptionItem {
  final String? id;
  final String productId;
  final String? productName;
  final String? unit;
  final int quantity;
  final double pricePerUnit;

  SubscriptionItem({
    this.id,
    required this.productId,
    this.productName,
    this.unit,
    required this.quantity,
    required this.pricePerUnit,
  });

  factory SubscriptionItem.fromJson(Map<String, dynamic> json) {
    return SubscriptionItem(
      id: json['id'],
      productId: json['product_id'],
      productName: json['product_name'],
      unit: json['unit'],
      quantity: json['quantity'],
      pricePerUnit: double.parse(json['price_per_unit'].toString()),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'product_id': productId,
      'quantity': quantity,
    };
  }
}

class Subscription {
  final String id;
  final String customerId;
  final String? productId; // Nullable for multi-product subscriptions
  final int? quantityPerDay; // Nullable for multi-product subscriptions
  final DateTime startDate;
  final DateTime? endDate;
  final bool isActive;
  final DateTime createdAt;
  final DateTime updatedAt;
  final String? productName;
  final double? unitPrice;
  final String? scheduleType;
  final List<String>? daysOfWeek;
  final List<SubscriptionItem>? items; // For multi-product subscriptions

  Subscription({
    required this.id,
    required this.customerId,
    this.productId,
    this.quantityPerDay,
    required this.startDate,
    this.endDate,
    required this.isActive,
    required this.createdAt,
    required this.updatedAt,
    this.productName,
    this.unitPrice,
    this.scheduleType,
    this.daysOfWeek,
    this.items,
  });

  bool get isMultiProduct => items != null && items!.isNotEmpty;

  factory Subscription.fromJson(Map<String, dynamic> json) {
    List<SubscriptionItem>? items;
    if (json['items'] != null && json['items'] is List) {
      items = (json['items'] as List)
          .map((item) => SubscriptionItem.fromJson(item))
          .toList();
    }

    List<String>? daysOfWeek;
    if (json['days_of_week'] != null) {
      if (json['days_of_week'] is String) {
        // Parse JSON string to list
        try {
          final parsed = json['days_of_week'] as String;
          if (parsed.isNotEmpty && parsed != 'null') {
            daysOfWeek = parsed
                .replaceAll('[', '')
                .replaceAll(']', '')
                .replaceAll('"', '')
                .split(',')
                .map((e) => e.trim())
                .where((e) => e.isNotEmpty)
                .toList();
          }
        } catch (e) {
          daysOfWeek = null;
        }
      } else if (json['days_of_week'] is List) {
        daysOfWeek = (json['days_of_week'] as List).cast<String>();
      }
    }

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
      scheduleType: json['schedule_type'],
      daysOfWeek: daysOfWeek,
      items: items,
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
      'schedule_type': scheduleType,
      'days_of_week': daysOfWeek,
      'items': items?.map((item) => item.toJson()).toList(),
    };
  }
}
