import axios from "./axios";

export const fetchVideos = (category) => {
  const params = category && category !== "All" ? { category } : {};
  return axios.get("/videos", { params });
};