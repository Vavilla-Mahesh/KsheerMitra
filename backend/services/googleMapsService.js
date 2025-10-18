import { Client } from '@googlemaps/google-maps-services-js';

class GoogleMapsService {
  constructor() {
    this.client = new Client({});
    this.apiKey = process.env.GOOGLE_MAPS_API_KEY;
    
    if (!this.apiKey) {
      console.warn('GOOGLE_MAPS_API_KEY not set. Google Maps features will not work.');
    }
  }

  /**
   * Geocode an address to get latitude and longitude
   * @param {string} address - The address to geocode
   * @returns {Promise<{lat: number, lng: number, formattedAddress: string}>}
   */
  async geocodeAddress(address) {
    if (!this.apiKey) {
      throw new Error('Google Maps API key not configured');
    }

    try {
      const response = await this.client.geocode({
        params: {
          address,
          key: this.apiKey
        }
      });

      if (response.data.results && response.data.results.length > 0) {
        const result = response.data.results[0];
        return {
          lat: result.geometry.location.lat,
          lng: result.geometry.location.lng,
          formattedAddress: result.formatted_address
        };
      } else {
        throw new Error('No results found for the given address');
      }
    } catch (error) {
      console.error('Geocoding error:', error);
      throw new Error(`Failed to geocode address: ${error.message}`);
    }
  }

  /**
   * Reverse geocode coordinates to get address
   * @param {number} lat - Latitude
   * @param {number} lng - Longitude
   * @returns {Promise<string>} - Formatted address
   */
  async reverseGeocode(lat, lng) {
    if (!this.apiKey) {
      throw new Error('Google Maps API key not configured');
    }

    try {
      const response = await this.client.reverseGeocode({
        params: {
          latlng: `${lat},${lng}`,
          key: this.apiKey
        }
      });

      if (response.data.results && response.data.results.length > 0) {
        return response.data.results[0].formatted_address;
      } else {
        throw new Error('No address found for the given coordinates');
      }
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      throw new Error(`Failed to reverse geocode: ${error.message}`);
    }
  }

  /**
   * Calculate route and distance between multiple points
   * @param {Array<{lat: number, lng: number}>} waypoints - Array of locations
   * @returns {Promise<Object>} - Route information with distance and duration
   */
  async calculateRoute(waypoints) {
    if (!this.apiKey) {
      throw new Error('Google Maps API key not configured');
    }

    if (!waypoints || waypoints.length < 2) {
      throw new Error('At least 2 waypoints are required');
    }

    try {
      const origin = `${waypoints[0].lat},${waypoints[0].lng}`;
      const destination = `${waypoints[waypoints.length - 1].lat},${waypoints[waypoints.length - 1].lng}`;
      
      // Middle waypoints (if any)
      const middleWaypoints = waypoints.slice(1, -1).map(wp => `${wp.lat},${wp.lng}`);

      const params = {
        origin,
        destination,
        key: this.apiKey,
        mode: 'driving',
        optimize: true // Optimize waypoint order
      };

      if (middleWaypoints.length > 0) {
        params.waypoints = middleWaypoints;
      }

      const response = await this.client.directions({ params });

      if (response.data.routes && response.data.routes.length > 0) {
        const route = response.data.routes[0];
        
        // Calculate total distance and duration
        let totalDistance = 0;
        let totalDuration = 0;
        
        route.legs.forEach(leg => {
          totalDistance += leg.distance.value; // in meters
          totalDuration += leg.duration.value; // in seconds
        });

        return {
          distance: totalDistance, // meters
          distanceText: `${(totalDistance / 1000).toFixed(2)} km`,
          duration: totalDuration, // seconds
          durationText: `${Math.round(totalDuration / 60)} mins`,
          polyline: route.overview_polyline.points,
          waypointOrder: route.waypoint_order,
          legs: route.legs.map(leg => ({
            distance: leg.distance.value,
            distanceText: leg.distance.text,
            duration: leg.duration.value,
            durationText: leg.duration.text,
            startAddress: leg.start_address,
            endAddress: leg.end_address
          }))
        };
      } else {
        throw new Error('No route found');
      }
    } catch (error) {
      console.error('Route calculation error:', error);
      throw new Error(`Failed to calculate route: ${error.message}`);
    }
  }

  /**
   * Get optimized delivery route for a delivery boy
   * @param {Object} deliveryBoyLocation - {lat, lng}
   * @param {Array<Object>} customerLocations - Array of {customerId, lat, lng}
   * @returns {Promise<Object>} - Optimized route
   */
  async getOptimizedDeliveryRoute(deliveryBoyLocation, customerLocations) {
    if (!deliveryBoyLocation || !customerLocations || customerLocations.length === 0) {
      throw new Error('Invalid delivery route parameters');
    }

    // Create waypoints array starting with delivery boy location
    const waypoints = [deliveryBoyLocation, ...customerLocations.map(c => ({ lat: c.lat, lng: c.lng }))];

    const route = await this.calculateRoute(waypoints);

    // Map waypoint order to customer IDs
    const optimizedCustomerOrder = route.waypointOrder.map(index => 
      customerLocations[index].customerId
    );

    return {
      ...route,
      optimizedCustomerOrder
    };
  }

  /**
   * Calculate distance between two points
   * @param {Object} point1 - {lat, lng}
   * @param {Object} point2 - {lat, lng}
   * @returns {Promise<Object>} - Distance info
   */
  async calculateDistance(point1, point2) {
    if (!this.apiKey) {
      throw new Error('Google Maps API key not configured');
    }

    try {
      const response = await this.client.distancematrix({
        params: {
          origins: [`${point1.lat},${point1.lng}`],
          destinations: [`${point2.lat},${point2.lng}`],
          key: this.apiKey
        }
      });

      if (response.data.rows && response.data.rows[0].elements[0].status === 'OK') {
        const element = response.data.rows[0].elements[0];
        return {
          distance: element.distance.value, // meters
          distanceText: element.distance.text,
          duration: element.duration.value, // seconds
          durationText: element.duration.text
        };
      } else {
        throw new Error('Unable to calculate distance');
      }
    } catch (error) {
      console.error('Distance calculation error:', error);
      throw new Error(`Failed to calculate distance: ${error.message}`);
    }
  }
}

// Singleton instance
let googleMapsService = null;

export const getGoogleMapsService = () => {
  if (!googleMapsService) {
    googleMapsService = new GoogleMapsService();
  }
  return googleMapsService;
};

export default GoogleMapsService;
