import axios from "axios";

class ApiClient {
  constructor(baseURL) {
    this.baseURL = baseURL;
  }

  async register(payload) {
    try {
      const response = await axios.post(
        `${this.baseURL}/auth/register`,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
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

  async chatCompletion(payload, jwtToken) {
    try {
      const response = await fetch(
        "http://localhost:8080/api/v1/chat/completion",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${jwtToken}`, // Pass the Bearer token in the Authorization header
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        throw new Error("Request is not successful");
      }
      if (!response.body) {
        throw new Error("ReadableStream not supported or no response body");
      }
      return response;
    } catch (error) {
      console.error(`Error in chat completion request`, error);
      throw error;
    }
  }

  async getChatHistory(jwtToken) {
    try {
      const response = await axios.get(`${this.baseURL}/chat/history`, {
        headers: {
          Authorization: `Bearer ${jwtToken}`,
        },
      });
      return response;
    } catch (error) {
      console.error(`Error in getting the chat history`, error);
      throw error;
    }
  }
}

const apiClient = new ApiClient("http://localhost:8080/api/v1");
export default apiClient;
