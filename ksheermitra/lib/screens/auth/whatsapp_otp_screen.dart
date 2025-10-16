import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../config/theme_config.dart';
import '../../services/whatsapp_auth_service.dart';
import '../../services/api_service.dart';
import 'whatsapp_signup_screen.dart';

class WhatsAppOtpScreen extends ConsumerStatefulWidget {
  final String whatsappNumber;

  const WhatsAppOtpScreen({
    super.key,
    required this.whatsappNumber,
  });

  @override
  ConsumerState<WhatsAppOtpScreen> createState() => _WhatsAppOtpScreenState();
}

class _WhatsAppOtpScreenState extends ConsumerState<WhatsAppOtpScreen> {
  final _formKey = GlobalKey<FormState>();
  final _otpController = TextEditingController();
  bool _isLoading = false;
  bool _isResending = false;
  String? _errorMessage;

  @override
  void initState() {
    super.initState();
    _sendOtp();
  }

  @override
  void dispose() {
    _otpController.dispose();
    super.dispose();
  }

  Future<void> _sendOtp() async {
    setState(() {
      _isResending = true;
      _errorMessage = null;
    });

    try {
      final authService = WhatsAppAuthService(ApiService());
      await authService.sendOtp(widget.whatsappNumber);
      
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('OTP sent to WhatsApp')),
        );
      }
    } catch (e) {
      setState(() => _errorMessage = e.toString());
    } finally {
      setState(() => _isResending = false);
    }
  }

  Future<void> _handleVerifyOtp() async {
    if (_formKey.currentState!.validate()) {
      setState(() {
        _isLoading = true;
        _errorMessage = null;
      });

      try {
        final authService = WhatsAppAuthService(ApiService());
        final result = await authService.verifyOtp(
          widget.whatsappNumber,
          _otpController.text,
        );

        if (mounted) {
          if (result['userExists'] == true) {
            // User exists, log them in
            // Store tokens and navigate to home
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(content: Text('Login successful')),
            );
            Navigator.of(context).pushReplacementNamed('/home');
          } else {
            // New user, proceed to signup
            Navigator.of(context).pushReplacement(
              MaterialPageRoute(
                builder: (context) => WhatsAppSignupScreen(
                  whatsappNumber: widget.whatsappNumber,
                ),
              ),
            );
          }
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
        title: const Text('Verify OTP'),
      ),
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
                      Icons.message,
                      size: 80,
                      color: Theme.of(context).colorScheme.primary,
                    ),
                    const SizedBox(height: 24),
                    Text(
                      'Enter OTP',
                      style: Theme.of(context).textTheme.headlineMedium,
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 8),
                    Text(
                      'OTP sent to ${widget.whatsappNumber}',
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
                      controller: _otpController,
                      keyboardType: TextInputType.number,
                      textAlign: TextAlign.center,
                      maxLength: 6,
                      style: const TextStyle(
                        fontSize: 24,
                        letterSpacing: 8,
                        fontWeight: FontWeight.bold,
                      ),
                      decoration: const InputDecoration(
                        labelText: 'OTP',
                        hintText: '000000',
                        counterText: '',
                      ),
                      validator: (value) {
                        if (value == null || value.isEmpty) {
                          return 'Please enter OTP';
                        }
                        if (value.length != 6) {
                          return 'OTP must be 6 digits';
                        }
                        return null;
                      },
                    ),
                    const SizedBox(height: 32),
                    ElevatedButton(
                      onPressed: _isLoading ? null : _handleVerifyOtp,
                      style: ElevatedButton.styleFrom(
                        padding: const EdgeInsets.symmetric(vertical: 16),
                      ),
                      child: _isLoading
                          ? const SizedBox(
                              height: 20,
                              width: 20,
                              child: CircularProgressIndicator(strokeWidth: 2),
                            )
                          : const Text('Verify OTP'),
                    ),
                    const SizedBox(height: 16),
                    TextButton(
                      onPressed: _isResending ? null : _sendOtp,
                      child: _isResending
                          ? const Text('Resending...')
                          : const Text('Resend OTP'),
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
