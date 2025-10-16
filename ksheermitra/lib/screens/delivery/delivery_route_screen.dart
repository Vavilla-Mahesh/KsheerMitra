import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import '../../models/delivery_area_model.dart';
import '../../services/delivery_management_service.dart';
import '../../services/api_service.dart';

class DeliveryRouteScreen extends ConsumerStatefulWidget {
  final String deliveryBoyId;
  final DateTime routeDate;

  const DeliveryRouteScreen({
    super.key,
    required this.deliveryBoyId,
    required this.routeDate,
  });

  @override
  ConsumerState<DeliveryRouteScreen> createState() => _DeliveryRouteScreenState();
}

class _DeliveryRouteScreenState extends ConsumerState<DeliveryRouteScreen> {
  GoogleMapController? _mapController;
  DeliveryRoute? _currentRoute;
  List<DeliveryLog> _deliveryLogs = [];
  bool _isLoading = false;
  String? _errorMessage;

  @override
  void initState() {
    super.initState();
    _loadRoute();
  }

  Future<void> _loadRoute() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      final service = DeliveryManagementService(ApiService());
      final routes = await service.getDeliveryBoyRoutes(
        widget.deliveryBoyId,
        routeDate: widget.routeDate.toIso8601String().split('T')[0],
      );

      if (routes.isNotEmpty) {
        _currentRoute = routes.first;
        
        // Load route details with logs
        final details = await service.getRouteDetails(_currentRoute!.id);
        setState(() {
          _deliveryLogs = (details['logs'] as List)
              .map((json) => DeliveryLog.fromJson(json))
              .toList();
        });
      }
    } catch (e) {
      setState(() => _errorMessage = e.toString());
    } finally {
      setState(() => _isLoading = false);
    }
  }

  Future<void> _startRoute() async {
    if (_currentRoute == null) return;

    try {
      final service = DeliveryManagementService(ApiService());
      await service.updateRouteStatus(_currentRoute!.id, 'in_progress');
      
      setState(() {
        _currentRoute = DeliveryRoute(
          id: _currentRoute!.id,
          deliveryBoyId: _currentRoute!.deliveryBoyId,
          routeDate: _currentRoute!.routeDate,
          customerIds: _currentRoute!.customerIds,
          routeData: _currentRoute!.routeData,
          totalDistance: _currentRoute!.totalDistance,
          estimatedDuration: _currentRoute!.estimatedDuration,
          status: 'in_progress',
          startedAt: DateTime.now(),
          completedAt: _currentRoute!.completedAt,
          createdAt: _currentRoute!.createdAt,
          updatedAt: DateTime.now(),
        );
      });

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Route started')),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error: $e')),
        );
      }
    }
  }

  Future<void> _completeDelivery(DeliveryLog log) async {
    try {
      final service = DeliveryManagementService(ApiService());
      await service.updateDeliveryLog(log.id, 'completed');
      
      // Reload logs
      await _loadRoute();

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Delivery marked as completed')),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error: $e')),
        );
      }
    }
  }

  Future<void> _completeRoute() async {
    if (_currentRoute == null) return;

    // Check if all deliveries are completed
    final pendingDeliveries = _deliveryLogs.where((log) => log.status != 'completed').toList();
    if (pendingDeliveries.isNotEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please complete all deliveries first')),
      );
      return;
    }

    try {
      final service = DeliveryManagementService(ApiService());
      await service.updateRouteStatus(_currentRoute!.id, 'completed');
      
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Route completed!')),
        );
        Navigator.of(context).pop();
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error: $e')),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return Scaffold(
        appBar: AppBar(title: const Text('Delivery Route')),
        body: const Center(child: CircularProgressIndicator()),
      );
    }

    if (_errorMessage != null) {
      return Scaffold(
        appBar: AppBar(title: const Text('Delivery Route')),
        body: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Text(_errorMessage!),
              const SizedBox(height: 16),
              ElevatedButton(
                onPressed: _loadRoute,
                child: const Text('Retry'),
              ),
            ],
          ),
        ),
      );
    }

    if (_currentRoute == null) {
      return Scaffold(
        appBar: AppBar(title: const Text('Delivery Route')),
        body: const Center(
          child: Text('No route found for today'),
        ),
      );
    }

    return Scaffold(
      appBar: AppBar(
        title: const Text('Delivery Route'),
        actions: [
          if (_currentRoute!.status == 'pending')
            IconButton(
              icon: const Icon(Icons.play_arrow),
              onPressed: _startRoute,
              tooltip: 'Start Route',
            ),
          if (_currentRoute!.status == 'in_progress')
            IconButton(
              icon: const Icon(Icons.check),
              onPressed: _completeRoute,
              tooltip: 'Complete Route',
            ),
        ],
      ),
      body: Column(
        children: [
          // Route summary card
          Card(
            margin: const EdgeInsets.all(16),
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Route Summary',
                    style: Theme.of(context).textTheme.titleLarge,
                  ),
                  const SizedBox(height: 8),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text('Distance: ${_currentRoute!.getFormattedDistance()}'),
                      Text('Duration: ${_currentRoute!.getFormattedDuration()}'),
                      Text('Stops: ${_deliveryLogs.length}'),
                    ],
                  ),
                  const SizedBox(height: 8),
                  LinearProgressIndicator(
                    value: _deliveryLogs.isEmpty
                        ? 0
                        : _deliveryLogs.where((log) => log.status == 'completed').length /
                            _deliveryLogs.length,
                  ),
                ],
              ),
            ),
          ),
          // Delivery list
          Expanded(
            child: ListView.builder(
              itemCount: _deliveryLogs.length,
              itemBuilder: (context, index) {
                final log = _deliveryLogs[index];
                final isCompleted = log.status == 'completed';
                
                return Card(
                  margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
                  child: ListTile(
                    leading: CircleAvatar(
                      backgroundColor: isCompleted ? Colors.green : Colors.orange,
                      child: Text('${log.deliveryOrder}'),
                    ),
                    title: Text(log.customerName ?? 'Customer ${log.customerId}'),
                    subtitle: Text(log.whatsappNumber ?? 'No contact'),
                    trailing: isCompleted
                        ? const Icon(Icons.check_circle, color: Colors.green)
                        : ElevatedButton(
                            onPressed: () => _completeDelivery(log),
                            child: const Text('Complete'),
                          ),
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }

  @override
  void dispose() {
    _mapController?.dispose();
    super.dispose();
  }
}
