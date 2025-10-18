import { DataTypes } from 'sequelize';
import sequelize from '../config/sequelize.js';

const AreaAssignment = sequelize.define('AreaAssignment', {
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
  areaName: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'area_name'
  },
  customers: {
    type: DataTypes.ARRAY(DataTypes.UUID),
    allowNull: true,
    defaultValue: []
  }
}, {
  tableName: 'area_assignments',
  timestamps: true,
  underscored: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

export default AreaAssignment;
