// src/utils/signalR.js

import * as signalR from "@microsoft/signalr";

console.log("SIGNALR INSTANCE CREATED");
export const musicConnection = new signalR.HubConnectionBuilder()
  .withUrl(`${import.meta.env.VITE_SERVER_URL}/hubs/music`, {
    withCredentials: true,
  })
  .withAutomaticReconnect()
  .build();
