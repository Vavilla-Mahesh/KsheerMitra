import { DataTypes } from 'sequelize';
import sequelize from '../config/sequelize.js';

const DeliveryStatus = sequelize.define('DeliveryStatus', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  deliveryBoyId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'delivery_boy_id',
    references: {
      model: 'users',
      key: 'id'
    }
  },
  customerId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'customer_id',
    references: {
      model: 'users',
      key: 'id'
    }
  },
  subscriptionId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'subscription_id',
    references: {
      model: 'subscriptions',
      key: 'id'
    }
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('PENDING', 'DELIVERED', 'MISSED'),
    allowNull: false,
    defaultValue: 'PENDING'
  }
}, {
  tableName: 'delivery_status',
  timestamps: true,
  underscored: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

export default DeliveryStatus;
