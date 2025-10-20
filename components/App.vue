<template>
  <main style="padding: 2rem; font-family: system-ui, sans-serif;">
    <h1>🛰️ Prueba de SignalR con Vue</h1>

    <div style="margin: 1rem 0;">
      <button @click="conectar" :disabled="conectado">
        {{ conectado ? "Conectado ✅" : "Conectar" }}
      </button>
    </div> 

    <p v-if="estado" style="margin-top: 1rem;">{{ estado }}</p>

    <section v-if="mensajes.length" style="margin-top: 2rem;">
      <h2>Mensajes recibidos:</h2>
      <ul>
        <li v-for="(m, i) in mensajes" :key="i">
          {{ m }}
        </li>
      </ul>
    </section>

    <hr style="margin: 2rem 0;" />

    <h3>📡 Prueba desde tu API:</h3>
    <p>
      Ejecuta en Postman o el navegador:<br />
      <code>POST http://localhost:5077/api/ordenes/saludo?mensaje=PruebaTest</code>
    </p>
  </main>
</template>

<script setup>
import { ref } from "vue";
import { startConnection, on } from "./signalr.js";

const conectado = ref(false);
const estado = ref("");
const mensajes = ref([]);

// Escucha el evento desde el servidor
on("RecibirSaludo", (mensaje) => {
  mensajes.value.push(mensaje);
  console.log("📩 RecibirSaludo:", mensaje);
});

async function conectar() {
  estado.value = "Conectando...";
  await startConnection();
  conectado.value = true;
  estado.value = "Conectado. Esperando mensajes...";
}
</script>