// src/utils/signalr.js
import * as signalR from "@microsoft/signalr";

let connection = null;
let startPromise = null;

// گروه‌هایی که این تب الان عضوشونه — بعد از هر reconnect خودکار
// باید دوباره join بزنیم چون عضویت گروه به ConnectionId وصله نه به کاربر
const activeRooms = new Map(); // key: `${role}:${restaurantId}`

export function getMusicConnection() {
  if (connection) return connection;

  connection = new signalR.HubConnectionBuilder()
    .withUrl(`${import.meta.env.VITE_SERVER_URL}/hubs/music`, {
      accessTokenFactory: () => localStorage.getItem("accessToken"),
    })
    .withAutomaticReconnect()
    .build();

  connection.onreconnected(async () => {
    for (const { joinMethod, restaurantId } of activeRooms.values()) {
      try {
        await connection.invoke(joinMethod, restaurantId);
      } catch (err) {
        console.error(`SignalR rejoin (${joinMethod}) failed:`, err);
      }
    }
  });

  return connection;
}

export async function ensureMusicConnectionStarted() {
  const conn = getMusicConnection();
  if (conn.state === "Connected") return conn;

  if (!startPromise) {
    startPromise = conn.start().catch((err) => {
      startPromise = null;
      throw err;
    });
  }
  await startPromise;
  return conn;
}

export function registerActiveRoom(role, restaurantId, joinMethod) {
  activeRooms.set(`${role}:${restaurantId}`, { joinMethod, restaurantId });
}

export function unregisterActiveRoom(role, restaurantId) {
  activeRooms.delete(`${role}:${restaurantId}`);
}
