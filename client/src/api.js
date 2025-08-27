import axios from "axios";

const API = axios.create({ baseURL: "http://localhost:5000/api" });

export const getEvents = () => API.get("/events");
export const createEvent = (data) => API.post("/events", data);
export const deleteEvent = (id) => API.delete(`/events/${id}`); 
export const updateEvent = (id, data) => API.put(`/events/${id}`, data);

export default API;