import { DataTypes } from 'sequelize';
import sequelize from '../../config/sequelize.js';

const Invoice = sequelize.define('Invoice', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  generatedBy: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'generated_by',
    references: {
      model: 'users',
      key: 'id'
    },
    comment: 'deliveryBoyId or adminId'
  },
  targetUserId: {
    type: DataTypes.UUID,
    allowNull: true,
    field: 'target_user_id',
    references: {
      model: 'users',
      key: 'id'
    },
    comment: 'customerId for monthly invoices'
  },
  type: {
    type: DataTypes.ENUM('DAILY', 'MONTHLY'),
    allowNull: false
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0
    }
  },
  pdfPath: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'pdf_path'
  },
  sentViaWhatsApp: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'sent_via_whatsapp'
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  }
}, {
  tableName: 'invoices',
  timestamps: true,
  underscored: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

export default Invoice;
