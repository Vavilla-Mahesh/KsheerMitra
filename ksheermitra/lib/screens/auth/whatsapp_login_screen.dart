import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../config/theme_config.dart';
import 'whatsapp_otp_screen.dart';
import 'login_screen.dart';

class WhatsAppLoginScreen extends ConsumerStatefulWidget {
  const WhatsAppLoginScreen({super.key});

  @override
  ConsumerState<WhatsAppLoginScreen> createState() => _WhatsAppLoginScreenState();
}

class _WhatsAppLoginScreenState extends ConsumerState<WhatsAppLoginScreen> {
  final _formKey = GlobalKey<FormState>();
  final _phoneController = TextEditingController();
  bool _isLoading = false;

  @override
  void dispose() {
    _phoneController.dispose();
    super.dispose();
  }

  String _formatPhoneNumber(String phone) {
    // Remove all non-digit characters
    String digitsOnly = phone.replaceAll(RegExp(r'\D'), '');
    
    // Add country code if not present
    if (!digitsOnly.startsWith('91')) {
      digitsOnly = '91$digitsOnly';
    }
    
    // Add + prefix
    return '+$digitsOnly';
  }

  Future<void> _handleSendOtp() async {
    if (_formKey.currentState!.validate()) {
      setState(() => _isLoading = true);
      
      final whatsappNumber = _formatPhoneNumber(_phoneController.text);
      
      // Navigate to OTP verification screen
      if (mounted) {
        Navigator.of(context).push(
          MaterialPageRoute(
            builder: (context) => WhatsAppOtpScreen(
              whatsappNumber: whatsappNumber,
            ),
          ),
        );
      }
      
      setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: GradientBackground(
        child: SafeArea(
          child: Center(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(24),
              child: Form(
                key: _formKey,
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    Icon(
                      Icons.local_drink,
                      size: 80,
                      color: Theme.of(context).colorScheme.primary,
                    ),
                    const SizedBox(height: 24),
                    Text(
                      'KsheerMitra',
                      style: Theme.of(context).textTheme.headlineLarge,
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 8),
                    Text(
                      'Milk Delivery Management',
                      style: Theme.of(context).textTheme.bodyMedium,
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 48),
                    Text(
                      'Login with WhatsApp',
                      style: Theme.of(context).textTheme.titleLarge,
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 8),
                    Text(
                      'We\'ll send you an OTP on WhatsApp',
                      style: Theme.of(context).textTheme.bodySmall,
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 32),
                    TextFormField(
                      controller: _phoneController,
                      keyboardType: TextInputType.phone,
                      decoration: const InputDecoration(
                        labelText: 'WhatsApp Number',
                        prefixIcon: Icon(Icons.phone),
                        hintText: 'Enter 10-digit number',
                        prefixText: '+91 ',
                      ),
                      validator: (value) {
                        if (value == null || value.isEmpty) {
                          return 'Please enter your WhatsApp number';
                        }
                        final digitsOnly = value.replaceAll(RegExp(r'\D'), '');
                        if (digitsOnly.length != 10) {
                          return 'Please enter a valid 10-digit number';
                        }
                        return null;
                      },
                    ),
                    const SizedBox(height: 32),
                    ElevatedButton(
                      onPressed: _isLoading ? null : _handleSendOtp,
                      style: ElevatedButton.styleFrom(
                        padding: const EdgeInsets.symmetric(vertical: 16),
                      ),
                      child: _isLoading
                          ? const SizedBox(
                              height: 20,
                              width: 20,
                              child: CircularProgressIndicator(strokeWidth: 2),
                            )
                          : const Text('Send OTP'),
                    ),
                    const SizedBox(height: 16),
                    TextButton(
                      onPressed: () {
                        Navigator.of(context).pushReplacement(
                          MaterialPageRoute(
                            builder: (context) => const LoginScreen(),
                          ),
                        );
                      },
                      child: const Text('Login with Email instead'),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}
