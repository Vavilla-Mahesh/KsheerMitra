import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../providers/auth_provider.dart';
import '../../models/delivery_model.dart';
import '../../config/api_config.dart';
import '../../config/theme_config.dart';
import '../../providers/api_provider.dart';
import 'package:intl/intl.dart';

final deliveriesProvider = FutureProvider.autoDispose<List<Delivery>>((ref) async {
  final apiService = ref.watch(apiServiceProvider);
  
  final response = await apiService.get(ApiConfig.deliveryAssigned);
  
  if (response.data['success']) {
    return (response.data['data'] as List)
        .map((json) => Delivery.fromJson(json))
        .toList();
  }
  return [];
});

class DeliveryHomeScreen extends ConsumerWidget {
  const DeliveryHomeScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final user = ref.watch(authProvider).user!;
    final deliveriesAsync = ref.watch(deliveriesProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Delivery Dashboard'),
        actions: [
          IconButton(
            icon: const Icon(Icons.person),
            onPressed: () {
              showDialog(
                context: context,
                builder: (context) => AlertDialog(
                  title: const Text('Profile'),
                  content: Column(
                    mainAxisSize: MainAxisSize.min,
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('Name: ${user.name}'),
                      Text('Email: ${user.email}'),
                      Text('Phone: ${user.phone}'),
                    ],
                  ),
                  actions: [
                    TextButton(
                      onPressed: () => Navigator.pop(context),
                      child: const Text('Close'),
                    ),
                  ],
                ),
              );
            },
          ),
          IconButton(
            icon: const Icon(Icons.logout),
            onPressed: () async {
              await ref.read(authProvider.notifier).logout();
            },
          ),
        ],
      ),
      body: GradientBackground(
        child: deliveriesAsync.when(
          data: (deliveries) {
            if (deliveries.isEmpty) {
              return Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(
                      Icons.local_shipping_outlined,
                      size: 64,
                      color: Theme.of(context).colorScheme.secondary,
                    ),
                    const SizedBox(height: 16),
                    const Text('No deliveries assigned'),
                  ],
                ),
              );
            }

            return RefreshIndicator(
              onRefresh: () async {
                ref.invalidate(deliveriesProvider);
              },
              child: ListView.builder(
                padding: const EdgeInsets.all(16),
                itemCount: deliveries.length,
                itemBuilder: (context, index) {
                  final delivery = deliveries[index];
                  return Card(
                    margin: const EdgeInsets.only(bottom: 12),
                    child: ListTile(
                      leading: CircleAvatar(
                        backgroundColor: _getStatusColor(delivery.status),
                        child: Icon(
                          _getStatusIcon(delivery.status),
                          color: Colors.white,
                        ),
                      ),
                      title: Text(delivery.customerName ?? 'Customer'),
                      subtitle: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(delivery.customerLocation ?? ''),
                          Text(
                            'Date: ${DateFormat('MMM dd, yyyy').format(delivery.deliveryDate)}',
                          ),
                          if (delivery.notes != null && delivery.notes!.isNotEmpty)
                            Text('Notes: ${delivery.notes}'),
                        ],
                      ),
                      trailing: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          _buildStatusChip(delivery.status),
                          const SizedBox(width: 8),
                          if (delivery.status != 'delivered' && delivery.status != 'cancelled')
                            IconButton(
                              icon: const Icon(Icons.edit),
                              onPressed: () {
                                _showUpdateStatusDialog(context, ref, delivery);
                              },
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
                  onPressed: () => ref.invalidate(deliveriesProvider),
                  child: const Text('Retry'),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  IconData _getStatusIcon(String status) {
    switch (status.toLowerCase()) {
      case 'delivered':
        return Icons.check_circle;
      case 'in_progress':
        return Icons.local_shipping;
      case 'cancelled':
        return Icons.cancel;
      case 'failed':
        return Icons.error;
      default:
        return Icons.pending;
    }
  }

  Color _getStatusColor(String status) {
    switch (status.toLowerCase()) {
      case 'delivered':
        return Colors.green;
      case 'failed':
      case 'cancelled':
        return Colors.red;
      case 'in_progress':
        return Colors.blue;
      default:
        return Colors.orange;
    }
  }

  Widget _buildStatusChip(String status) {
    return Chip(
      label: Text(
        status.toUpperCase(),
        style: const TextStyle(fontSize: 10),
      ),
      backgroundColor: _getStatusColor(status).withOpacity(0.2),
    );
  }

  void _showUpdateStatusDialog(BuildContext context, WidgetRef ref, Delivery delivery) {
    String selectedStatus = delivery.status;
    final notesController = TextEditingController(text: delivery.notes ?? '');

    showDialog(
      context: context,
      builder: (dialogContext) => StatefulBuilder(
        builder: (context, setState) => AlertDialog(
          title: const Text('Update Delivery Status'),
          content: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Customer: ${delivery.customerName ?? 'Unknown'}'),
                const SizedBox(height: 16),
                DropdownButtonFormField<String>(
                  value: selectedStatus,
                  decoration: const InputDecoration(
                    labelText: 'Status',
                    border: OutlineInputBorder(),
                  ),
                  items: const [
                    DropdownMenuItem(value: 'pending', child: Text('Pending')),
                    DropdownMenuItem(value: 'in_progress', child: Text('In Progress')),
                    DropdownMenuItem(value: 'delivered', child: Text('Delivered')),
                    DropdownMenuItem(value: 'cancelled', child: Text('Cancelled')),
                  ],
                  onChanged: (value) {
                    if (value != null) {
                      setState(() {
                        selectedStatus = value;
                      });
                    }
                  },
                ),
                const SizedBox(height: 16),
                TextField(
                  controller: notesController,
                  decoration: const InputDecoration(
                    labelText: 'Notes (Optional)',
                    border: OutlineInputBorder(),
                  ),
                  maxLines: 3,
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
                Navigator.pop(dialogContext);
                await _updateDeliveryStatus(
                  context,
                  ref,
                  delivery.id,
                  selectedStatus,
                  notesController.text,
                );
              },
              child: const Text('Update'),
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _updateDeliveryStatus(
    BuildContext context,
    WidgetRef ref,
    String deliveryId,
    String status,
    String notes,
  ) async {
    final apiService = ref.read(apiServiceProvider);

    try {
      final response = await apiService.put(
        ApiConfig.deliveryStatus(deliveryId),
        data: {
          'status': status,
          'notes': notes.isEmpty ? null : notes,
        },
      );

      if (response.data['success']) {
        ref.invalidate(deliveriesProvider);
        if (context.mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Delivery status updated successfully!')),
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
          SnackBar(content: Text('Error updating delivery status: $e')),
        );
      }
    }
  }
}
