import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../providers/auth_provider.dart';
import '../../models/subscription_model.dart';
import '../../config/api_config.dart';
import '../../providers/api_provider.dart';
import 'package:intl/intl.dart';
import 'create_subscription_screen.dart';

final subscriptionsProvider = FutureProvider.autoDispose<List<Subscription>>((ref) async {
  final apiService = ref.watch(apiServiceProvider);
  final user = ref.watch(authProvider).user;
  
  if (user == null) return [];
  
  final response = await apiService.get(
    ApiConfig.customerSubscriptions(user.id),
  );
  
  if (response.data['success']) {
    return (response.data['data'] as List)
        .map((json) => Subscription.fromJson(json))
        .toList();
  }
  return [];
});

class SubscriptionsScreen extends ConsumerWidget {
  const SubscriptionsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final subscriptionsAsync = ref.watch(subscriptionsProvider);

    return Scaffold(
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () async {
          final result = await Navigator.push(
            context,
            MaterialPageRoute(
              builder: (context) => const CreateSubscriptionScreen(),
            ),
          );
          if (result == true) {
            ref.invalidate(subscriptionsProvider);
          }
        },
        icon: const Icon(Icons.add),
        label: const Text('Create Subscription'),
      ),
      body: subscriptionsAsync.when(
        data: (subscriptions) {
          if (subscriptions.isEmpty) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(
                    Icons.subscriptions_outlined,
                    size: 64,
                    color: Theme.of(context).colorScheme.secondary,
                  ),
                  const SizedBox(height: 16),
                  const Text('No subscriptions yet'),
                  const SizedBox(height: 8),
                  const Text('Create your first subscription'),
                ],
              ),
            );
          }

          return RefreshIndicator(
            onRefresh: () async {
              ref.invalidate(subscriptionsProvider);
            },
            child: ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: subscriptions.length,
              itemBuilder: (context, index) {
                final subscription = subscriptions[index];
                final isMultiProduct = subscription.isMultiProduct;
                
                return Card(
                  margin: const EdgeInsets.only(bottom: 12),
                  child: Column(
                    children: [
                      ListTile(
                        leading: CircleAvatar(
                          child: Icon(
                            isMultiProduct ? Icons.shopping_basket : Icons.local_drink,
                          ),
                        ),
                        title: Text(
                          isMultiProduct 
                              ? 'Multi-Product Subscription' 
                              : subscription.productName ?? 'Product',
                        ),
                        subtitle: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            if (!isMultiProduct && subscription.quantityPerDay != null)
                              Text('${subscription.quantityPerDay} per day'),
                            if (isMultiProduct && subscription.items != null)
                              Text('${subscription.items!.length} products'),
                            Text(
                              'From ${DateFormat('MMM dd, yyyy').format(subscription.startDate)}',
                            ),
                            if (subscription.endDate != null)
                              Text(
                                'Until ${DateFormat('MMM dd, yyyy').format(subscription.endDate!)}',
                              ),
                            if (subscription.scheduleType != null && subscription.scheduleType != 'daily')
                              Text('Schedule: ${subscription.scheduleType}'),
                          ],
                        ),
                        trailing: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Chip(
                              label: Text(subscription.isActive ? 'Active' : 'Inactive'),
                              backgroundColor: subscription.isActive
                                  ? Colors.green.withValues(alpha: 0.2)
                                  : Colors.grey.withValues(alpha: 0.2),
                            ),
                            PopupMenuButton<String>(
                              onSelected: (value) {
                                if (value == 'view') {
                                  _showSubscriptionDetails(context, subscription);
                                } else if (value == 'edit' && !isMultiProduct) {
                                  _showEditDialog(context, ref, subscription);
                                } else if (value == 'adjust' && !isMultiProduct) {
                                  _showDateAdjustmentDialog(context, ref, subscription);
                                } else if (value == 'delete') {
                                  _showDeleteConfirmation(context, ref, subscription);
                                }
                              },
                              itemBuilder: (context) => [
                                if (isMultiProduct)
                                  const PopupMenuItem(
                                    value: 'view',
                                    child: Text('View Details'),
                                  ),
                                if (!isMultiProduct) ...[
                                  const PopupMenuItem(
                                    value: 'edit',
                                    child: Text('Edit'),
                                  ),
                                  const PopupMenuItem(
                                    value: 'adjust',
                                    child: Text('Adjust Date Quantity'),
                                  ),
                                ],
                                const PopupMenuItem(
                                  value: 'delete',
                                  child: Text('Cancel Subscription'),
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),
                      if (isMultiProduct && subscription.items != null)
                        Padding(
                          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                          child: Column(
                            children: subscription.items!.map((item) {
                              return Padding(
                                padding: const EdgeInsets.only(bottom: 4),
                                child: Row(
                                  children: [
                                    const SizedBox(width: 8),
                                    Expanded(
                                      child: Text(
                                        '• ${item.productName ?? 'Product'} - ${item.quantity} ${item.unit ?? 'unit'}',
                                        style: Theme.of(context).textTheme.bodyMedium,
                                      ),
                                    ),
                                    Text(
                                      '₹${item.pricePerUnit.toStringAsFixed(2)}',
                                      style: Theme.of(context).textTheme.bodySmall?.copyWith(
                                            color: Colors.grey[600],
                                          ),
                                    ),
                                  ],
                                ),
                              );
                            }).toList(),
                          ),
                        ),
                    ],
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
                onPressed: () => ref.invalidate(subscriptionsProvider),
                child: const Text('Retry'),
              ),
            ],
          ),
        ),
      ),
    );
  }

  void _showSubscriptionDetails(BuildContext context, Subscription subscription) {
    showDialog(
      context: context,
      builder: (dialogContext) => AlertDialog(
        title: const Text('Subscription Details'),
        content: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Start Date: ${DateFormat('MMM dd, yyyy').format(subscription.startDate)}',
              ),
              if (subscription.endDate != null)
                Text(
                  'End Date: ${DateFormat('MMM dd, yyyy').format(subscription.endDate!)}',
                ),
              if (subscription.scheduleType != null)
                Text('Schedule: ${subscription.scheduleType}'),
              if (subscription.daysOfWeek != null && subscription.daysOfWeek!.isNotEmpty)
                Text('Days: ${subscription.daysOfWeek!.join(', ')}'),
              const SizedBox(height: 16),
              const Text(
                'Products:',
                style: TextStyle(fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 8),
              if (subscription.items != null)
                ...subscription.items!.map((item) {
                  return Padding(
                    padding: const EdgeInsets.only(bottom: 8),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Expanded(
                          child: Text('${item.productName}'),
                        ),
                        Text(
                          '${item.quantity} × ₹${item.pricePerUnit.toStringAsFixed(2)}',
                          style: const TextStyle(fontWeight: FontWeight.bold),
                        ),
                      ],
                    ),
                  );
                }),
            ],
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(dialogContext),
            child: const Text('Close'),
          ),
        ],
      ),
    );
  }

  void _showEditDialog(BuildContext context, WidgetRef ref, Subscription subscription) {
    final quantityController = TextEditingController(
      text: subscription.quantityPerDay.toString(),
    );
    bool isActive = subscription.isActive;
    DateTime? endDate = subscription.endDate;

    showDialog(
      context: context,
      builder: (dialogContext) => StatefulBuilder(
        builder: (context, setState) => AlertDialog(
          title: Text('Edit ${subscription.productName}'),
          content: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                TextField(
                  controller: quantityController,
                  keyboardType: TextInputType.number,
                  decoration: const InputDecoration(
                    labelText: 'Daily Quantity',
                    border: OutlineInputBorder(),
                  ),
                ),
                const SizedBox(height: 16),
                SwitchListTile(
                  contentPadding: EdgeInsets.zero,
                  title: const Text('Active'),
                  value: isActive,
                  onChanged: (value) {
                    setState(() {
                      isActive = value;
                    });
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
                      initialDate: endDate ?? DateTime.now().add(const Duration(days: 30)),
                      firstDate: subscription.startDate,
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
                await _updateSubscription(
                  context,
                  ref,
                  subscription.id,
                  quantity,
                  isActive,
                  endDate,
                );
              },
              child: const Text('Update'),
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _updateSubscription(
    BuildContext context,
    WidgetRef ref,
    String subscriptionId,
    int quantity,
    bool isActive,
    DateTime? endDate,
  ) async {
    final apiService = ref.read(apiServiceProvider);

    try {
      final response = await apiService.put(
        '${ApiConfig.subscriptions}/$subscriptionId',
        data: {
          'quantity_per_day': quantity,
          'is_active': isActive,
          'end_date': endDate?.toIso8601String(),
        },
      );

      if (response.data['success']) {
        ref.invalidate(subscriptionsProvider);
        if (context.mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Subscription updated successfully!')),
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
          SnackBar(content: Text('Error updating subscription: $e')),
        );
      }
    }
  }

  void _showDateAdjustmentDialog(BuildContext context, WidgetRef ref, Subscription subscription) {
    DateTime selectedDate = DateTime.now();
    final quantityController = TextEditingController();

    showDialog(
      context: context,
      builder: (dialogContext) => StatefulBuilder(
        builder: (context, setState) => AlertDialog(
          title: const Text('Adjust Date Quantity'),
          content: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Adjust quantity for a specific date only.'),
                Text('Normal daily quantity: ${subscription.quantityPerDay}'),
                const SizedBox(height: 16),
                ListTile(
                  contentPadding: EdgeInsets.zero,
                  title: const Text('Select Date'),
                  subtitle: Text(DateFormat('MMM dd, yyyy').format(selectedDate)),
                  trailing: const Icon(Icons.calendar_today),
                  onTap: () async {
                    final date = await showDatePicker(
                      context: context,
                      initialDate: selectedDate,
                      firstDate: subscription.startDate,
                      lastDate: subscription.endDate ?? DateTime.now().add(const Duration(days: 365)),
                    );
                    if (date != null) {
                      setState(() {
                        selectedDate = date;
                      });
                    }
                  },
                ),
                const SizedBox(height: 16),
                TextField(
                  controller: quantityController,
                  keyboardType: TextInputType.number,
                  decoration: InputDecoration(
                    labelText: 'Adjusted Quantity (0 to skip this day)',
                    border: const OutlineInputBorder(),
                    helperText: 'Enter 0 to skip delivery for this date',
                  ),
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
                if (quantity == null || quantity < 0) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Please enter a valid quantity (0 or more)')),
                  );
                  return;
                }

                Navigator.pop(dialogContext);
                await _createDateAdjustment(
                  context,
                  ref,
                  subscription.id,
                  selectedDate,
                  quantity,
                );
              },
              child: const Text('Save'),
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _createDateAdjustment(
    BuildContext context,
    WidgetRef ref,
    String subscriptionId,
    DateTime date,
    int quantity,
  ) async {
    final apiService = ref.read(apiServiceProvider);

    try {
      final response = await apiService.post(
        ApiConfig.subscriptionAdjustments(subscriptionId),
        data: {
          'adjustment_date': date.toIso8601String().split('T')[0],
          'adjusted_quantity': quantity,
        },
      );

      if (response.data['success']) {
        if (context.mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(
                quantity == 0
                    ? 'Delivery skipped for ${DateFormat('MMM dd, yyyy').format(date)}'
                    : 'Quantity adjusted to $quantity for ${DateFormat('MMM dd, yyyy').format(date)}',
              ),
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
          SnackBar(content: Text('Error creating adjustment: $e')),
        );
      }
    }
  }

  void _showDeleteConfirmation(BuildContext context, WidgetRef ref, Subscription subscription) {
    showDialog(
      context: context,
      builder: (dialogContext) => AlertDialog(
        title: const Text('Cancel Subscription'),
        content: Text('Are you sure you want to cancel subscription for ${subscription.productName}?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(dialogContext),
            child: const Text('No'),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.red,
            ),
            onPressed: () async {
              Navigator.pop(dialogContext);
              await _deleteSubscription(context, ref, subscription.id);
            },
            child: const Text('Yes, Cancel'),
          ),
        ],
      ),
    );
  }

  Future<void> _deleteSubscription(
    BuildContext context,
    WidgetRef ref,
    String subscriptionId,
  ) async {
    final apiService = ref.read(apiServiceProvider);

    try {
      final response = await apiService.delete(
        '${ApiConfig.subscriptions}/$subscriptionId',
      );

      if (response.data['success']) {
        ref.invalidate(subscriptionsProvider);
        if (context.mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Subscription cancelled successfully!')),
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
          SnackBar(content: Text('Error cancelling subscription: $e')),
        );
      }
    }
  }
}
