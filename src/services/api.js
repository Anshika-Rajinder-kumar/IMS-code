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

  async updateInternHiringStatus(id, hiringRound, hiringStatus, hiringScore) {
    let url = `/interns/${id}/hiring-status?hiringRound=${encodeURIComponent(hiringRound)}&hiringStatus=${hiringStatus}`;
    if (hiringScore !== null && hiringScore !== undefined) {
      url += `&hiringScore=${hiringScore}`;
    }
    return this.patch(url);
  }

  async deleteIntern(id) {
    return this.delete(`/interns/${id}`);
  }

  // Candidate APIs
  async getCandidates() {
    return this.get('/candidates');
  }

  async getCandidateById(id) {
    return this.get(`/candidates/${id}`);
  }

  async getCandidatesByStatus(status) {
    return this.get(`/candidates/status/${status}`);
  }

  async getCandidatesByCollegeId(collegeId) {
    return this.get(`/candidates/college/${collegeId}`);
  }

  async getCandidatesByCollegeName(collegeName) {
    return this.get(`/candidates/college/name/${encodeURIComponent(collegeName)}`);
  }

  async searchCandidates(term) {
    return this.get(`/candidates/search?term=${encodeURIComponent(term)}`);
  }

  async createCandidate(candidate) {
    return this.post('/candidates', candidate);
  }

  async updateCandidate(id, candidate) {
    return this.put(`/candidates/${id}`, candidate);
  }

  async updateCandidateStatus(id, status) {
    return this.patch(`/candidates/${id}/status?status=${status}`);
  }

  async deleteCandidate(id) {
    return this.delete(`/candidates/${id}`);
  }

  async convertCandidateToIntern(candidateId, joinDate) {
    return this.post(`/candidates/${candidateId}/convert-to-intern`, { joinDate });
  }

  async uploadCandidateResume(candidateId, file) {
    const formData = new FormData();
    formData.append('file', file);
    return this.uploadFile(`/candidates/${candidateId}/upload-resume`, formData);
  }

  getCandidateResumeUrl(candidateId) {
    const token = this.getAuthToken();
    return `${this.baseURL}/candidates/${candidateId}/resume?token=${token}`;
  }

  async bulkUploadCandidates(formData) {
    return this.uploadFile('/candidates/bulk-upload', formData);
  }

  // Candidate Hiring Round APIs
  async getCandidateHiringRoundsByCandidateId(candidateId) {
    return this.get(`/candidate-hiring-rounds/candidate/${candidateId}`);
  }

  async createOrUpdateCandidateHiringRound(candidateHiringRound) {
    return this.post('/candidate-hiring-rounds/create-or-update', candidateHiringRound);
  }

  // Document APIs
  async getDocuments() {
    return this.get('/documents');
  }

  async getDocumentsByInternId(internId) {
    return this.get(`/documents/intern/${internId}`);
  }

  async uploadDocument(internId, name, label, icon, description, type, file) {
    const formData = new FormData();
    formData.append('internId', internId);
    formData.append('name', name);
    formData.append('label', label);
    formData.append('icon', icon);
    formData.append('description', description);
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

  async getOfferPreview(id) {
    const token = this.getAuthToken();
    const response = await fetch(`${this.baseURL}/offers/${id}/preview`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch offer preview');
    }

    return response.text(); // Return as HTML string
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

  async acceptOfferWithFile(id, formData) {
    const token = this.getAuthToken();
    const headers = {};

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${this.baseURL}/offers/${id}/accept`, {
      method: 'POST',
      headers,
      body: formData,
    });
    return this.handleResponse(response);
  }

  getOfferDownloadUrl(id) {
    return `${this.baseURL}/offers/${id}/download`;
  }

  async downloadOffer(id) {
    try {
      const token = this.getAuthToken();
      const response = await fetch(`${this.baseURL}/offers/${id}/download`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`Download failed with status: ${response.status}`);
      }

      const blob = await response.blob();

      // Validate blob
      if (!blob || blob.size === 0) {
        throw new Error('Received empty PDF from server');
      }

      if (blob.type !== 'application/pdf' && blob.size < 100) {
        // Fallback check: if it's too small and not marked as PDF, it might be an error message
        const text = await blob.text();
        throw new Error(`Invalid PDF received: ${text.substring(0, 100)}`);
      }

      // Get filename from Content-Disposition header
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = `Internship_Offer_${id}.pdf`;

      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/i);
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1];
        }
      }

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();

      // Cleanup
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }, 100);

      return true;
    } catch (error) {
      console.error('Download offer error:', error);
      throw error;
    }
  }

  async rejectOffer(id) {
    return this.patch(`/offers/${id}/reject`);
  }

  async deleteOffer(id) {
    return this.delete(`/offers/${id}`);
  }

  // Hiring Round APIs
  async getHiringRounds() {
    return this.get('/hiring-rounds');
  }

  async getHiringRoundById(id) {
    return this.get(`/hiring-rounds/${id}`);
  }

  async getHiringRoundsByInternId(internId) {
    return this.get(`/hiring-rounds/intern/${internId}`);
  }

  async getHiringRoundsByStatus(status) {
    return this.get(`/hiring-rounds/status/${status}`);
  }

  async createHiringRound(hiringRound) {
    return this.post('/hiring-rounds', hiringRound);
  }

  async createOrUpdateHiringRound(hiringRound) {
    return this.post('/hiring-rounds/create-or-update', hiringRound);
  }

  async updateHiringRound(id, hiringRound) {
    return this.put(`/hiring-rounds/${id}`, hiringRound);
  }

  async updateHiringRoundStatus(id, status) {
    return this.patch(`/hiring-rounds/${id}/status?status=${status}`);
  }

  async deleteHiringRound(id) {
    return this.delete(`/hiring-rounds/${id}`);
  }

  async getLatestOfferByInternId(internId) {
    return this.get(`/offers/intern/${internId}/latest`);
  }

  // Learning APIs
  async getMyLearning() {
    return this.get('/intern/learning');
  }

  async getActiveInterns(term = '') {
    return this.get(`/admin/interns/active?term=${encodeURIComponent(term)}`);
  }

  async assignLearning(internId, courseIds, projectIds) {
    return this.post('/admin/assign-learning', { internId, courseIds, projectIds });
  }

  async getCoursePool() {
    return this.get('/admin/course-pool');
  }

  async createCourse(course) {
    return this.post('/admin/course-pool', course);
  }

  async deleteCourse(id) {
    return this.delete(`/admin/course-pool/${id}`);
  }

  async getProjectPool() {
    return this.get('/admin/project-pool');
  }

  async createProject(project) {
    return this.post('/admin/project-pool', project);
  }

  async deleteProject(id) {
    return this.delete(`/admin/project-pool/${id}`);
  }
}

export default new ApiService();
