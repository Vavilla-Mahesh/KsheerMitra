import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../providers/auth_provider.dart';
import '../../models/billing_model.dart';
import '../../config/api_config.dart';
import '../../providers/api_provider.dart';
import 'package:intl/intl.dart';

final selectedMonthProvider = StateProvider<DateTime>((ref) => DateTime.now());

final billingProvider = FutureProvider.autoDispose<MonthlyBilling?>((ref) async {
  final apiService = ref.watch(apiServiceProvider);
  final user = ref.watch(authProvider).user;
  final selectedMonth = ref.watch(selectedMonthProvider);
  
  if (user == null) return null;
  
  final monthStr = DateFormat('yyyy-MM').format(selectedMonth);
  
  final response = await apiService.get(
    ApiConfig.customerBilling(user.id),
    queryParameters: {'month': monthStr},
  );
  
  if (response.data['success']) {
    return MonthlyBilling.fromJson(response.data['data']);
  }
  return null;
});

class BillingScreen extends ConsumerWidget {
  const BillingScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final selectedMonth = ref.watch(selectedMonthProvider);
    final billingAsync = ref.watch(billingProvider);

    return Scaffold(
      body: Column(
        children: [
          Card(
            margin: const EdgeInsets.all(16),
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Row(
                children: [
                  IconButton(
                    icon: const Icon(Icons.chevron_left),
                    onPressed: () {
                      ref.read(selectedMonthProvider.notifier).state =
                          DateTime(selectedMonth.year, selectedMonth.month - 1);
                    },
                  ),
                  Expanded(
                    child: Text(
                      DateFormat('MMMM yyyy').format(selectedMonth),
                      textAlign: TextAlign.center,
                      style: Theme.of(context).textTheme.titleLarge,
                    ),
                  ),
                  IconButton(
                    icon: const Icon(Icons.chevron_right),
                    onPressed: () {
                      final nextMonth = DateTime(selectedMonth.year, selectedMonth.month + 1);
                      if (nextMonth.isBefore(DateTime.now())) {
                        ref.read(selectedMonthProvider.notifier).state = nextMonth;
                      }
                    },
                  ),
                ],
              ),
            ),
          ),
          Expanded(
            child: billingAsync.when(
              data: (billing) {
                if (billing == null || billing.dailyBreakdown.isEmpty) {
                  return const Center(
                    child: Text('No billing data for this month'),
                  );
                }

                return RefreshIndicator(
                  onRefresh: () async {
                    ref.invalidate(billingProvider);
                  },
                  child: ListView(
                    padding: const EdgeInsets.all(16),
                    children: [
                      Card(
                        color: Theme.of(context).colorScheme.primaryContainer,
                        child: Padding(
                          padding: const EdgeInsets.all(16),
                          child: Column(
                            children: [
                              Text(
                                'Total Amount',
                                style: Theme.of(context).textTheme.titleMedium,
                              ),
                              const SizedBox(height: 8),
                              Text(
                                '₹${billing.monthTotal.toStringAsFixed(2)}',
                                style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                                      fontWeight: FontWeight.bold,
                                    ),
                              ),
                            ],
                          ),
                        ),
                      ),
                      const SizedBox(height: 16),
                      Text(
                        'Daily Breakdown',
                        style: Theme.of(context).textTheme.titleMedium,
                      ),
                      const SizedBox(height: 8),
                      ...billing.dailyBreakdown.map((day) => Card(
                            margin: const EdgeInsets.only(bottom: 8),
                            child: ExpansionTile(
                              title: Text(
                                DateFormat('MMM dd, yyyy').format(DateTime.parse(day.date)),
                              ),
                              subtitle: Text('₹${day.dayTotal.toStringAsFixed(2)}'),
                              children: day.items.map((item) {
                                return ListTile(
                                  dense: true,
                                  title: Text(item.productName),
                                  subtitle: Text('${item.quantity} × ₹${item.unitPrice.toStringAsFixed(2)}'),
                                  trailing: Text('₹${item.lineTotal.toStringAsFixed(2)}'),
                                );
                              }).toList(),
                            ),
                          )),
                    ],
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
                      onPressed: () => ref.invalidate(billingProvider),
                      child: const Text('Retry'),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
