class ApiConfig {
  static const String baseUrl = String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: 'https://03639c4fe206.ngrok-free.app',
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

  // Health check
  static const String health = '/health';
  static const String meta = '/meta';
}
