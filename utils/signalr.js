import * as signalR from "@microsoft/signalr";
import { UrlWithApiRD, ENDPOINTS } from "../Service/apiConfig";

const API_URL = UrlWithApiRD(ENDPOINTS.conexionWS);
//console.log("API_URL", API_URL);

let connection = null;
let listeners = {}; 

export function on(eventName, handler) {
  // Si el mismo handler ya está registrado, no volver a agregarlo
  if (listeners[eventName] === handler) return;

  listeners[eventName] = handler;

  if (connection && typeof connection.on === "function") {
    connection.off(eventName); // elimina handlers previos
    connection.on(eventName, handler);
  }
}

export async function startConnection(getToken = null) {
  if (connection && connection.connectionState === "Connected") {
   // console.log("⚡ SignalR ya está conectado");
    return;
  }

  connection = new signalR.HubConnectionBuilder()
    .withUrl(API_URL, {
      withCredentials: true,
      // accessTokenFactory: () => getToken ? getToken() : "",
    })
    .withAutomaticReconnect()
    .configureLogging(signalR.LogLevel.Information)
    .build();

  // aplica los listeners guardados
  for (const [evt, handler] of Object.entries(listeners)) {
    if (typeof connection.on === "function") {
      connection.off(evt);
      connection.on(evt, handler);
    }
  }

  try {
    await connection.start();
   // console.log("✅ Conectado a SignalR:", API_URL);
  } catch (err) {
    console.error("❌ Error al conectar SignalR:", err);
    setTimeout(() => startConnection(getToken), 5000);
  }
}

export async function stopConnection() {
  if (connection && typeof connection.stop === "function") {
    await connection.stop();
  //  console.log("🧹 Conexión SignalR detenida");
  }
}

export { connection };