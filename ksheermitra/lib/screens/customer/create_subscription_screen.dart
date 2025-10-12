import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import '../../models/product_model.dart';
import '../../models/subscription_model.dart';
import '../../providers/auth_provider.dart';
import '../../providers/api_provider.dart';
import '../../config/api_config.dart';
import '../../config/theme_config.dart';

// Helper function to format date as YYYY-MM-DD in local timezone
String _formatDateForApi(DateTime date) {
  return DateFormat('yyyy-MM-dd').format(date);
}

final createSubProductsProvider = FutureProvider.autoDispose<List<Product>>((ref) async {
  final apiService = ref.watch(apiServiceProvider);
  
  final response = await apiService.get(ApiConfig.products);
  
  if (response.data['success']) {
    final data = response.data['data'];
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

class CreateSubscriptionScreen extends ConsumerStatefulWidget {
  const CreateSubscriptionScreen({super.key});

  @override
  ConsumerState<CreateSubscriptionScreen> createState() => _CreateSubscriptionScreenState();
}

class _CreateSubscriptionScreenState extends ConsumerState<CreateSubscriptionScreen> {
  final List<SubscriptionItem> selectedItems = [];
  DateTime startDate = DateTime.now();
  DateTime? endDate;
  String scheduleType = 'daily';
  List<String> selectedDays = [];
  bool isLoading = false;

  final List<String> weekDays = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday',
  ];

  @override
  Widget build(BuildContext context) {
    final productsAsync = ref.watch(createSubProductsProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Create Subscription'),
      ),
      body: GradientBackground(
        child: productsAsync.when(
          data: (products) {
            final activeProducts = products.where((p) => p.isActive).toList();

            return Column(
              children: [
                Expanded(
                  child: SingleChildScrollView(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Selected Products',
                          style: Theme.of(context).textTheme.titleLarge,
                        ),
                        const SizedBox(height: 8),
                        if (selectedItems.isEmpty)
                          Card(
                            child: Padding(
                              padding: const EdgeInsets.all(16),
                              child: Text(
                                'No products selected. Add products from the list below.',
                                style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                                      color: Colors.grey[600],
                                    ),
                              ),
                            ),
                          )
                        else
                          ...selectedItems.map((item) {
                            final product = activeProducts.firstWhere(
                              (p) => p.id == item.productId,
                            );
                            return Card(
                              margin: const EdgeInsets.only(bottom: 8),
                              child: ListTile(
                                leading: CircleAvatar(
                                  child: Text('${item.quantity}'),
                                ),
                                title: Text(product.name),
                                subtitle: Text(
                                  '₹${product.unitPrice.toStringAsFixed(2)}/${product.unit} × ${item.quantity}',
                                ),
                                trailing: Row(
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    Text(
                                      '₹${(product.unitPrice * item.quantity).toStringAsFixed(2)}',
                                      style: Theme.of(context).textTheme.titleMedium?.copyWith(
                                            fontWeight: FontWeight.bold,
                                          ),
                                    ),
                                    const SizedBox(width: 8),
                                    IconButton(
                                      icon: const Icon(Icons.edit),
                                      onPressed: () => _editItem(product, item),
                                    ),
                                    IconButton(
                                      icon: const Icon(Icons.delete),
                                      onPressed: () {
                                        setState(() {
                                          selectedItems.remove(item);
                                        });
                                      },
                                    ),
                                  ],
                                ),
                              ),
                            );
                          }),
                        const SizedBox(height: 24),
                        Text(
                          'Schedule',
                          style: Theme.of(context).textTheme.titleLarge,
                        ),
                        const SizedBox(height: 8),
                        Card(
                          child: Padding(
                            padding: const EdgeInsets.all(16),
                            child: Column(
                              children: [
                                DropdownButtonFormField<String>(
                                  value: scheduleType,
                                  decoration: const InputDecoration(
                                    labelText: 'Frequency',
                                    border: OutlineInputBorder(),
                                  ),
                                  items: const [
                                    DropdownMenuItem(value: 'daily', child: Text('Every Day')),
                                    DropdownMenuItem(value: 'weekly', child: Text('Specific Days')),
                                    DropdownMenuItem(value: 'custom', child: Text('Custom Schedule')),
                                  ],
                                  onChanged: (value) {
                                    setState(() {
                                      scheduleType = value!;
                                      if (value != 'weekly') {
                                        selectedDays = [];
                                      }
                                    });
                                  },
                                ),
                                if (scheduleType == 'weekly') ...[
                                  const SizedBox(height: 16),
                                  Wrap(
                                    spacing: 8,
                                    children: weekDays.map((day) {
                                      final isSelected = selectedDays.contains(day);
                                      return FilterChip(
                                        label: Text(day.substring(0, 3)),
                                        selected: isSelected,
                                        onSelected: (selected) {
                                          setState(() {
                                            if (selected) {
                                              selectedDays.add(day);
                                            } else {
                                              selectedDays.remove(day);
                                            }
                                          });
                                        },
                                      );
                                    }).toList(),
                                  ),
                                ],
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
                                  trailing: Row(
                                    mainAxisSize: MainAxisSize.min,
                                    children: [
                                      if (endDate != null)
                                        IconButton(
                                          icon: const Icon(Icons.clear),
                                          onPressed: () {
                                            setState(() {
                                              endDate = null;
                                            });
                                          },
                                        ),
                                      const Icon(Icons.calendar_today),
                                    ],
                                  ),
                                  onTap: () async {
                                    final date = await showDatePicker(
                                      context: context,
                                      initialDate: endDate ?? startDate.add(const Duration(days: 30)),
                                      firstDate: startDate,
                                      lastDate: DateTime.now().add(const Duration(days: 365)),
                                    );
                                    if (date != null) {
                                      setState(() {
                                        endDate = date;
                                      });
                                    }
                                  },
                                ),
                              ],
                            ),
                          ),
                        ),
                        const SizedBox(height: 24),
                        Text(
                          'Add Products',
                          style: Theme.of(context).textTheme.titleLarge,
                        ),
                        const SizedBox(height: 8),
                        ...activeProducts.map((product) {
                          final isSelected = selectedItems.any((item) => item.productId == product.id);
                          return Card(
                            margin: const EdgeInsets.only(bottom: 8),
                            child: ListTile(
                              leading: product.imageUrl != null
                                  ? ClipRRect(
                                      borderRadius: BorderRadius.circular(4),
                                      child: Image.network(
                                        '${ApiConfig.baseUrl}${product.imageUrl}',
                                        width: 50,
                                        height: 50,
                                        fit: BoxFit.cover,
                                        errorBuilder: (context, error, stackTrace) {
                                          return Container(
                                            width: 50,
                                            height: 50,
                                            color: Colors.grey[200],
                                            child: const Icon(Icons.local_drink, size: 24),
                                          );
                                        },
                                      ),
                                    )
                                  : Container(
                                      width: 50,
                                      height: 50,
                                      decoration: BoxDecoration(
                                        color: Colors.grey[200],
                                        borderRadius: BorderRadius.circular(4),
                                      ),
                                      child: const Icon(Icons.local_drink, size: 24),
                                    ),
                              title: Text(product.name),
                              subtitle: Text('₹${product.unitPrice.toStringAsFixed(2)}/${product.unit}'),
                              trailing: isSelected
                                  ? const Icon(Icons.check_circle, color: Colors.green)
                                  : null,
                              onTap: () => _addOrEditProduct(product),
                            ),
                          );
                        }),
                      ],
                    ),
                  ),
                ),
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: Theme.of(context).cardColor,
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withValues(alpha: 0.1),
                        blurRadius: 4,
                        offset: const Offset(0, -2),
                      ),
                    ],
                  ),
                  child: SafeArea(
                    child: SizedBox(
                      width: double.infinity,
                      child: ElevatedButton(
                        onPressed: isLoading ? null : _saveSubscription,
                        style: ElevatedButton.styleFrom(
                          padding: const EdgeInsets.symmetric(vertical: 16),
                        ),
                        child: isLoading
                            ? const SizedBox(
                                height: 20,
                                width: 20,
                                child: CircularProgressIndicator(strokeWidth: 2),
                              )
                            : const Text('Save Subscription'),
                      ),
                    ),
                  ),
                ),
              ],
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
                  onPressed: () => ref.invalidate(createSubProductsProvider),
                  child: const Text('Retry'),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  void _addOrEditProduct(Product product) {
    final existingItem = selectedItems.firstWhere(
      (item) => item.productId == product.id,
      orElse: () => SubscriptionItem(
        productId: product.id,
        productName: product.name,
        unit: product.unit,
        quantity: 1,
        pricePerUnit: product.unitPrice,
      ),
    );

    final quantityController = TextEditingController(
      text: existingItem.quantity.toString(),
    );

    showDialog(
      context: context,
      builder: (dialogContext) => AlertDialog(
        title: Text('Add ${product.name}'),
        content: Column(
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
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(dialogContext),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () {
              final quantity = int.tryParse(quantityController.text);
              if (quantity == null || quantity <= 0) {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Please enter a valid quantity')),
                );
                return;
              }

              setState(() {
                selectedItems.removeWhere((item) => item.productId == product.id);
                selectedItems.add(SubscriptionItem(
                  productId: product.id,
                  productName: product.name,
                  unit: product.unit,
                  quantity: quantity,
                  pricePerUnit: product.unitPrice,
                ));
              });

              Navigator.pop(dialogContext);
            },
            child: const Text('Add'),
          ),
        ],
      ),
    );
  }

  void _editItem(Product product, SubscriptionItem item) {
    _addOrEditProduct(product);
  }

  Future<void> _saveSubscription() async {
    if (selectedItems.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please select at least one product')),
      );
      return;
    }

    if (scheduleType == 'weekly' && selectedDays.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please select at least one day for weekly schedule')),
      );
      return;
    }

    setState(() {
      isLoading = true;
    });

    final apiService = ref.read(apiServiceProvider);
    final user = ref.read(authProvider).user;

    if (user == null) {
      setState(() {
        isLoading = false;
      });
      return;
    }

    try {
      final requestData = {
        'customer_id': user.id,
        'start_date': _formatDateForApi(startDate),
        'schedule_type': scheduleType,
        'items': selectedItems.map((item) => item.toJson()).toList(),
      };

      if (endDate != null) {
        requestData['end_date'] = _formatDateForApi(endDate!);
      }

      if (scheduleType == 'weekly' && selectedDays.isNotEmpty) {
        requestData['days_of_week'] = selectedDays.join(',');
      }

      final response = await apiService.post(
        ApiConfig.subscriptions,
        data: requestData,
      );

      if (response.data['success']) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Subscription created successfully!')),
          );
          Navigator.pop(context, true);
        }
      } else {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text('Error: ${response.data['message']}')),
          );
        }
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error creating subscription: $e')),
        );
      }
    } finally {
      if (mounted) {
        setState(() {
          isLoading = false;
        });
      }
    }
  }
}
