import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;
const GOOGLE_MAPS_BASE_URL = 'https://maps.googleapis.com/maps/api';

/**
 * Get distance and duration between two points
 */
export const getDistanceMatrix = async (origins, destinations) => {
  if (!GOOGLE_MAPS_API_KEY) {
    throw new Error('Google Maps API key not configured');
  }

  try {
    const url = `${GOOGLE_MAPS_BASE_URL}/distancematrix/json`;
    const params = {
      origins: origins.map(o => `${o.lat},${o.lng}`).join('|'),
      destinations: destinations.map(d => `${d.lat},${d.lng}`).join('|'),
      key: GOOGLE_MAPS_API_KEY,
      mode: 'driving'
    };

    const response = await axios.get(url, { params });
    return response.data;
  } catch (error) {
    console.error('Google Distance Matrix API Error:', error.response?.data || error.message);
    throw new Error('Failed to get distance matrix');
  }
};

/**
 * Get optimized route using Directions API
 */
export const getOptimizedRoute = async (origin, waypoints, destination) => {
  if (!GOOGLE_MAPS_API_KEY) {
    throw new Error('Google Maps API key not configured');
  }

  try {
    const url = `${GOOGLE_MAPS_BASE_URL}/directions/json`;
    const params = {
      origin: `${origin.lat},${origin.lng}`,
      destination: `${destination.lat},${destination.lng}`,
      waypoints: waypoints.length > 0 
        ? `optimize:true|${waypoints.map(w => `${w.lat},${w.lng}`).join('|')}`
        : undefined,
      key: GOOGLE_MAPS_API_KEY,
      mode: 'driving'
    };

    const response = await axios.get(url, { params });
    return response.data;
  } catch (error) {
    console.error('Google Directions API Error:', error.response?.data || error.message);
    throw new Error('Failed to get optimized route');
  }
};

/**
 * Geocode an address to get coordinates
 */
export const geocodeAddress = async (address) => {
  if (!GOOGLE_MAPS_API_KEY) {
    throw new Error('Google Maps API key not configured');
  }

  try {
    const url = `${GOOGLE_MAPS_BASE_URL}/geocode/json`;
    const params = {
      address,
      key: GOOGLE_MAPS_API_KEY
    };

    const response = await axios.get(url, { params });
    return response.data;
  } catch (error) {
    console.error('Google Geocoding API Error:', error.response?.data || error.message);
    throw new Error('Failed to geocode address');
  }
};

/**
 * Reverse geocode coordinates to get address
 */
export const reverseGeocode = async (lat, lng) => {
  if (!GOOGLE_MAPS_API_KEY) {
    throw new Error('Google Maps API key not configured');
  }

  try {
    const url = `${GOOGLE_MAPS_BASE_URL}/geocode/json`;
    const params = {
      latlng: `${lat},${lng}`,
      key: GOOGLE_MAPS_API_KEY
    };

    const response = await axios.get(url, { params });
    return response.data;
  } catch (error) {
    console.error('Google Reverse Geocoding API Error:', error.response?.data || error.message);
    throw new Error('Failed to reverse geocode');
  }
};

/**
 * Calculate optimized delivery route for multiple customers
 * Returns ordered list of customer IDs with route information
 */
export const calculateDeliveryRoute = async (deliveryBoyLocation, customers) => {
  if (!customers || customers.length === 0) {
    throw new Error('No customers provided for route calculation');
  }

  // If only one customer, return simple route
  if (customers.length === 1) {
    const customer = customers[0];
    const distanceData = await getDistanceMatrix(
      [deliveryBoyLocation],
      [{ lat: customer.latitude, lng: customer.longitude }]
    );

    return {
      customer_ids: [customer.id],
      route_data: null,
      total_distance: distanceData.rows[0]?.elements[0]?.distance?.value || 0,
      estimated_duration: distanceData.rows[0]?.elements[0]?.duration?.value || 0,
      waypoints: []
    };
  }

  // For multiple customers, use Directions API with optimization
  const waypoints = customers.slice(0, -1).map(c => ({
    lat: c.latitude,
    lng: c.longitude,
    customerId: c.id
  }));

  const lastCustomer = customers[customers.length - 1];
  const destination = {
    lat: lastCustomer.latitude,
    lng: lastCustomer.longitude
  };

  const routeData = await getOptimizedRoute(
    deliveryBoyLocation,
    waypoints,
    destination
  );

  if (routeData.status !== 'OK' || !routeData.routes || routeData.routes.length === 0) {
    throw new Error('Failed to calculate optimized route');
  }

  const route = routeData.routes[0];
  const leg = route.legs[0];
  
  // Extract waypoint order from the response
  const waypointOrder = route.waypoint_order || [];
  const orderedCustomerIds = waypointOrder.map(index => waypoints[index].customerId);
  orderedCustomerIds.push(lastCustomer.id); // Add destination customer

  // Calculate total distance and duration
  let totalDistance = 0;
  let totalDuration = 0;
  route.legs.forEach(leg => {
    totalDistance += leg.distance.value;
    totalDuration += leg.duration.value;
  });

  return {
    customer_ids: orderedCustomerIds,
    route_data: routeData,
    total_distance: totalDistance,
    estimated_duration: totalDuration,
    waypoints: route.legs.map(leg => ({
      start_location: leg.start_location,
      end_location: leg.end_location,
      distance: leg.distance,
      duration: leg.duration
    }))
  };
};
