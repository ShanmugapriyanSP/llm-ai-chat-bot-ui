import axios from "axios";

class ApiClient {
  constructor(baseURL) {
    this.baseURL = baseURL;
  }

  async register(payload) {
    try {
      const response = await axios.post(
        `${this.baseURL}/auth/register`,
        payload
      );
      return response;
    } catch (error) {
      console.error(`Error in registering the user`, error);
      throw error;
    }
  }

  async signIn(email, password) {
    try {
      const credentials = `${email}:${password}`;
      const base64Credentials = btoa(credentials);
      console.log("base64creds - ", base64Credentials);
      const response = await axios.get(`${this.baseURL}/auth/authenticate`, {
        headers: {
          Authorization: `Basic ${base64Credentials}`,
        },
      });
      return response;
    } catch (error) {
      console.error(`Error in authenticating the user`, error);
      throw error;
    }
  }

  async getModels(jwtToken) {
    try {
      const response = await axios.get(`${this.baseURL}/chat/models`, {
        headers: {
          Authorization: `Bearer ${jwtToken}`,
        },
      });
      return response;
    } catch (error) {
      console.error(`Error in getting the models`, error);
      throw error;
    }
  }

  async createNewChat(jwtToken) {
    try {
      const response = await axios.post(
        `${this.baseURL}/chat/new`,
        {},
        {
          headers: {
            Authorization: `Bearer ${jwtToken}`,
          },
        }
      );
      return response;
    } catch (error) {
      console.error(`Error in getting the models`, error);
      throw error;
    }
  }
}

const apiClient = new ApiClient("http://localhost:8080/v1/api");
export default apiClient;
