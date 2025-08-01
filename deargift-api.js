/**
 * DearGift API Client
 * Thay thế Firebase API với backend tùy chỉnh
 */

class DearGiftAPI {
  constructor(apiUrl = 'http://localhost:3000/api') {
    this.apiUrl = apiUrl;
    this.isInitialized = false;
    this.initPromise = this.init();
  }

  /**
   * Khởi tạo API client và kiểm tra kết nối
   */
  async init() {
    try {
      const response = await fetch(`${this.apiUrl}/status`);
      const data = await response.json();
      
      if (data.status === 'online') {
        console.log('DearGift API kết nối thành công');
        this.isInitialized = true;
        return true;
      } else {
        console.error('DearGift API không khả dụng:', data.message);
        return false;
      }
    } catch (error) {
      console.error('Không thể kết nối đến DearGift API:', error);
      return false;
    }
  }

  /**
   * Đảm bảo API đã được khởi tạo trước khi thực hiện các thao tác
   */
  async ensureInitialized() {
    if (!this.isInitialized) {
      await this.initPromise;
      if (!this.isInitialized) {
        throw new Error('API client chưa được khởi tạo thành công');
      }
    }
  }

  /**
   * Upload file nhạc
   * @param {File} file - File nhạc cần upload
   * @returns {Promise<Object>} - Thông tin file đã upload
   */
  async uploadMusic(file) {
    await this.ensureInitialized();

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`${this.apiUrl}/upload/music`, {
        method: 'POST',
        body: formData
      });

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.message || 'Upload thất bại');
      }

      return {
        url: result.file.url,
        originalName: result.file.name,
        size: result.file.size,
        type: result.file.type,
        id: result.file.id,
        uploadedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('Lỗi upload nhạc:', error);
      throw error;
    }
  }

  /**
   * Lưu galaxy
   * @param {string} id - Galaxy ID
   * @param {Object} data - Dữ liệu galaxy
   * @returns {Promise<Object>} - Kết quả lưu
   */
  async saveGalaxy(id, data) {
    await this.ensureInitialized();

    try {
      const response = await fetch(`${this.apiUrl}/galaxies`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id,
          ...data
        })
      });

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.message || 'Lưu galaxy thất bại');
      }

      return { success: true, id: result.galaxyId };
    } catch (error) {
      console.error('Lỗi lưu galaxy:', error);
      throw error;
    }
  }

  /**
   * Lấy galaxy theo ID
   * @param {string} id - Galaxy ID
   * @returns {Promise<Object>} - Dữ liệu galaxy
   */
  async getGalaxy(id) {
    await this.ensureInitialized();

    try {
      const response = await fetch(`${this.apiUrl}/galaxies/${id}`);
      
      if (response.status === 404) {
        return null;
      }

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.message || 'Lấy galaxy thất bại');
      }

      return result.galaxy;
    } catch (error) {
      console.error('Lỗi lấy galaxy:', error);
      throw error;
    }
  }

  /**
   * Lấy danh sách bài hát có sẵn
   * @returns {Promise<Object>} - Danh sách bài hát
   */
  async getAvailableSongs() {
    await this.ensureInitialized();

    try {
      const response = await fetch(`${this.apiUrl}/songs`);
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Lấy danh sách bài hát thất bại');
      }

      return result.songs;
    } catch (error) {
      console.error('Lỗi lấy danh sách bài hát:', error);
      throw error;
    }
  }

  /**
   * Kiểm tra kết nối API
   * @returns {Promise<boolean>} - Trạng thái kết nối
   */
  async checkConnection() {
    try {
      const response = await fetch(`${this.apiUrl}/status`);
      const data = await response.json();
      return data.status === 'online';
    } catch (error) {
      console.error('Lỗi kiểm tra kết nối:', error);
      return false;
    }
  }
}

// Export singleton instance
window.dearGiftAPI = window.dearGiftAPI || new DearGiftAPI();

// Legacy support cho code cũ
window.getBackendAPI = function() {
  return window.dearGiftAPI;
};
