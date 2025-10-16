import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import '../../models/delivery_area_model.dart' as model;
import '../../services/delivery_management_service.dart';
import '../../services/api_service.dart';

class DeliveryAreaManagementScreen extends ConsumerStatefulWidget {
  const DeliveryAreaManagementScreen({super.key});

  @override
  ConsumerState<DeliveryAreaManagementScreen> createState() =>
      _DeliveryAreaManagementScreenState();
}

class _DeliveryAreaManagementScreenState
    extends ConsumerState<DeliveryAreaManagementScreen> {
  GoogleMapController? _mapController;
  List<Map<String, dynamic>> _customers = [];
  List<model.DeliveryArea> _areas = [];
  Set<Marker> _markers = {};
  bool _isLoading = false;
  String? _errorMessage;

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      final service = DeliveryManagementService(ApiService());
      final customers = await service.getCustomersWithLocation();
      final areas = await service.getDeliveryAreas();

      setState(() {
        _customers = customers;
        _areas = areas;
        _updateMarkers();
      });
    } catch (e) {
      setState(() => _errorMessage = e.toString());
    } finally {
      setState(() => _isLoading = false);
    }
  }

  void _updateMarkers() {
    _markers = _customers.map((customer) {
      return Marker(
        markerId: MarkerId(customer['id']),
        position: LatLng(
          customer['latitude'].toDouble(),
          customer['longitude'].toDouble(),
        ),
        infoWindow: InfoWindow(
          title: customer['name'],
          snippet: customer['whatsapp_number'] ?? customer['phone'],
        ),
      );
    }).toSet();
  }

  void _onMapCreated(GoogleMapController controller) {
    _mapController = controller;
    
    // Move camera to show all markers
    if (_customers.isNotEmpty) {
      double minLat = _customers.first['latitude'].toDouble();
      double maxLat = _customers.first['latitude'].toDouble();
      double minLng = _customers.first['longitude'].toDouble();
      double maxLng = _customers.first['longitude'].toDouble();

      for (var customer in _customers) {
        final lat = customer['latitude'].toDouble();
        final lng = customer['longitude'].toDouble();
        
        if (lat < minLat) minLat = lat;
        if (lat > maxLat) maxLat = lat;
        if (lng < minLng) minLng = lng;
        if (lng > maxLng) maxLng = lng;
      }

      controller.animateCamera(
        CameraUpdate.newLatLngBounds(
          LatLngBounds(
            southwest: LatLng(minLat, minLng),
            northeast: LatLng(maxLat, maxLng),
          ),
          100, // padding
        ),
      );
    }
  }

  void _showCreateAreaDialog() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Create Delivery Area'),
        content: const Text(
          'To create a delivery area:\n\n'
          '1. Draw a polygon on the map\n'
          '2. Select customers within the area\n'
          '3. Assign to a delivery boy\n\n'
          'This feature requires advanced map drawing tools.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('OK'),
          ),
        ],
      ),
    );
  }

  void _showAreasList() {
    showModalBottomSheet(
      context: context,
      builder: (context) => ListView.builder(
        itemCount: _areas.length,
        itemBuilder: (context, index) {
          final area = _areas[index];
          return ListTile(
            title: Text(area.name),
            subtitle: Text(area.description ?? 'No description'),
            trailing: Text('${area.polygonCoordinates.length} points'),
            onTap: () {
              // Show area details
              Navigator.of(context).pop();
              _showAreaDetails(area);
            },
          );
        },
      ),
    );
  }

  void _showAreaDetails(model.DeliveryArea area) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(area.name),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            if (area.description != null)
              Text('Description: ${area.description}'),
            const SizedBox(height: 8),
            Text('Polygon Points: ${area.polygonCoordinates.length}'),
            Text('Active: ${area.isActive ? "Yes" : "No"}'),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('Close'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Delivery Area Management'),
        actions: [
          IconButton(
            icon: const Icon(Icons.list),
            onPressed: _showAreasList,
            tooltip: 'View Areas',
          ),
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: _loadData,
            tooltip: 'Refresh',
          ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _errorMessage != null
              ? Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text(_errorMessage!),
                      const SizedBox(height: 16),
                      ElevatedButton(
                        onPressed: _loadData,
                        child: const Text('Retry'),
                      ),
                    ],
                  ),
                )
              : Column(
                  children: [
                    Card(
                      margin: const EdgeInsets.all(16),
                      child: Padding(
                        padding: const EdgeInsets.all(16),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.spaceAround,
                          children: [
                            Column(
                              children: [
                                Text(
                                  '${_customers.length}',
                                  style: Theme.of(context).textTheme.headlineMedium,
                                ),
                                const Text('Customers'),
                              ],
                            ),
                            Column(
                              children: [
                                Text(
                                  '${_areas.length}',
                                  style: Theme.of(context).textTheme.headlineMedium,
                                ),
                                const Text('Areas'),
                              ],
                            ),
                          ],
                        ),
                      ),
                    ),
                    Expanded(
                      child: GoogleMap(
                        onMapCreated: _onMapCreated,
                        initialCameraPosition: const CameraPosition(
                          target: LatLng(20.5937, 78.9629), // India center
                          zoom: 5,
                        ),
                        markers: _markers,
                        myLocationEnabled: true,
                        myLocationButtonEnabled: true,
                      ),
                    ),
                  ],
                ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: _showCreateAreaDialog,
        icon: const Icon(Icons.add),
        label: const Text('Create Area'),
      ),
    );
  }

  @override
  void dispose() {
    _mapController?.dispose();
    super.dispose();
  }
}
