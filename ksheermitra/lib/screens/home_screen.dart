import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../providers/auth_provider.dart';
import 'customer/customer_home_screen.dart';
import 'admin/admin_home_screen.dart';
import 'delivery/delivery_home_screen.dart';
import 'auth/login_screen.dart';

class HomeScreen extends ConsumerWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final authState = ref.watch(authProvider);

    if (authState.isLoading) {
      return const Scaffold(
        body: Center(
          child: CircularProgressIndicator(),
        ),
      );
    }

    if (!authState.isAuthenticated) {
      return const LoginScreen();
    }

    final user = authState.user!;

    if (user.isAdmin) {
      return const AdminHomeScreen();
    } else if (user.isDeliveryBoy) {
      return const DeliveryHomeScreen();
    } else {
      return const CustomerHomeScreen();
    }
  }
}
