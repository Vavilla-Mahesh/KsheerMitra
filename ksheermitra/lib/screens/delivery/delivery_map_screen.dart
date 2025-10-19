import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:geolocator/geolocator.dart';
import '../../services/delivery_service.dart';
import '../../providers/api_provider.dart';
import 'dart:async';

class DeliveryMapScreen extends ConsumerStatefulWidget {
  const DeliveryMapScreen({super.key});

  @override
  ConsumerState<DeliveryMapScreen> createState() => _DeliveryMapScreenState();
}

class _DeliveryMapScreenState extends ConsumerState<DeliveryMapScreen> {
  GoogleMapController? _mapController;
  Position? _currentPosition;
  List<dynamic> _customers = [];
  Map<String, dynamic>? _routeData;
  Set<Marker> _markers = {};
  Set<Polyline> _polylines = {};
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _initializeMap();
  }

  @override
  void dispose() {
    _mapController?.dispose();
    super.dispose();
  }

  Future<void> _initializeMap() async {
    try {
      // Get current location
      await _getCurrentLocation();
      
      // Fetch assigned customers
      await _fetchAssignedCustomers();
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Error initializing map: $e'),
            backgroundColor: Colors.red,
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
      }
    }
  }

  Future<void> _getCurrentLocation() async {
    try {
      LocationPermission permission = await Geolocator.checkPermission();
      if (permission == LocationPermission.denied) {
        permission = await Geolocator.requestPermission();
      }

      if (permission == LocationPermission.denied ||
          permission == LocationPermission.deniedForever) {
        throw Exception('Location permission denied');
      }

      final position = await Geolocator.getCurrentPosition();
      setState(() {
        _currentPosition = position;
      });
    } catch (e) {
      rethrow;
    }
  }

  Future<void> _fetchAssignedCustomers() async {
    try {
      final apiService = ref.read(apiServiceProvider);
      final deliveryService = DeliveryService(apiService);

      final result = await deliveryService.getAssignedCustomers();

      if (result['success']) {
        setState(() {
          _customers = result['customers'] ?? [];
          _routeData = result['route'];
          _updateMarkers();
          _updatePolylines();
        });

        // Move camera to show all markers
        if (_customers.isNotEmpty) {
          _fitBoundsToMarkers();
        }
      }
    } catch (e) {
      rethrow;
    }
  }

  void _updateMarkers() {
    final markers = <Marker>{};

    // Add current position marker
    if (_currentPosition != null) {
      markers.add(
        Marker(
          markerId: const MarkerId('current_location'),
          position: LatLng(
            _currentPosition!.latitude,
            _currentPosition!.longitude,
          ),
          icon: BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueBlue),
          infoWindow: const InfoWindow(title: 'Your Location'),
        ),
      );
    }

    // Add customer markers
    for (var i = 0; i < _customers.length; i++) {
      final customer = _customers[i];
      if (customer['latitude'] != null && customer['longitude'] != null) {
        markers.add(
          Marker(
            markerId: MarkerId(customer['id'].toString()),
            position: LatLng(
              customer['latitude'].toDouble(),
              customer['longitude'].toDouble(),
            ),
            icon: _getMarkerIcon(customer['status']),
            infoWindow: InfoWindow(
              title: customer['customerName'],
              snippet: '${customer['product']} x ${customer['quantity']}',
            ),
            onTap: () => _showCustomerDetails(customer),
          ),
        );
      }
    }

    setState(() {
      _markers = markers;
    });
  }

  BitmapDescriptor _getMarkerIcon(String status) {
    switch (status) {
      case 'DELIVERED':
        return BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueGreen);
      case 'MISSED':
        return BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueRed);
      default:
        return BitmapDescriptor.defaultMarkerWithHue(
            BitmapDescriptor.hueOrange);
    }
  }

  void _updatePolylines() {
    // TODO: Decode polyline from route data and add to map
    // This requires implementing polyline decoding algorithm
  }

  void _fitBoundsToMarkers() {
    if (_mapController == null || _markers.isEmpty) return;

    double minLat = double.infinity;
    double maxLat = -double.infinity;
    double minLng = double.infinity;
    double maxLng = -double.infinity;

    for (final marker in _markers) {
      minLat = marker.position.latitude < minLat ? marker.position.latitude : minLat;
      maxLat = marker.position.latitude > maxLat ? marker.position.latitude : maxLat;
      minLng = marker.position.longitude < minLng ? marker.position.longitude : minLng;
      maxLng = marker.position.longitude > maxLng ? marker.position.longitude : maxLng;
    }

    final bounds = LatLngBounds(
      southwest: LatLng(minLat, minLng),
      northeast: LatLng(maxLat, maxLng),
    );

    _mapController!.animateCamera(CameraUpdate.newLatLngBounds(bounds, 50));
  }

  void _showCustomerDetails(dynamic customer) {
    showModalBottomSheet(
      context: context,
      builder: (context) => _CustomerDetailsSheet(
        customer: customer,
        onStatusUpdate: _handleStatusUpdate,
      ),
    );
  }

  Future<void> _handleStatusUpdate(String deliveryStatusId, String status) async {
    try {
      final apiService = ref.read(apiServiceProvider);
      final deliveryService = DeliveryService(apiService);

      final result = await deliveryService.updateDeliveryStatus(
        deliveryStatusId: deliveryStatusId,
        status: status,
      );

      if (!mounted) return;

      if (result['success']) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(result['message'] ?? 'Status updated'),
            backgroundColor: Colors.green,
          ),
        );
        Navigator.pop(context);
        await _fetchAssignedCustomers();
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(result['message'] ?? 'Failed to update status'),
            backgroundColor: Colors.red,
          ),
        );
      }
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Error: $e'),
          backgroundColor: Colors.red,
        ),
      );
    }
  }

  Future<void> _generateDailyInvoice() async {
    try {
      final apiService = ref.read(apiServiceProvider);
      final deliveryService = DeliveryService(apiService);

      final result = await deliveryService.generateDailyInvoice();

      if (!mounted) return;

      if (result['success']) {
        showDialog(
          context: context,
          builder: (context) => AlertDialog(
            title: const Text('Invoice Generated'),
            content: Text(result['message'] ?? 'Daily invoice has been generated and sent to admin'),
            actions: [
              TextButton(
                onPressed: () => Navigator.pop(context),
                child: const Text('OK'),
              ),
            ],
          ),
        );
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(result['message'] ?? 'Failed to generate invoice'),
            backgroundColor: Colors.red,
          ),
        );
      }
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Error: $e'),
          backgroundColor: Colors.red,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Delivery Map'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: _fetchAssignedCustomers,
          ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _currentPosition == null
              ? const Center(child: Text('Unable to get location'))
              : GoogleMap(
                  initialCameraPosition: CameraPosition(
                    target: LatLng(
                      _currentPosition!.latitude,
                      _currentPosition!.longitude,
                    ),
                    zoom: 14,
                  ),
                  markers: _markers,
                  polylines: _polylines,
                  myLocationEnabled: true,
                  myLocationButtonEnabled: true,
                  onMapCreated: (controller) {
                    _mapController = controller;
                  },
                ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: _generateDailyInvoice,
        icon: const Icon(Icons.receipt),
        label: const Text('End Day'),
      ),
    );
  }
}

class _CustomerDetailsSheet extends StatelessWidget {
  final dynamic customer;
  final Function(String, String) onStatusUpdate;

  const _CustomerDetailsSheet({
    required this.customer,
    required this.onStatusUpdate,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            customer['customerName'],
            style: const TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 8),
          Text('Phone: ${customer['customerPhone']}'),
          Text('Address: ${customer['customerAddress']}'),
          const Divider(height: 24),
          Text('Product: ${customer['product']}'),
          Text('Quantity: ${customer['quantity']}'),
          Text('Price: ₹${customer['price']}'),
          const SizedBox(height: 16),
          Text(
            'Status: ${customer['status']}',
            style: TextStyle(
              fontWeight: FontWeight.bold,
              color: _getStatusColor(customer['status']),
            ),
          ),
          const SizedBox(height: 16),
          if (customer['status'] == 'PENDING') ...[
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceEvenly,
              children: [
                Expanded(
                  child: ElevatedButton.icon(
                    onPressed: () => onStatusUpdate(
                      customer['id'].toString(),
                      'DELIVERED',
                    ),
                    icon: const Icon(Icons.check),
                    label: const Text('Delivered'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.green,
                    ),
                  ),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: ElevatedButton.icon(
                    onPressed: () => onStatusUpdate(
                      customer['id'].toString(),
                      'MISSED',
                    ),
                    icon: const Icon(Icons.close),
                    label: const Text('Missed'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.red,
                    ),
                  ),
                ),
              ],
            ),
          ],
        ],
      ),
    );
  }

  Color _getStatusColor(String status) {
    switch (status) {
      case 'DELIVERED':
        return Colors.green;
      case 'MISSED':
        return Colors.red;
      default:
        return Colors.orange;
    }
  }
}
