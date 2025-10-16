import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../config/theme_config.dart';
import '../../services/whatsapp_auth_service.dart';
import '../../services/api_service.dart';
import '../customer/location_picker_screen.dart';

class WhatsAppSignupScreen extends ConsumerStatefulWidget {
  final String whatsappNumber;

  const WhatsAppSignupScreen({
    super.key,
    required this.whatsappNumber,
  });

  @override
  ConsumerState<WhatsAppSignupScreen> createState() => _WhatsAppSignupScreenState();
}

class _WhatsAppSignupScreenState extends ConsumerState<WhatsAppSignupScreen> {
  final _formKey = GlobalKey<FormState>();
  final _nameController = TextEditingController();
  final _phoneController = TextEditingController();
  final _addressController = TextEditingController();
  
  double? _latitude;
  double? _longitude;
  bool _isLoading = false;
  String? _errorMessage;

  @override
  void initState() {
    super.initState();
    _phoneController.text = widget.whatsappNumber;
  }

  @override
  void dispose() {
    _nameController.dispose();
    _phoneController.dispose();
    _addressController.dispose();
    super.dispose();
  }

  Future<void> _pickLocation() async {
    final result = await Navigator.of(context).push<Map<String, dynamic>>(
      MaterialPageRoute(
        builder: (context) => const LocationPickerScreen(),
      ),
    );

    if (result != null) {
      setState(() {
        _latitude = result['latitude'];
        _longitude = result['longitude'];
        if (result['address'] != null) {
          _addressController.text = result['address'];
        }
      });
    }
  }

  Future<void> _handleSignup() async {
    if (_formKey.currentState!.validate()) {
      if (_latitude == null || _longitude == null) {
        setState(() => _errorMessage = 'Please select your location on the map');
        return;
      }

      setState(() {
        _isLoading = true;
        _errorMessage = null;
      });

      try {
        final authService = WhatsAppAuthService(ApiService());
        await authService.completeSignup(
          name: _nameController.text,
          whatsappNumber: widget.whatsappNumber,
          phone: _phoneController.text,
          latitude: _latitude!,
          longitude: _longitude!,
          addressManual: _addressController.text.isNotEmpty 
              ? _addressController.text 
              : null,
        );

        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Signup successful')),
          );
          Navigator.of(context).pushReplacementNamed('/home');
        }
      } catch (e) {
        setState(() => _errorMessage = e.toString());
      } finally {
        setState(() => _isLoading = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Complete Signup'),
      ),
      body: GradientBackground(
        child: SafeArea(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(24),
            child: Form(
              key: _formKey,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  Text(
                    'Welcome to KsheerMitra',
                    style: Theme.of(context).textTheme.headlineMedium,
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'Please complete your profile',
                    style: Theme.of(context).textTheme.bodyMedium,
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 32),
                  if (_errorMessage != null)
                    Container(
                      padding: const EdgeInsets.all(12),
                      margin: const EdgeInsets.only(bottom: 16),
                      decoration: BoxDecoration(
                        color: Colors.red.withOpacity(0.1),
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(color: Colors.red),
                      ),
                      child: Text(
                        _errorMessage!,
                        style: const TextStyle(color: Colors.red),
                        textAlign: TextAlign.center,
                      ),
                    ),
                  TextFormField(
                    controller: _nameController,
                    decoration: const InputDecoration(
                      labelText: 'Full Name',
                      prefixIcon: Icon(Icons.person),
                    ),
                    validator: (value) {
                      if (value == null || value.isEmpty) {
                        return 'Please enter your name';
                      }
                      if (value.length < 2) {
                        return 'Name must be at least 2 characters';
                      }
                      return null;
                    },
                  ),
                  const SizedBox(height: 16),
                  TextFormField(
                    controller: _phoneController,
                    keyboardType: TextInputType.phone,
                    decoration: const InputDecoration(
                      labelText: 'WhatsApp Number',
                      prefixIcon: Icon(Icons.phone),
                    ),
                    enabled: false,
                  ),
                  const SizedBox(height: 16),
                  TextFormField(
                    controller: _addressController,
                    maxLines: 2,
                    decoration: const InputDecoration(
                      labelText: 'Address (Optional)',
                      prefixIcon: Icon(Icons.home),
                      hintText: 'Enter your delivery address',
                    ),
                  ),
                  const SizedBox(height: 24),
                  OutlinedButton.icon(
                    onPressed: _pickLocation,
                    icon: const Icon(Icons.location_on),
                    label: Text(
                      _latitude != null && _longitude != null
                          ? 'Location Selected'
                          : 'Select Location on Map',
                    ),
                    style: OutlinedButton.styleFrom(
                      padding: const EdgeInsets.symmetric(vertical: 16),
                      side: BorderSide(
                        color: _latitude != null && _longitude != null
                            ? Colors.green
                            : Theme.of(context).colorScheme.primary,
                      ),
                    ),
                  ),
                  if (_latitude != null && _longitude != null)
                    Padding(
                      padding: const EdgeInsets.only(top: 8),
                      child: Text(
                        'Lat: ${_latitude!.toStringAsFixed(6)}, Lng: ${_longitude!.toStringAsFixed(6)}',
                        style: Theme.of(context).textTheme.bodySmall,
                        textAlign: TextAlign.center,
                      ),
                    ),
                  const SizedBox(height: 32),
                  ElevatedButton(
                    onPressed: _isLoading ? null : _handleSignup,
                    style: ElevatedButton.styleFrom(
                      padding: const EdgeInsets.symmetric(vertical: 16),
                    ),
                    child: _isLoading
                        ? const SizedBox(
                            height: 20,
                            width: 20,
                            child: CircularProgressIndicator(strokeWidth: 2),
                          )
                        : const Text('Complete Signup'),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
