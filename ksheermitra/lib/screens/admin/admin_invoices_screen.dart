import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import '../../services/invoice_service.dart';
import '../../providers/api_provider.dart';

class AdminInvoicesScreen extends ConsumerStatefulWidget {
  const AdminInvoicesScreen({super.key});

  @override
  ConsumerState<AdminInvoicesScreen> createState() => _AdminInvoicesScreenState();
}

class _AdminInvoicesScreenState extends ConsumerState<AdminInvoicesScreen> {
  List<dynamic> _invoices = [];
  bool _isLoading = true;
  String? _selectedCustomerId;

  @override
  void initState() {
    super.initState();
    _fetchInvoices();
  }

  Future<void> _fetchInvoices() async {
    setState(() {
      _isLoading = true;
    });

    try {
      if (_selectedCustomerId != null) {
        final apiService = ref.read(apiServiceProvider);
        final invoiceService = InvoiceService(apiService);

        final result = await invoiceService.getCustomerInvoices(
          customerId: _selectedCustomerId!,
        );

        if (result['success']) {
          setState(() {
            _invoices = result['invoices'] ?? [];
          });
        }
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Error fetching invoices: $e'),
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

  Future<void> _generateMonthlyInvoice(String customerId) async {
    try {
      final apiService = ref.read(apiServiceProvider);
      final invoiceService = InvoiceService(apiService);

      final result = await invoiceService.generateMonthlyInvoice(
        customerId: customerId,
      );

      if (!mounted) return;

      if (result['success']) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(result['message'] ?? 'Invoice generated successfully'),
            backgroundColor: Colors.green,
          ),
        );
        await _fetchInvoices();
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
        title: const Text('Invoices'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: _fetchInvoices,
          ),
        ],
      ),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(16.0),
            child: Row(
              children: [
                Expanded(
                  child: TextField(
                    decoration: const InputDecoration(
                      labelText: 'Customer ID',
                      border: OutlineInputBorder(),
                      hintText: 'Enter customer ID',
                    ),
                    onChanged: (value) {
                      setState(() {
                        _selectedCustomerId = value.isNotEmpty ? value : null;
                      });
                    },
                  ),
                ),
                const SizedBox(width: 8),
                ElevatedButton(
                  onPressed: _selectedCustomerId != null ? _fetchInvoices : null,
                  child: const Text('Load'),
                ),
              ],
            ),
          ),
          if (_selectedCustomerId != null)
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16.0),
              child: ElevatedButton.icon(
                onPressed: () => _generateMonthlyInvoice(_selectedCustomerId!),
                icon: const Icon(Icons.add),
                label: const Text('Generate Monthly Invoice'),
              ),
            ),
          const Divider(),
          Expanded(
            child: _isLoading
                ? const Center(child: CircularProgressIndicator())
                : _invoices.isEmpty
                    ? const Center(
                        child: Text('No invoices found'),
                      )
                    : ListView.builder(
                        itemCount: _invoices.length,
                        itemBuilder: (context, index) {
                          final invoice = _invoices[index];
                          return _InvoiceCard(invoice: invoice);
                        },
                      ),
          ),
        ],
      ),
    );
  }
}

class _InvoiceCard extends StatelessWidget {
  final dynamic invoice;

  const _InvoiceCard({required this.invoice});

  @override
  Widget build(BuildContext context) {
    final dateFormat = DateFormat('dd MMM yyyy');
    final date = invoice['date'] != null 
        ? dateFormat.format(DateTime.parse(invoice['date']))
        : 'N/A';

    return Card(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      child: ListTile(
        leading: CircleAvatar(
          backgroundColor: invoice['type'] == 'DAILY' 
              ? Colors.blue 
              : Colors.green,
          child: Icon(
            invoice['type'] == 'DAILY' 
                ? Icons.today 
                : Icons.calendar_month,
            color: Colors.white,
          ),
        ),
        title: Text(
          '${invoice['type']} Invoice',
          style: const TextStyle(fontWeight: FontWeight.bold),
        ),
        subtitle: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Date: $date'),
            Text('Amount: ₹${invoice['amount']}'),
            if (invoice['sent_via_whatsapp'] == true)
              const Row(
                children: [
                  Icon(Icons.check, size: 16, color: Colors.green),
                  SizedBox(width: 4),
                  Text(
                    'Sent via WhatsApp',
                    style: TextStyle(color: Colors.green, fontSize: 12),
                  ),
                ],
              ),
          ],
        ),
        trailing: IconButton(
          icon: const Icon(Icons.visibility),
          onPressed: () {
            // TODO: Open PDF viewer
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                content: Text('PDF Path: ${invoice['pdf_path'] ?? 'N/A'}'),
              ),
            );
          },
        ),
      ),
    );
  }
}
