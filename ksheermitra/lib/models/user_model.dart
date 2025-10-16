class User {
  final String id;
  final String name;
  final String phone;
  final String? email;
  final String location;
  final String role;
  final String? status;
  final String? whatsappNumber;
  final bool? whatsappVerified;
  final double? latitude;
  final double? longitude;
  final String? addressManual;
  final String? areaId;
  final DateTime createdAt;
  final DateTime updatedAt;

  User({
    required this.id,
    required this.name,
    required this.phone,
    this.email,
    required this.location,
    required this.role,
    this.status,
    this.whatsappNumber,
    this.whatsappVerified,
    this.latitude,
    this.longitude,
    this.addressManual,
    this.areaId,
    required this.createdAt,
    required this.updatedAt,
  });

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id'],
      name: json['name'],
      phone: json['phone'],
      email: json['email'],
      location: json['location'],
      role: json['role'],
      status: json['status'],
      whatsappNumber: json['whatsapp_number'],
      whatsappVerified: json['whatsapp_verified'],
      latitude: json['latitude']?.toDouble(),
      longitude: json['longitude']?.toDouble(),
      addressManual: json['address_manual'],
      areaId: json['area_id'],
      createdAt: DateTime.parse(json['created_at']),
      updatedAt: DateTime.parse(json['updated_at']),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'phone': phone,
      'email': email,
      'location': location,
      'role': role,
      'status': status,
      'whatsapp_number': whatsappNumber,
      'whatsapp_verified': whatsappVerified,
      'latitude': latitude,
      'longitude': longitude,
      'address_manual': addressManual,
      'area_id': areaId,
      'created_at': createdAt.toIso8601String(),
      'updated_at': updatedAt.toIso8601String(),
    };
  }

  bool get isAdmin => role == 'admin';
  bool get isCustomer => role == 'customer';
  bool get isDeliveryBoy => role == 'delivery_boy';
  bool get isActive => status == 'active' || status == null;
  bool get hasLocation => latitude != null && longitude != null;
}
