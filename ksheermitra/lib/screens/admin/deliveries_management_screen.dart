import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../models/delivery_model.dart';
import '../../config/api_config.dart';
import '../../providers/api_provider.dart';

final deliveriesProvider = FutureProvider.autoDispose<List<Delivery>>((ref) async {
  final apiService = ref.watch(apiServiceProvider);
  
  final response = await apiService.get(ApiConfig.deliveryAll);
  
  if (response.data['success']) {
    return (response.data['data'] as List)
        .map((json) => Delivery.fromJson(json))
        .toList();
  }
  return [];
});

class DeliveriesManagementScreen extends ConsumerWidget {
  const DeliveriesManagementScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final deliveriesAsync = ref.watch(deliveriesProvider);

    return Scaffold(
      body: deliveriesAsync.when(
        data: (deliveries) {
          if (deliveries.isEmpty) {
            return const Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.local_shipping, size: 64, color: Colors.grey),
                  SizedBox(height: 16),
                  Text('No deliveries yet'),
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
                    title: Text('Delivery #${delivery.id.substring(0, 8)}'),
                    subtitle: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('Customer: ${delivery.customerName ?? 'Unknown'}'),
                        Text('Date: ${_formatDate(delivery.deliveryDate)}'),
                        Text('Status: ${_formatStatus(delivery.status)}'),
                        if (delivery.notes != null && delivery.notes!.isNotEmpty)
                          Text('Notes: ${delivery.notes}'),
                      ],
                    ),
                    trailing: Chip(
                      label: Text(_formatStatus(delivery.status)),
                      backgroundColor: _getStatusColor(delivery.status).withOpacity(0.2),
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
    );
  }

  String _formatDate(DateTime date) {
    return '${date.day}/${date.month}/${date.year}';
  }

  String _formatStatus(String status) {
    return status.split('_').map((word) => 
      word[0].toUpperCase() + word.substring(1)
    ).join(' ');
  }

  IconData _getStatusIcon(String status) {
    switch (status) {
      case 'pending':
        return Icons.pending;
      case 'in_progress':
        return Icons.local_shipping;
      case 'delivered':
        return Icons.check_circle;
      case 'cancelled':
        return Icons.cancel;
      default:
        return Icons.help;
    }
  }

  Color _getStatusColor(String status) {
    switch (status) {
      case 'pending':
        return Colors.orange;
      case 'in_progress':
        return Colors.blue;
      case 'delivered':
        return Colors.green;
      case 'cancelled':
        return Colors.red;
      default:
        return Colors.grey;
    }
  }
}
