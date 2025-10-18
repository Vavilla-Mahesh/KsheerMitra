import { DataTypes } from 'sequelize';
import sequelize from '../config/sequelize.js';

const Subscription = sequelize.define('Subscription', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
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
  productId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'product_id',
    references: {
      model: 'products',
      key: 'id'
    }
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1
    }
  },
  type: {
    type: DataTypes.ENUM('MONTHLY', 'CUSTOM', 'SPECIFIC_DAYS'),
    allowNull: false,
    defaultValue: 'MONTHLY'
  },
  startDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    field: 'start_date'
  },
  endDate: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    field: 'end_date'
  },
  active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  daysOfWeek: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'days_of_week',
    comment: 'JSON array stored as text'
  }
}, {
  tableName: 'subscriptions',
  timestamps: true,
  underscored: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

export default Subscription;
