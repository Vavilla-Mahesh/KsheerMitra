import User from './User.js';
import Product from './Product.js';
import Subscription from './Subscription.js';
import DeliveryStatus from './DeliveryStatus.js';
import Invoice from './Invoice.js';
import AreaAssignment from './AreaAssignment.js';

// Define associations

// User - Subscription (One to Many)
User.hasMany(Subscription, {
  foreignKey: 'customerId',
  as: 'subscriptions'
});
Subscription.belongsTo(User, {
  foreignKey: 'customerId',
  as: 'customer'
});

// Product - Subscription (One to Many)
Product.hasMany(Subscription, {
  foreignKey: 'productId',
  as: 'subscriptions'
});
Subscription.belongsTo(Product, {
  foreignKey: 'productId',
  as: 'product'
});

// User - DeliveryStatus (One to Many - as delivery boy)
User.hasMany(DeliveryStatus, {
  foreignKey: 'deliveryBoyId',
  as: 'deliveriesAsDeliveryBoy'
});
DeliveryStatus.belongsTo(User, {
  foreignKey: 'deliveryBoyId',
  as: 'deliveryBoy'
});

// User - DeliveryStatus (One to Many - as customer)
User.hasMany(DeliveryStatus, {
  foreignKey: 'customerId',
  as: 'deliveries'
});
DeliveryStatus.belongsTo(User, {
  foreignKey: 'customerId',
  as: 'customer'
});

// Subscription - DeliveryStatus (One to Many)
Subscription.hasMany(DeliveryStatus, {
  foreignKey: 'subscriptionId',
  as: 'deliveryStatuses'
});
DeliveryStatus.belongsTo(Subscription, {
  foreignKey: 'subscriptionId',
  as: 'subscription'
});

// User - Invoice (One to Many - as generator)
User.hasMany(Invoice, {
  foreignKey: 'generatedBy',
  as: 'generatedInvoices'
});
Invoice.belongsTo(User, {
  foreignKey: 'generatedBy',
  as: 'generator'
});

// User - Invoice (One to Many - as target)
User.hasMany(Invoice, {
  foreignKey: 'targetUserId',
  as: 'receivedInvoices'
});
Invoice.belongsTo(User, {
  foreignKey: 'targetUserId',
  as: 'targetUser'
});

// User - AreaAssignment (One to Many)
User.hasMany(AreaAssignment, {
  foreignKey: 'deliveryBoyId',
  as: 'areaAssignments'
});
AreaAssignment.belongsTo(User, {
  foreignKey: 'deliveryBoyId',
  as: 'deliveryBoy'
});

export {
  User,
  Product,
  Subscription,
  DeliveryStatus,
  Invoice,
  AreaAssignment
};
