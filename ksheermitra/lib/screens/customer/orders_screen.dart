import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../providers/auth_provider.dart';
import '../../models/order_model.dart';
import '../../models/product_model.dart';
import '../../config/api_config.dart';
import '../../providers/api_provider.dart';
import 'package:intl/intl.dart';

final ordersProvider = FutureProvider.autoDispose<List<Order>>((ref) async {
  final apiService = ref.watch(apiServiceProvider);
  final user = ref.watch(authProvider).user;
  
  if (user == null) return [];
  
  final response = await apiService.get(
    ApiConfig.customerOrders(user.id),
  );
  
  if (response.data['success']) {
    return (response.data['data'] as List)
        .map((json) => Order.fromJson(json))
        .toList();
  }
  return [];
});

class OrdersScreen extends ConsumerWidget {
  const OrdersScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final ordersAsync = ref.watch(ordersProvider);

    return Scaffold(
      body: ordersAsync.when(
        data: (orders) {
          if (orders.isEmpty) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(
                    Icons.shopping_cart_outlined,
                    size: 64,
                    color: Theme.of(context).colorScheme.secondary,
                  ),
                  const SizedBox(height: 16),
                  const Text('No orders yet'),
                  const SizedBox(height: 8),
                  const Text('Place your first order'),
                ],
              ),
            );
          }

          return RefreshIndicator(
            onRefresh: () async {
              ref.invalidate(ordersProvider);
            },
            child: ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: orders.length,
              itemBuilder: (context, index) {
                final order = orders[index];
                return Card(
                  margin: const EdgeInsets.only(bottom: 12),
                  child: ListTile(
                    leading: CircleAvatar(
                      child: Text('${order.quantity}'),
                    ),
                    title: Text(order.productName ?? 'Product'),
                    subtitle: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('Quantity: ${order.quantity}'),
                        Text(
                          'Date: ${DateFormat('MMM dd, yyyy').format(order.orderDate)}',
                        ),
                        if (order.unitPrice != null)
                          Text(
                            'Total: ₹${(order.quantity * order.unitPrice!).toStringAsFixed(2)}',
                          ),
                      ],
                    ),
                    trailing: _buildStatusChip(order.status),
                  ),
                );
              },
            ),
          );
        },
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (error, stack) => Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.error_outline, size: 48, color: Colors.red),
              const SizedBox(height: 16),
              Text('Error: $error'),
              const SizedBox(height: 8),
              ElevatedButton(
                onPressed: () => ref.invalidate(ordersProvider),
                child: const Text('Retry'),
              ),
            ],
          ),
        ),
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () {
          _showPlaceOrderDialog(context, ref);
        },
        icon: const Icon(Icons.add),
        label: const Text('Place Order'),
      ),
    );
  }

  Widget _buildStatusChip(String status) {
    Color color;
    switch (status.toLowerCase()) {
      case 'delivered':
        color = Colors.green;
        break;
      case 'cancelled':
        color = Colors.red;
        break;
      default:
        color = Colors.orange;
    }

    return Chip(
      label: Text(
        status.toUpperCase(),
        style: const TextStyle(fontSize: 10),
      ),
      backgroundColor: color.withOpacity(0.2),
    );
  }

  void _showPlaceOrderDialog(BuildContext context, WidgetRef ref) async {
    final apiService = ref.read(apiServiceProvider);
    
    // Fetch products
    List<Product> products = [];
    try {
      final response = await apiService.get(ApiConfig.products);
      if (response.data['success']) {
        products = (response.data['data'] as List)
            .map((json) => Product.fromJson(json))
            .where((p) => p.isActive)
            .toList();
      }
    } catch (e) {
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error loading products: $e')),
        );
      }
      return;
    }

    if (products.isEmpty) {
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('No products available')),
        );
      }
      return;
    }

    Product? selectedProduct = products.first;
    final quantityController = TextEditingController(text: '1');
    DateTime orderDate = DateTime.now();

    if (!context.mounted) return;

    showDialog(
      context: context,
      builder: (dialogContext) => StatefulBuilder(
        builder: (context, setState) => AlertDialog(
          title: const Text('Place One-Time Order'),
          content: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                DropdownButtonFormField<Product>(
                  value: selectedProduct,
                  decoration: const InputDecoration(
                    labelText: 'Select Product',
                    border: OutlineInputBorder(),
                  ),
                  items: products.map((product) {
                    return DropdownMenuItem(
                      value: product,
                      child: Text(product.name),
                    );
                  }).toList(),
                  onChanged: (value) {
                    setState(() {
                      selectedProduct = value;
                    });
                  },
                ),
                const SizedBox(height: 16),
                if (selectedProduct != null) ...[
                  Text('Price: ₹${selectedProduct.unitPrice.toStringAsFixed(2)}/${selectedProduct.unit}'),
                  const SizedBox(height: 16),
                ],
                TextField(
                  controller: quantityController,
                  keyboardType: TextInputType.number,
                  decoration: InputDecoration(
                    labelText: 'Quantity${selectedProduct != null ? ' (${selectedProduct.unit})' : ''}',
                    border: const OutlineInputBorder(),
                  ),
                ),
                const SizedBox(height: 16),
                ListTile(
                  contentPadding: EdgeInsets.zero,
                  title: const Text('Delivery Date'),
                  subtitle: Text(DateFormat('MMM dd, yyyy').format(orderDate)),
                  trailing: const Icon(Icons.calendar_today),
                  onTap: () async {
                    final date = await showDatePicker(
                      context: context,
                      initialDate: orderDate,
                      firstDate: DateTime.now(),
                      lastDate: DateTime.now().add(const Duration(days: 30)),
                    );
                    if (date != null) {
                      setState(() {
                        orderDate = date;
                      });
                    }
                  },
                ),
                if (selectedProduct != null) ...[
                  const SizedBox(height: 16),
                  Text(
                    'Total: ₹${(double.parse(quantityController.text.isEmpty ? '1' : quantityController.text) * selectedProduct.unitPrice).toStringAsFixed(2)}',
                    style: Theme.of(context).textTheme.titleMedium?.copyWith(
                      fontWeight: FontWeight.bold,
                      color: Theme.of(context).primaryColor,
                    ),
                  ),
                  const SizedBox(height: 8),
                  const Text(
                    'Payment: Cash on Delivery',
                    style: TextStyle(fontStyle: FontStyle.italic),
                  ),
                ],
              ],
            ),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(dialogContext),
              child: const Text('Cancel'),
            ),
            ElevatedButton(
              onPressed: () async {
                if (selectedProduct == null) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Please select a product')),
                  );
                  return;
                }

                final quantity = int.tryParse(quantityController.text);
                if (quantity == null || quantity <= 0) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Please enter a valid quantity')),
                  );
                  return;
                }

                Navigator.pop(dialogContext);
                await _placeOrder(
                  context,
                  ref,
                  selectedProduct.id,
                  quantity,
                  orderDate,
                );
              },
              child: const Text('Place Order'),
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _placeOrder(
    BuildContext context,
    WidgetRef ref,
    String productId,
    int quantity,
    DateTime orderDate,
  ) async {
    final apiService = ref.read(apiServiceProvider);
    final user = ref.read(authProvider).user;

    if (user == null) return;

    try {
      final response = await apiService.post(
        ApiConfig.orders,
        data: {
          'customer_id': user.id,
          'product_id': productId,
          'quantity': quantity,
          'order_date': orderDate.toIso8601String().split('T')[0],
        },
      );

      if (response.data['success']) {
        ref.invalidate(ordersProvider);
        if (context.mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Order placed successfully! Payment on delivery.'),
              duration: Duration(seconds: 3),
            ),
          );
        }
      } else {
        if (context.mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text('Error: ${response.data['message']}')),
          );
        }
      }
    } catch (e) {
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error placing order: $e')),
        );
      }
    }
  }
}
