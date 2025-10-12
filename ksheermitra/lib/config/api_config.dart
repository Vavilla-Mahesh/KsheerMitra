class ApiConfig {
  static const String baseUrl = String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: 'https://67cf32585ea4.ngrok-free.app',
  );

  // Auth endpoints
  static const String signup = '/auth/signup';
  static const String login = '/auth/login';
  static const String refresh = '/auth/refresh';
  static const String logout = '/auth/logout';

  // User endpoints
  static const String me = '/users/me';

  // Product endpoints
  static const String products = '/products';

  // Subscription endpoints
  static const String subscriptions = '/subscriptions';
  static String customerSubscriptions(String customerId) =>
      '/customers/$customerId/subscriptions';

  // Daily adjustment endpoints
  static String subscriptionAdjustments(String subscriptionId) =>
      '/subscriptions/$subscriptionId/adjustments';

  // Order endpoints
  static const String orders = '/orders';
  static String customerOrders(String customerId) =>
      '/customers/$customerId/orders';

  // Delivery endpoints
  static const String deliveryAssigned = '/delivery/assigned';
  static const String deliveryAll = '/delivery/all';
  static String deliveryStatus(String deliveryId) =>
      '/delivery/$deliveryId/status';

  // Billing endpoints
  static String customerBilling(String customerId) =>
      '/customers/$customerId/billing';

  // Admin endpoints
  static const String adminUsers = '/admin/users';
  static String adminUser(String userId) => '/admin/users/$userId';
  static String adminDeactivateUser(String userId) =>
      '/admin/users/$userId/deactivate';
  static const String adminDeliveryBoy = '/admin/delivery-boy';
  static const String adminAssignDelivery = '/admin/assign-delivery';
  static const String adminDashboard = '/admin/dashboard';

  // Health check
  static const String health = '/health';
  static const String meta = '/meta';
}
