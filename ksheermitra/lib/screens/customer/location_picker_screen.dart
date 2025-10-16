import 'package:flutter/material.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:location/location.dart';

class LocationPickerScreen extends StatefulWidget {
  final LatLng? initialLocation;

  const LocationPickerScreen({
    super.key,
    this.initialLocation,
  });

  @override
  State<LocationPickerScreen> createState() => _LocationPickerScreenState();
}

class _LocationPickerScreenState extends State<LocationPickerScreen> {
  GoogleMapController? _mapController;
  LatLng? _selectedLocation;
  bool _isLoading = false;
  final Location _location = Location();

  @override
  void initState() {
    super.initState();
    _selectedLocation = widget.initialLocation;
    if (_selectedLocation == null) {
      _getCurrentLocation();
    }
  }

  Future<void> _getCurrentLocation() async {
    setState(() => _isLoading = true);

    try {
      // Check if location service is enabled
      bool serviceEnabled = await _location.serviceEnabled();
      if (!serviceEnabled) {
        serviceEnabled = await _location.requestService();
        if (!serviceEnabled) {
          if (mounted) {
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(content: Text('Location service is disabled')),
            );
          }
          setState(() => _isLoading = false);
          return;
        }
      }

      // Check if permission is granted
      PermissionStatus permission = await _location.hasPermission();
      if (permission == PermissionStatus.denied) {
        permission = await _location.requestPermission();
        if (permission != PermissionStatus.granted) {
          if (mounted) {
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(content: Text('Location permission denied')),
            );
          }
          setState(() => _isLoading = false);
          return;
        }
      }

      // Get current location
      final locationData = await _location.getLocation();
      
      if (mounted) {
        setState(() {
          _selectedLocation = LatLng(
            locationData.latitude!,
            locationData.longitude!,
          );
        });

        // Move camera to current location
        _mapController?.animateCamera(
          CameraUpdate.newLatLngZoom(_selectedLocation!, 15),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error getting location: $e')),
        );
      }
    } finally {
      setState(() => _isLoading = false);
    }
  }

  void _onMapCreated(GoogleMapController controller) {
    _mapController = controller;
    if (_selectedLocation != null) {
      controller.animateCamera(
        CameraUpdate.newLatLngZoom(_selectedLocation!, 15),
      );
    }
  }

  void _onMapTap(LatLng location) {
    setState(() {
      _selectedLocation = location;
    });
  }

  void _confirmLocation() {
    if (_selectedLocation != null) {
      Navigator.of(context).pop({
        'latitude': _selectedLocation!.latitude,
        'longitude': _selectedLocation!.longitude,
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Select Location'),
        actions: [
          IconButton(
            icon: const Icon(Icons.my_location),
            onPressed: _getCurrentLocation,
          ),
        ],
      ),
      body: Stack(
        children: [
          GoogleMap(
            onMapCreated: _onMapCreated,
            initialCameraPosition: CameraPosition(
              target: _selectedLocation ?? const LatLng(20.5937, 78.9629), // India center
              zoom: _selectedLocation != null ? 15 : 5,
            ),
            onTap: _onMapTap,
            markers: _selectedLocation != null
                ? {
                    Marker(
                      markerId: const MarkerId('selected'),
                      position: _selectedLocation!,
                      draggable: true,
                      onDragEnd: (newPosition) {
                        setState(() {
                          _selectedLocation = newPosition;
                        });
                      },
                    ),
                  }
                : {},
            myLocationEnabled: true,
            myLocationButtonEnabled: false,
          ),
          if (_isLoading)
            Container(
              color: Colors.black26,
              child: const Center(
                child: CircularProgressIndicator(),
              ),
            ),
          Positioned(
            bottom: 16,
            left: 16,
            right: 16,
            child: Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    if (_selectedLocation != null) ...[
                      Text(
                        'Selected Location',
                        style: Theme.of(context).textTheme.titleMedium,
                      ),
                      const SizedBox(height: 8),
                      Text(
                        'Lat: ${_selectedLocation!.latitude.toStringAsFixed(6)}',
                        style: Theme.of(context).textTheme.bodySmall,
                      ),
                      Text(
                        'Lng: ${_selectedLocation!.longitude.toStringAsFixed(6)}',
                        style: Theme.of(context).textTheme.bodySmall,
                      ),
                      const SizedBox(height: 16),
                    ] else ...[
                      Text(
                        'Tap on the map to select location',
                        style: Theme.of(context).textTheme.bodyMedium,
                      ),
                      const SizedBox(height: 16),
                    ],
                    SizedBox(
                      width: double.infinity,
                      child: ElevatedButton(
                        onPressed: _selectedLocation != null ? _confirmLocation : null,
                        child: const Text('Confirm Location'),
                      ),
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

  @override
  void dispose() {
    _mapController?.dispose();
    super.dispose();
  }
}
