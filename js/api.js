// The Rising Stars - API client wrapper
const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:5000/api'
  : 'https://api.therisingstarsadventure.co.in/api';

class ApiClient {
  constructor() {
    this.tokenKey = 'trs_auth_token';
  }

  // Get auth token from local storage
  getToken() {
    return localStorage.getItem(this.tokenKey);
  }

  // Save token to local storage
  setToken(token) {
    localStorage.setItem(this.tokenKey, token);
  }

  // Remove token
  clearToken() {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem('trs_user');
  }

  // Core request builder
  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    
    // Set headers
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const config = {
      ...options,
      headers,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong');
      }

      return data;
    } catch (error) {
      console.error(`API Error on ${endpoint}:`, error);
      throw error;
    }
  }

  // Auth Endpoints
  async register(name, email, phone, password) {
    const data = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, phone, password }),
    });
    this.setToken(data.token);
    localStorage.setItem('trs_user', JSON.stringify(data.user));
    return data.user;
  }

  async login(email, password) {
    const data = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    this.setToken(data.token);
    localStorage.setItem('trs_user', JSON.stringify(data.user));
    return data.user;
  }

  async getProfile() {
    return this.request('/auth/profile');
  }

  getCurrentUser() {
    const userStr = localStorage.getItem('trs_user');
    return userStr ? JSON.parse(userStr) : null;
  }

  // Packages Endpoints
  async getPackages() {
    return this.request('/packages');
  }

  async getPackage(id) {
    return this.request(`/packages/${id}`);
  }

  async createPackage(packageData) {
    return this.request('/packages', {
      method: 'POST',
      body: JSON.stringify(packageData),
    });
  }

  async updatePackage(id, packageData) {
    return this.request(`/packages/${id}`, {
      method: 'PUT',
      body: JSON.stringify(packageData),
    });
  }

  async deletePackage(id) {
    return this.request(`/packages/${id}`, {
      method: 'DELETE',
    });
  }

  // Trips Endpoints
  async getUpcomingTrips() {
    return this.request('/trips/upcoming');
  }

  async getAllTrips() {
    return this.request('/trips');
  }

  async createTrip(tripData) {
    return this.request('/trips', {
      method: 'POST',
      body: JSON.stringify(tripData),
    });
  }

  async updateTripStatus(id, statusData) {
    return this.request(`/trips/${id}`, {
      method: 'PUT',
      body: JSON.stringify(statusData),
    });
  }

  async updateTripLocation(id, lat, lng, status) {
    return this.request(`/trips/${id}/location`, {
      method: 'PUT',
      body: JSON.stringify({ lat, lng, status }),
    });
  }

  async getTripLiveLocation(id, token) {
    return this.request(`/trips/${id}/track?token=${token}`);
  }

  // Bookings Endpoints
  async createBooking(tripId, members) {
    return this.request('/bookings', {
      method: 'POST',
      body: JSON.stringify({ tripId, members }),
    });
  }

  async getMyBookings() {
    return this.request('/bookings/my');
  }

  async getAllBookings() {
    return this.request('/bookings');
  }

  async updateBookingStatus(id, status) {
    return this.request(`/bookings/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  // Payments Endpoints
  async processPayment(bookingId, amount, method, transactionId) {
    return this.request('/payments', {
      method: 'POST',
      body: JSON.stringify({ bookingId, amount, method, transactionId }),
    });
  }

  // Reviews Endpoints
  async addReview(trekId, rating, comment) {
    return this.request('/reviews', {
      method: 'POST',
      body: JSON.stringify({ trekId, rating, comment }),
    });
  }

  async getReviews(trekId) {
    return this.request(`/reviews/package/${trekId}`);
  }

  // Contact & Newsletter Endpoints
  async submitContact(name, email, message) {
    return this.request('/contact', {
      method: 'POST',
      body: JSON.stringify({ name, email, message }),
    });
  }

  async subscribeNewsletter(email) {
    return this.request('/newsletter', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async getContactMessages() {
    return this.request('/contact');
  }

  async getNewsletterSubscribers() {
    return this.request('/newsletter');
  }

  // Admin Dashboard stats
  async getAdminStats() {
    return this.request('/admin/stats');
  }
}

// Export as a global window instance for easy access in our script files
window.api = new ApiClient();
