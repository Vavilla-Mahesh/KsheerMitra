class BillingItem {
  final String productId;
  final String productName;
  final double unitPrice;
  final int quantity;
  final double lineTotal;

  BillingItem({
    required this.productId,
    required this.productName,
    required this.unitPrice,
    required this.quantity,
    required this.lineTotal,
  });

  factory BillingItem.fromJson(Map<String, dynamic> json) {
    return BillingItem(
      productId: json['product_id'],
      productName: json['product_name'],
      unitPrice: double.parse(json['unit_price'].toString()),
      quantity: json['quantity'],
      lineTotal: double.parse(json['line_total'].toString()),
    );
  }
}

class DailyBilling {
  final String date;
  final List<BillingItem> items;
  final double dayTotal;

  DailyBilling({
    required this.date,
    required this.items,
    required this.dayTotal,
  });

  factory DailyBilling.fromJson(Map<String, dynamic> json) {
    return DailyBilling(
      date: json['date'],
      items: (json['items'] as List)
          .map((item) => BillingItem.fromJson(item))
          .toList(),
      dayTotal: double.parse(json['day_total'].toString()),
    );
  }
}

class MonthlyBilling {
  final String customerId;
  final String customerName;
  final String month;
  final List<DailyBilling> dailyBreakdown;
  final double monthTotal;

  MonthlyBilling({
    required this.customerId,
    required this.customerName,
    required this.month,
    required this.dailyBreakdown,
    required this.monthTotal,
  });

  factory MonthlyBilling.fromJson(Map<String, dynamic> json) {
    return MonthlyBilling(
      customerId: json['customer_id'],
      customerName: json['customer_name'],
      month: json['month'],
      dailyBreakdown: (json['daily_breakdown'] as List)
          .map((day) => DailyBilling.fromJson(day))
          .toList(),
      monthTotal: double.parse(json['month_total'].toString()),
    );
  }
}
