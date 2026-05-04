import { io } from "socket.io-client";

const BASE_URL = (import.meta.env.VITE_API_BASE_URL as string ?? "").replace(/\/api.*$/, "").replace(/\/$/, "");

const socket = io(BASE_URL, { autoConnect: true, transports: ["websocket"] });

export default socket;
