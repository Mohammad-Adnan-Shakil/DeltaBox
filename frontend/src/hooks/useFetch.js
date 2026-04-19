import { useState, useEffect } from "react";
import api from "../utils/axios";

/**
 * Custom hook for fetching data from APIs
 * @param {string} endpoint - API endpoint
 * @param {array} dependencies - Re-fetch when dependencies change
 * @returns {object} { data, loading, error, refetch }
 */
export const useFetch = (endpoint, dependencies = []) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get(endpoint);
      setData(response.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch data");
      console.error(`Error fetching ${endpoint}:`, err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [endpoint, ...dependencies]);

  return { data, loading, error, refetch: fetchData };
};

/**
 * Custom hook for POST requests
 * @param {string} endpoint - API endpoint
 * @returns {object} { execute, loading, error, data }
 */
export const usePost = (endpoint) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  const execute = async (payload) => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.post(endpoint, payload);
      setData(response.data);
      return response.data;
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Request failed";
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return { execute, loading, error, data };
};

export default useFetch;
