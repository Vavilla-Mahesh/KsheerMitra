import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../models/user_model.dart';
import '../../config/api_config.dart';
import '../../config/theme_config.dart';
import '../../providers/api_provider.dart';

final usersProvider = FutureProvider.autoDispose<List<User>>((ref) async {
  final apiService = ref.watch(apiServiceProvider);
  
  final response = await apiService.get(ApiConfig.adminUsers);
  
  if (response.data['success']) {
    return (response.data['data'] as List)
        .map((json) => User.fromJson(json))
        .toList();
  }
  return [];
});

class UsersManagementScreen extends ConsumerWidget {
  const UsersManagementScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final usersAsync = ref.watch(usersProvider);

    return Scaffold(
      body: Container(
        decoration: BoxDecoration(
          gradient: LinearGradient(
            colors: [
              AppTheme.primaryBlue,
              AppTheme.secondaryBlue,
            ],
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
          ),
        ),
        child: usersAsync.when(
          data: (users) {
            if (users.isEmpty) {
              return const Center(
                child: Text('No users available'),
              );
            }

            // Separate users by role
            final customers = users.where((u) => u.role == 'customer').toList();
            final deliveryBoys = users.where((u) => u.role == 'delivery_boy').toList();

            return RefreshIndicator(
              onRefresh: () async {
                ref.invalidate(usersProvider);
              },
              child: ListView(
                padding: const EdgeInsets.all(16),
                children: [
                  if (deliveryBoys.isNotEmpty) ...[
                    const Text(
                      'Delivery Boys',
                      style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
                    ),
                    const SizedBox(height: 8),
                    ...deliveryBoys.map((user) => _buildUserCard(context, ref, user)),
                    const SizedBox(height: 16),
                  ],
                  const Text(
                    'Customers',
                    style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 8),
                  ...customers.map((user) => _buildUserCard(context, ref, user)),
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
                  onPressed: () => ref.invalidate(usersProvider),
                  child: const Text('Retry'),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildUserCard(BuildContext context, WidgetRef ref, User user) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: ListTile(
        leading: CircleAvatar(
          child: Icon(
            user.role == 'delivery_boy' ? Icons.delivery_dining : Icons.person,
          ),
        ),
        title: Text(user.name),
        subtitle: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Email: ${user.email}'),
            Text('Phone: ${user.phone}'),
            Text('Location: ${user.location}'),
          ],
        ),
        trailing: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Chip(
              label: Text(user.isActive ? 'Active' : 'Inactive'),
              backgroundColor: user.isActive
                  ? Colors.green.withValues(alpha: 0.2)
                  : Colors.red.withValues(alpha: 0.2),
            ),
            const SizedBox(width: 8),
            PopupMenuButton<String>(
              onSelected: (value) {
                if (value == 'edit') {
                  _showEditUserDialog(context, ref, user);
                } else if (value == 'deactivate') {
                  _showDeactivateConfirmation(context, ref, user);
                }
              },
              itemBuilder: (context) => [
                const PopupMenuItem(
                  value: 'edit',
                  child: Text('Edit'),
                ),
                if (user.isActive)
                  const PopupMenuItem(
                    value: 'deactivate',
                    child: Text('Deactivate'),
                  ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  void _showEditUserDialog(BuildContext context, WidgetRef ref, User user) {
    final nameController = TextEditingController(text: user.name);
    final phoneController = TextEditingController(text: user.phone);
    final locationController = TextEditingController(text: user.location);

    showDialog(
      context: context,
      builder: (dialogContext) => AlertDialog(
        title: const Text('Edit User'),
        content: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextField(
                controller: nameController,
                decoration: const InputDecoration(
                  labelText: 'Name',
                  border: OutlineInputBorder(),
                ),
              ),
              const SizedBox(height: 16),
              TextField(
                controller: phoneController,
                decoration: const InputDecoration(
                  labelText: 'Phone',
                  border: OutlineInputBorder(),
                ),
              ),
              const SizedBox(height: 16),
              TextField(
                controller: locationController,
                decoration: const InputDecoration(
                  labelText: 'Location',
                  border: OutlineInputBorder(),
                ),
                maxLines: 2,
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
              if (nameController.text.isEmpty || 
                  phoneController.text.isEmpty || 
                  locationController.text.isEmpty) {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Please fill all fields')),
                );
                return;
              }

              Navigator.pop(dialogContext);
              await _updateUser(
                context,
                ref,
                user.id,
                nameController.text,
                phoneController.text,
                locationController.text,
              );
            },
            child: const Text('Update'),
          ),
        ],
      ),
    );
  }

  Future<void> _updateUser(
    BuildContext context,
    WidgetRef ref,
    String userId,
    String name,
    String phone,
    String location,
  ) async {
    final apiService = ref.read(apiServiceProvider);

    try {
      final response = await apiService.put(
        ApiConfig.adminUser(userId),
        data: {
          'name': name,
          'phone': phone,
          'location': location,
        },
      );

      if (response.data['success']) {
        ref.invalidate(usersProvider);
        if (context.mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('User updated successfully!')),
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
          SnackBar(content: Text('Error updating user: $e')),
        );
      }
    }
  }

  void _showDeactivateConfirmation(BuildContext context, WidgetRef ref, User user) {
    showDialog(
      context: context,
      builder: (dialogContext) => AlertDialog(
        title: const Text('Deactivate User'),
        content: Text('Are you sure you want to deactivate ${user.name}?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(dialogContext),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.orange,
            ),
            onPressed: () async {
              Navigator.pop(dialogContext);
              await _deactivateUser(context, ref, user.id);
            },
            child: const Text('Deactivate'),
          ),
        ],
      ),
    );
  }

  Future<void> _deactivateUser(
    BuildContext context,
    WidgetRef ref,
    String userId,
  ) async {
    final apiService = ref.read(apiServiceProvider);

    try {
      final response = await apiService.patch(
        ApiConfig.adminDeactivateUser(userId),
      );

      if (response.data['success']) {
        ref.invalidate(usersProvider);
        if (context.mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('User deactivated successfully!')),
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
          SnackBar(content: Text('Error deactivating user: $e')),
        );
      }
    }
  }
}
