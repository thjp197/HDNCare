import { io } from "socket.io-client";

const backendUrl =
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_BACKEND_URL ||
  "http://localhost:4000";

export const socket = io(backendUrl);
