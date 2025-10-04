import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../providers/auth_provider.dart';
import '../../models/subscription_model.dart';
import '../../config/api_config.dart';
import '../../providers/api_provider.dart';
import 'package:intl/intl.dart';

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
                return Card(
                  margin: const EdgeInsets.only(bottom: 12),
                  child: ListTile(
                    leading: CircleAvatar(
                      child: Text('${subscription.quantityPerDay}'),
                    ),
                    title: Text(subscription.productName ?? 'Product'),
                    subtitle: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('${subscription.quantityPerDay} per day'),
                        Text(
                          'From ${DateFormat('MMM dd, yyyy').format(subscription.startDate)}',
                        ),
                        if (subscription.endDate != null)
                          Text(
                            'Until ${DateFormat('MMM dd, yyyy').format(subscription.endDate!)}',
                          ),
                      ],
                    ),
                    trailing: Chip(
                      label: Text(subscription.isActive ? 'Active' : 'Inactive'),
                      backgroundColor: subscription.isActive
                          ? Colors.green.withOpacity(0.2)
                          : Colors.grey.withOpacity(0.2),
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
                onPressed: () => ref.invalidate(subscriptionsProvider),
                child: const Text('Retry'),
              ),
            ],
          ),
        ),
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Create subscription feature - to be implemented')),
          );
        },
        child: const Icon(Icons.add),
      ),
    );
  }
}
