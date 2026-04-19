import api from "../utils/axios";

export const getPredictions = async () => {
  try {
    const res = await api.get("/predictions");
    return res.data;
  } catch (error) {
    console.error("Failed to fetch predictions:", error);
    return [
      { race: "Next Race", driver: "Max Verstappen", confidence: 92 },
    ];
  }
};