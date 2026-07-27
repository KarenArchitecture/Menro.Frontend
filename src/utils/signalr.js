// src/utils/signalR.js

import * as signalR from "@microsoft/signalr";

let connection = null;

export function getMusicConnection() {
  if (connection) return connection;

  connection = new signalR.HubConnectionBuilder()
    .withUrl(`${import.meta.env.VITE_SERVER_URL}/hubs/music`, {
      accessTokenFactory: () => localStorage.getItem("accessToken"),
    })
    .withAutomaticReconnect()
    .build();

  return connection;
}
