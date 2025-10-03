import Joi from 'joi';

export const signupSchema = Joi.object({
  name: Joi.string().min(2).max(255).required(),
  phone: Joi.string().pattern(/^[0-9]{10,20}$/).required(),
  email: Joi.string().email().required(),
  location: Joi.string().min(5).max(500).required(),
  password: Joi.string().min(8).required(),
  role: Joi.string().valid('admin', 'customer', 'delivery_boy').default('customer')
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

export const refreshTokenSchema = Joi.object({
  refreshToken: Joi.string().required()
});

export const updateUserSchema = Joi.object({
  name: Joi.string().min(2).max(255),
  phone: Joi.string().pattern(/^[0-9]{10,20}$/),
  location: Joi.string().min(5).max(500)
}).min(1);

export const productSchema = Joi.object({
  name: Joi.string().min(2).max(255).required(),
  description: Joi.string().max(1000).allow(''),
  unit_price: Joi.number().min(0).required(),
  unit: Joi.string().min(1).max(50).required(),
  is_active: Joi.boolean().default(true)
});

export const updateProductSchema = Joi.object({
  name: Joi.string().min(2).max(255),
  description: Joi.string().max(1000).allow(''),
  unit_price: Joi.number().min(0),
  unit: Joi.string().min(1).max(50),
  is_active: Joi.boolean()
}).min(1);

export const subscriptionSchema = Joi.object({
  customer_id: Joi.string().uuid().required(),
  product_id: Joi.string().uuid().required(),
  quantity_per_day: Joi.number().integer().min(1).required(),
  start_date: Joi.date().iso().required(),
  end_date: Joi.date().iso().min(Joi.ref('start_date')).allow(null)
});

export const updateSubscriptionSchema = Joi.object({
  quantity_per_day: Joi.number().integer().min(1),
  end_date: Joi.date().iso().allow(null),
  is_active: Joi.boolean()
}).min(1);

export const dailyAdjustmentSchema = Joi.object({
  adjustment_date: Joi.date().iso().required(),
  adjusted_quantity: Joi.number().integer().min(0).required()
});

export const orderSchema = Joi.object({
  customer_id: Joi.string().uuid().required(),
  product_id: Joi.string().uuid().required(),
  quantity: Joi.number().integer().min(1).required(),
  order_date: Joi.date().iso().required()
});

export const deliveryStatusSchema = Joi.object({
  status: Joi.string().valid('pending', 'assigned', 'in_progress', 'delivered', 'failed').required(),
  notes: Joi.string().max(1000).allow('')
});

export const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, { abortEarly: false });
    
    if (error) {
      const errors = error.details.map(detail => detail.message);
      return res.status(400).json({ 
        success: false, 
        message: 'Validation error', 
        errors 
      });
    }
    
    req.validatedData = value;
    next();
  };
};
