import { Client } from '@googlemaps/google-maps-services-js';

const googleMapsClient = new Client({});
const apiKey = process.env.GOOGLE_MAPS_API_KEY;

/**
 * Geocode an address to get latitude and longitude
 */
export const geocodeAddress = async (address) => {
  if (!apiKey) {
    throw new Error('Google Maps API key not configured');
  }
  
  try {
    const response = await googleMapsClient.geocode({
      params: {
        address,
        key: apiKey
      }
    });
    
    if (response.data.results.length === 0) {
      throw new Error('Address not found');
    }
    
    const location = response.data.results[0].geometry.location;
    
    return {
      latitude: location.lat,
      longitude: location.lng,
      formattedAddress: response.data.results[0].formatted_address
    };
  } catch (error) {
    console.error('Error geocoding address:', error);
    throw error;
  }
};

/**
 * Get directions between multiple locations (route optimization)
 */
export const getOptimizedRoute = async (origin, destinations) => {
  if (!apiKey) {
    throw new Error('Google Maps API key not configured');
  }
  
  try {
    // If destinations is empty, return null
    if (!destinations || destinations.length === 0) {
      return null;
    }
    
    // Format waypoints for API
    const waypoints = destinations.map(dest => 
      typeof dest === 'string' ? dest : `${dest.latitude},${dest.longitude}`
    );
    
    const response = await googleMapsClient.directions({
      params: {
        origin: typeof origin === 'string' ? origin : `${origin.latitude},${origin.longitude}`,
        destination: waypoints[waypoints.length - 1],
        waypoints: waypoints.slice(0, -1),
        optimize: true, // Optimize waypoint order
        key: apiKey
      }
    });
    
    if (response.data.routes.length === 0) {
      throw new Error('No routes found');
    }
    
    const route = response.data.routes[0];
    
    return {
      distance: route.legs.reduce((sum, leg) => sum + leg.distance.value, 0), // in meters
      duration: route.legs.reduce((sum, leg) => sum + leg.duration.value, 0), // in seconds
      waypointOrder: route.waypoint_order,
      steps: route.legs.map(leg => ({
        startAddress: leg.start_address,
        endAddress: leg.end_address,
        distance: leg.distance.text,
        duration: leg.duration.text,
        steps: leg.steps.map(step => ({
          instruction: step.html_instructions,
          distance: step.distance.text,
          duration: step.duration.text
        }))
      }))
    };
  } catch (error) {
    console.error('Error getting optimized route:', error);
    throw error;
  }
};

/**
 * Calculate distance between two points
 */
export const calculateDistance = async (origin, destination) => {
  if (!apiKey) {
    throw new Error('Google Maps API key not configured');
  }
  
  try {
    const response = await googleMapsClient.distancematrix({
      params: {
        origins: [typeof origin === 'string' ? origin : `${origin.latitude},${origin.longitude}`],
        destinations: [typeof destination === 'string' ? destination : `${destination.latitude},${destination.longitude}`],
        key: apiKey
      }
    });
    
    if (response.data.rows[0].elements[0].status !== 'OK') {
      throw new Error('Could not calculate distance');
    }
    
    const element = response.data.rows[0].elements[0];
    
    return {
      distance: element.distance.value, // in meters
      distanceText: element.distance.text,
      duration: element.duration.value, // in seconds
      durationText: element.duration.text
    };
  } catch (error) {
    console.error('Error calculating distance:', error);
    throw error;
  }
};

/**
 * Get delivery route for a delivery boy with assigned customers
 */
export const getDeliveryRoute = async (deliveryBoyLocation, customerLocations) => {
  if (!apiKey) {
    console.warn('Google Maps API key not configured, skipping route optimization');
    return null;
  }
  
  try {
    if (!customerLocations || customerLocations.length === 0) {
      return null;
    }
    
    // Get optimized route
    const route = await getOptimizedRoute(deliveryBoyLocation, customerLocations);
    
    return route;
  } catch (error) {
    console.error('Error getting delivery route:', error);
    // Don't throw error, just return null so app can continue without route optimization
    return null;
  }
};

/**
 * Check if Google Maps API is configured
 */
export const isGoogleMapsConfigured = () => {
  return !!apiKey;
};
