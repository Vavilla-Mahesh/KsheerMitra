import * as deliveryAreaModel from '../models/deliveryAreaModel.js';
import * as deliveryRouteModel from '../models/deliveryRouteModel.js';
import { getCustomersWithLocation } from '../models/userModel.js';
import { calculateDeliveryRoute } from '../services/googleMapsService.js';

/**
 * Create a new delivery area
 */
export const createDeliveryArea = async (req, res) => {
  try {
    const area = await deliveryAreaModel.createDeliveryArea(req.validatedData);
    
    res.status(201).json({
      success: true,
      message: 'Delivery area created successfully',
      data: area
    });
  } catch (error) {
    console.error('Create delivery area error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Get all delivery areas
 */
export const getAllDeliveryAreas = async (req, res) => {
  try {
    const areas = await deliveryAreaModel.findAllDeliveryAreas();
    
    res.status(200).json({
      success: true,
      data: areas
    });
  } catch (error) {
    console.error('Get delivery areas error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Get delivery area by ID
 */
export const getDeliveryAreaById = async (req, res) => {
  try {
    const area = await deliveryAreaModel.findDeliveryAreaById(req.params.id);
    
    if (!area) {
      return res.status(404).json({
        success: false,
        message: 'Delivery area not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: area
    });
  } catch (error) {
    console.error('Get delivery area error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Update delivery area
 */
export const updateDeliveryArea = async (req, res) => {
  try {
    const area = await deliveryAreaModel.updateDeliveryArea(
      req.params.id,
      req.validatedData
    );
    
    res.status(200).json({
      success: true,
      message: 'Delivery area updated successfully',
      data: area
    });
  } catch (error) {
    console.error('Update delivery area error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Delete delivery area
 */
export const deleteDeliveryArea = async (req, res) => {
  try {
    await deliveryAreaModel.deleteDeliveryArea(req.params.id);
    
    res.status(200).json({
      success: true,
      message: 'Delivery area deleted successfully'
    });
  } catch (error) {
    console.error('Delete delivery area error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Assign customers to a delivery area
 */
export const assignCustomersToArea = async (req, res) => {
  try {
    const { customer_ids } = req.validatedData;
    const customers = await deliveryAreaModel.assignCustomersToArea(
      req.params.id,
      customer_ids
    );
    
    res.status(200).json({
      success: true,
      message: 'Customers assigned successfully',
      data: customers
    });
  } catch (error) {
    console.error('Assign customers error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Get customers in a delivery area
 */
export const getCustomersInArea = async (req, res) => {
  try {
    const customers = await deliveryAreaModel.getCustomersInArea(req.params.id);
    
    res.status(200).json({
      success: true,
      data: customers
    });
  } catch (error) {
    console.error('Get customers in area error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Get all customers with location data for map view
 */
export const getCustomersWithLocation = async (req, res) => {
  try {
    const customers = await getCustomersWithLocation();
    
    res.status(200).json({
      success: true,
      data: customers
    });
  } catch (error) {
    console.error('Get customers with location error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Generate optimized route for delivery boy
 */
export const generateOptimizedRoute = async (req, res) => {
  try {
    const { delivery_boy_id, route_date, delivery_boy_location, area_id } = req.validatedData;
    
    // Get customers in the area
    let customers;
    if (area_id) {
      customers = await deliveryAreaModel.getCustomersInArea(area_id);
    } else {
      // If no area specified, get all customers with location
      customers = await getCustomersWithLocation();
    }
    
    if (!customers || customers.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No customers found for route optimization'
      });
    }
    
    // Calculate optimized route
    const routeData = await calculateDeliveryRoute(delivery_boy_location, customers);
    
    // Save route to database
    const route = await deliveryRouteModel.createDeliveryRoute({
      delivery_boy_id,
      route_date,
      customer_ids: routeData.customer_ids,
      route_data: routeData.route_data,
      total_distance: routeData.total_distance,
      estimated_duration: routeData.estimated_duration
    });
    
    // Create delivery logs for each customer
    const logs = [];
    for (let i = 0; i < routeData.customer_ids.length; i++) {
      const log = await deliveryRouteModel.createDeliveryLog({
        route_id: route.id,
        customer_id: routeData.customer_ids[i],
        delivery_order: i + 1,
        status: 'pending'
      });
      logs.push(log);
    }
    
    res.status(201).json({
      success: true,
      message: 'Route generated successfully',
      data: {
        route,
        logs,
        waypoints: routeData.waypoints
      }
    });
  } catch (error) {
    console.error('Generate route error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Get routes for delivery boy
 */
export const getDeliveryBoyRoutes = async (req, res) => {
  try {
    const { deliveryBoyId } = req.params;
    const { route_date } = req.query;
    
    const routes = await deliveryRouteModel.findRoutesByDeliveryBoy(
      deliveryBoyId,
      route_date
    );
    
    res.status(200).json({
      success: true,
      data: routes
    });
  } catch (error) {
    console.error('Get delivery boy routes error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Get route details with delivery logs
 */
export const getRouteDetails = async (req, res) => {
  try {
    const route = await deliveryRouteModel.findRouteById(req.params.id);
    
    if (!route) {
      return res.status(404).json({
        success: false,
        message: 'Route not found'
      });
    }
    
    const logs = await deliveryRouteModel.findDeliveryLogsByRoute(req.params.id);
    
    res.status(200).json({
      success: true,
      data: {
        route,
        logs
      }
    });
  } catch (error) {
    console.error('Get route details error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Update route status
 */
export const updateRouteStatus = async (req, res) => {
  try {
    const { status } = req.validatedData;
    const route = await deliveryRouteModel.updateRouteStatus(
      req.params.id,
      status,
      status === 'completed' ? new Date() : null
    );
    
    res.status(200).json({
      success: true,
      message: 'Route status updated successfully',
      data: route
    });
  } catch (error) {
    console.error('Update route status error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Update delivery log (mark delivery as completed)
 */
export const updateDeliveryLog = async (req, res) => {
  try {
    const log = await deliveryRouteModel.updateDeliveryLog(
      req.params.id,
      req.validatedData
    );
    
    res.status(200).json({
      success: true,
      message: 'Delivery log updated successfully',
      data: log
    });
  } catch (error) {
    console.error('Update delivery log error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};
