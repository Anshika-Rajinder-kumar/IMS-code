const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  getAuthToken() {
    return localStorage.getItem('token');
  }

  getHeaders() {
    const headers = {
      'Content-Type': 'application/json',
    };
    
    const token = this.getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    return headers;
  }

  async handleResponse(response) {
    if (!response.ok) {
      // Handle 401/403 - redirect to login
      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        throw new Error('Session expired. Please login again.');
      }
      
      let errorMessage = 'Something went wrong';
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch (e) {
        // If JSON parsing fails, use default message
      }
      throw new Error(errorMessage);
    }
    
    const jsonData = await response.json();
    
    // Backend returns ApiResponse wrapper: {success, message, data}
    // Return the data property if it exists, otherwise return the whole response
    if (jsonData.success !== undefined && jsonData.data !== undefined) {
      return jsonData.data;
    }
    
    return jsonData;
  }

  async get(endpoint) {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'GET',
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  async post(endpoint, body) {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(body),
    });
    return this.handleResponse(response);
  }

  async put(endpoint, body) {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(body),
    });
    return this.handleResponse(response);
  }

  async patch(endpoint, body = {}) {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: JSON.stringify(body),
    });
    return this.handleResponse(response);
  }

  async patchWithoutBody(endpoint) {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'PATCH',
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  async delete(endpoint) {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  async uploadFile(endpoint, formData) {
    const token = this.getAuthToken();
    const headers = {};
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'POST',
      headers,
      body: formData,
    });
    return this.handleResponse(response);
  }

  // Auth APIs
  async login(email, password, userType) {
    return this.post('/auth/login', { email, password, userType });
  }

  async register(userData) {
    return this.post('/auth/register', userData);
  }

  // Dashboard APIs
  async getDashboardStats() {
    return this.get('/dashboard/stats');
  }

  // College APIs
  async getColleges() {
    return this.get('/colleges');
  }

  async getCollegeById(id) {
    return this.get(`/colleges/${id}`);
  }

  async searchColleges(term) {
    return this.get(`/colleges/search?term=${encodeURIComponent(term)}`);
  }

  async createCollege(college) {
    return this.post('/colleges', college);
  }

  async updateCollege(id, college) {
    return this.put(`/colleges/${id}`, college);
  }

  async deleteCollege(id) {
    return this.delete(`/colleges/${id}`);
  }

  // Intern APIs
  async getInterns() {
    return this.get('/interns');
  }

  async getInternById(id) {
    return this.get(`/interns/${id}`);
  }

  async searchInterns(term) {
    return this.get(`/interns/search?term=${encodeURIComponent(term)}`);
  }

  async createIntern(intern) {
    return this.post('/interns', intern);
  }

  async updateIntern(id, intern) {
    return this.put(`/interns/${id}`, intern);
  }

  async updateInternStatus(id, status) {
    return this.patch(`/interns/${id}/status?status=${status}`);
  }

  async deleteIntern(id) {
    return this.delete(`/interns/${id}`);
  }

  // Document APIs
  async getDocuments() {
    return this.get('/documents');
  }

  async getDocumentsByInternId(internId) {
    return this.get(`/documents/intern/${internId}`);
  }

  async uploadDocument(internId, name, type, file) {
    const formData = new FormData();
    formData.append('internId', internId);
    formData.append('name', name);
    formData.append('type', type);
    formData.append('file', file);
    
    return this.uploadFile('/documents/upload', formData);
  }

  async verifyDocument(id, verifiedBy) {
    return this.patch(`/documents/${id}/verify?verifiedBy=${encodeURIComponent(verifiedBy)}`);
  }

  async rejectDocument(id, reason, verifiedBy) {
    return this.patch(`/documents/${id}/reject?reason=${encodeURIComponent(reason)}&verifiedBy=${encodeURIComponent(verifiedBy)}`);
  }

  async deleteDocument(id) {
    return this.delete(`/documents/${id}`);
  }

  getDocumentDownloadUrl(id) {
    const token = this.getAuthToken();
    return `${this.baseURL}/documents/${id}/download?token=${token}`;
  }

  // Offer APIs
  async getOffers() {
    return this.get('/offers');
  }

  async getOfferById(id) {
    return this.get(`/offers/${id}`);
  }

  async getOffersByInternId(internId) {
    return this.get(`/offers/intern/${internId}`);
  }

  async createOffer(offer) {
    return this.post('/offers', offer);
  }

  async updateOffer(id, offer) {
    return this.put(`/offers/${id}`, offer);
  }

  async sendOffer(id) {
    return this.patch(`/offers/${id}/send`);
  }

  async acceptOffer(id) {
    return this.patch(`/offers/${id}/accept`);
  }

  async rejectOffer(id) {
    return this.patch(`/offers/${id}/reject`);
  }

  async deleteOffer(id) {
    return this.delete(`/offers/${id}`);
  }
}

export default new ApiService();
