'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class PaymentLink extends Model {
    static associate(models) {
        this.belongsTo(models.Service, { foreignKey: 'service_id', as: 'service', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
    }
  }

  PaymentLink.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    payment_link: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true
    },
    expiry_date: {
        type: DataTypes.DATE,
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM('PENDING', 'EXPIRED', 'PAID', 'CANCELLED'),
        allowNull: false,
        defaultValue: 'PENDING'
    },
    service_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    razorpay_link_id: {
        type: DataTypes.STRING(255),
        allowNull: true,
        unique: true
    },
    razorpay_short_url: {
        type: DataTypes.STRING(500),
        allowNull: true
    },
    razorpay_status: {
        type: DataTypes.STRING(50),
        allowNull: true
    },
    razorpay_error: {
        type: DataTypes.TEXT,
        allowNull: true
    }
  }, {
    sequelize,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    modelName: 'PaymentLink',
    tableName: 'payment_links'
  });

  return PaymentLink;
};
