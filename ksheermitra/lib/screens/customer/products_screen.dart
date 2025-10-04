import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../providers/auth_provider.dart';
import '../../models/product_model.dart';
import '../../config/api_config.dart';
import '../../providers/api_provider.dart';
import 'package:intl/intl.dart';

final productsProvider = FutureProvider.autoDispose<List<Product>>((ref) async {
  final apiService = ref.watch(apiServiceProvider);
  
  final response = await apiService.get(ApiConfig.products);
  
  if (response.data['success']) {
    final data = response.data['data'];
    // Handle both array and object with products field
    if (data is List) {
      return data.map((json) => Product.fromJson(json)).toList();
    } else if (data is Map && data['products'] != null) {
      return (data['products'] as List)
          .map((json) => Product.fromJson(json))
          .toList();
    }
  }
  return [];
});

class ProductsScreen extends ConsumerWidget {
  const ProductsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final productsAsync = ref.watch(productsProvider);

    return Scaffold(
      body: productsAsync.when(
        data: (products) {
          if (products.isEmpty) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(
                    Icons.inventory_outlined,
                    size: 64,
                    color: Theme.of(context).colorScheme.secondary,
                  ),
                  const SizedBox(height: 16),
                  const Text('No products available'),
                ],
              ),
            );
          }

          return RefreshIndicator(
            onRefresh: () async {
              ref.invalidate(productsProvider);
            },
            child: GridView.builder(
              padding: const EdgeInsets.all(16),
              physics: const BouncingScrollPhysics(),
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 2,
                childAspectRatio: 0.7,
                crossAxisSpacing: 12,
                mainAxisSpacing: 12,
              ),
              itemCount: products.where((p) => p.isActive).length,
              itemBuilder: (context, index) {
                final activeProducts = products.where((p) => p.isActive).toList();
                final product = activeProducts[index];
                
                return Card(
                  clipBehavior: Clip.antiAlias,
                  child: InkWell(
                    onTap: () {
                      _showProductDetails(context, ref, product);
                    },
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Expanded(
                          flex: 3,
                          child: product.imageUrl != null
                              ? Image.network(
                                  '${ApiConfig.baseUrl}${product.imageUrl}',
                                  width: double.infinity,
                                  fit: BoxFit.cover,
                                  errorBuilder: (context, error, stackTrace) {
                                    return Container(
                                      color: Colors.grey[200],
                                      child: const Icon(
                                        Icons.image_not_supported,
                                        size: 48,
                                        color: Colors.grey,
                                      ),
                                    );
                                  },
                                )
                              : Container(
                                  color: Colors.grey[200],
                                  child: const Icon(
                                    Icons.local_drink,
                                    size: 48,
                                    color: Colors.grey,
                                  ),
                                ),
                        ),
                        Flexible(
                          flex: 2,
                          child: Padding(
                            padding: const EdgeInsets.all(8.0),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Flexible(
                                  child: Text(
                                    product.name,
                                    style: Theme.of(context).textTheme.titleMedium,
                                    maxLines: 1,
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                ),
                                const SizedBox(height: 4),
                                Text(
                                  '₹${product.unitPrice.toStringAsFixed(2)}/${product.unit}',
                                  style: Theme.of(context).textTheme.titleSmall?.copyWith(
                                    fontWeight: FontWeight.bold,
                                    color: Theme.of(context).primaryColor,
                                  ),
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                ),
                                const SizedBox(height: 8),
                                Row(
                                  children: [
                                    Expanded(
                                      child: OutlinedButton(
                                        onPressed: () {
                                          _showOrderDialog(context, ref, product);
                                        },
                                        style: OutlinedButton.styleFrom(
                                          padding: const EdgeInsets.symmetric(vertical: 4, horizontal: 4),
                                        ),
                                        child: const Text('Order', style: TextStyle(fontSize: 12)),
                                      ),
                                    ),
                                    const SizedBox(width: 4),
                                    Expanded(
                                      child: ElevatedButton(
                                        onPressed: () {
                                          _showAddToCartDialog(context, ref, product);
                                        },
                                        style: ElevatedButton.styleFrom(
                                          padding: const EdgeInsets.symmetric(vertical: 4, horizontal: 4),
                                        ),
                                        child: const Text('Cart', style: TextStyle(fontSize: 12)),
                                      ),
                                    ),
                                  ],
                                ),
                              ],
                            ),
                          ),
                        ),
                      ],
                    ),
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
                onPressed: () => ref.invalidate(productsProvider),
                child: const Text('Retry'),
              ),
            ],
          ),
        ),
      ),
    );
  }

  void _showProductDetails(BuildContext context, WidgetRef ref, Product product) {
    showDialog(
      context: context,
      builder: (dialogContext) => AlertDialog(
        title: Text(product.name),
        content: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              if (product.imageUrl != null)
                ClipRRect(
                  borderRadius: BorderRadius.circular(8),
                  child: Image.network(
                    '${ApiConfig.baseUrl}${product.imageUrl}',
                    width: double.infinity,
                    height: 200,
                    fit: BoxFit.cover,
                    errorBuilder: (context, error, stackTrace) {
                      return Container(
                        height: 200,
                        color: Colors.grey[200],
                        child: const Icon(Icons.image_not_supported, size: 48),
                      );
                    },
                  ),
                ),
              const SizedBox(height: 16),
              Text(
                'Price: ₹${product.unitPrice.toStringAsFixed(2)}/${product.unit}',
                style: Theme.of(context).textTheme.titleMedium?.copyWith(
                  fontWeight: FontWeight.bold,
                ),
              ),
              if (product.description != null && product.description!.isNotEmpty) ...[
                const SizedBox(height: 8),
                Text(product.description!),
              ],
              if (product.category != null && product.category!.isNotEmpty) ...[
                const SizedBox(height: 8),
                Chip(label: Text(product.category!)),
              ],
            ],
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(dialogContext),
            child: const Text('Close'),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(dialogContext);
              _showSubscribeDialog(context, ref, product);
            },
            child: const Text('Subscribe'),
          ),
        ],
      ),
    );
  }

  void _showSubscribeDialog(BuildContext context, WidgetRef ref, Product product) {
    final quantityController = TextEditingController(text: '1');
    DateTime startDate = DateTime.now();
    DateTime? endDate;
    
    showDialog(
      context: context,
      builder: (dialogContext) => StatefulBuilder(
        builder: (context, setState) => AlertDialog(
          title: Text('Subscribe to ${product.name}'),
          content: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Price: ₹${product.unitPrice.toStringAsFixed(2)}/${product.unit}'),
                const SizedBox(height: 16),
                TextField(
                  controller: quantityController,
                  keyboardType: TextInputType.number,
                  decoration: InputDecoration(
                    labelText: 'Daily Quantity (${product.unit})',
                    border: const OutlineInputBorder(),
                  ),
                ),
                const SizedBox(height: 16),
                ListTile(
                  contentPadding: EdgeInsets.zero,
                  title: const Text('Start Date'),
                  subtitle: Text(DateFormat('MMM dd, yyyy').format(startDate)),
                  trailing: const Icon(Icons.calendar_today),
                  onTap: () async {
                    final date = await showDatePicker(
                      context: context,
                      initialDate: startDate,
                      firstDate: DateTime.now(),
                      lastDate: DateTime.now().add(const Duration(days: 365)),
                    );
                    if (date != null) {
                      setState(() {
                        startDate = date;
                      });
                    }
                  },
                ),
                ListTile(
                  contentPadding: EdgeInsets.zero,
                  title: const Text('End Date (Optional)'),
                  subtitle: Text(
                    endDate == null
                        ? 'No end date'
                        : DateFormat('MMM dd, yyyy').format(endDate!),
                  ),
                  trailing: const Icon(Icons.calendar_today),
                  onTap: () async {
                    final date = await showDatePicker(
                      context: context,
                      initialDate: endDate ?? startDate.add(const Duration(days: 30)),
                      firstDate: startDate,
                      lastDate: DateTime.now().add(const Duration(days: 365)),
                    );
                    setState(() {
                      endDate = date;
                    });
                  },
                ),
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
                final quantity = int.tryParse(quantityController.text);
                if (quantity == null || quantity <= 0) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Please enter a valid quantity')),
                  );
                  return;
                }
                
                Navigator.pop(dialogContext);
                await _createSubscription(context, ref, product, quantity, startDate, endDate);
              },
              child: const Text('Subscribe'),
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _createSubscription(
    BuildContext context,
    WidgetRef ref,
    Product product,
    int quantity,
    DateTime startDate,
    DateTime? endDate,
  ) async {
    final apiService = ref.read(apiServiceProvider);
    final user = ref.read(authProvider).user;

    if (user == null) return;

    try {
      final response = await apiService.post(
        ApiConfig.subscriptions,
        data: {
          'customer_id': user.id,
          'product_id': product.id,
          'quantity_per_day': quantity,
          'start_date': startDate.toIso8601String(),
          'end_date': endDate?.toIso8601String(),
        },
      );

      if (response.data['success']) {
        if (context.mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Subscription created successfully!')),
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
          SnackBar(content: Text('Error creating subscription: $e')),
        );
      }
    }
  }

  void _showOrderDialog(BuildContext context, WidgetRef ref, Product product) {
    final quantityController = TextEditingController(text: '1');
    DateTime orderDate = DateTime.now();
    
    showDialog(
      context: context,
      builder: (dialogContext) => StatefulBuilder(
        builder: (context, setState) => AlertDialog(
          title: Text('Order ${product.name}'),
          content: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Price: ₹${product.unitPrice.toStringAsFixed(2)}/${product.unit}'),
                const SizedBox(height: 16),
                TextField(
                  controller: quantityController,
                  keyboardType: TextInputType.number,
                  decoration: InputDecoration(
                    labelText: 'Quantity (${product.unit})',
                    border: const OutlineInputBorder(),
                  ),
                ),
                const SizedBox(height: 16),
                ListTile(
                  contentPadding: EdgeInsets.zero,
                  title: const Text('Order Date'),
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
                final quantity = int.tryParse(quantityController.text);
                if (quantity == null || quantity <= 0) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Please enter a valid quantity')),
                  );
                  return;
                }
                
                Navigator.pop(dialogContext);
                await _createOrder(context, ref, product, quantity, orderDate);
              },
              child: const Text('Order Now'),
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _createOrder(
    BuildContext context,
    WidgetRef ref,
    Product product,
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
          'product_id': product.id,
          'quantity': quantity,
          'order_date': orderDate.toIso8601String().split('T')[0],
        },
      );

      if (response.data['success']) {
        if (context.mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Order placed successfully!')),
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
          SnackBar(content: Text('Error creating order: $e')),
        );
      }
    }
  }

  void _showAddToCartDialog(BuildContext context, WidgetRef ref, Product product) {
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Add to Cart feature - Coming soon!'),
        duration: Duration(seconds: 2),
      ),
    );
    // TODO: Implement cart functionality when cart feature is available
  }
}
