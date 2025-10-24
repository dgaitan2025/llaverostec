// ✅ src/Funciones/PagoRecurrente.js
const BACKEND_URL = "https://pllaverosweb-d8fnd6d8dyd8hdgb.canadacentral-01.azurewebsites.net";

export async function crearCheckout(OrdenId) {
  // ✅ Validaciones básicas
  if (!BACKEND_URL.startsWith("https")) {
    throw new Error("Configura BACKEND_URL con tu dominio HTTPS de Azure.");
  }

  if (!(OrdenId> 0)) {
    throw new Error("No es una orden valida");
  }

  // ✅ Armar datos para enviar al backend
  const payload = {
    OrdenId,
    successUrl: `${location.origin}/usuario?estado=exito`,
    cancelUrl: `${location.origin}/usuario?estado=cancelado`
  };

  console.log("📦 Enviando payload:", payload);

  try {
    const r = await fetch(`${BACKEND_URL}/api/pagos/checkout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const data = await r.json();

    if (!r.ok) {
      console.error("❌ Error del backend:", data);
      throw new Error(typeof data === "string" ? data : JSON.stringify(data));
    }

    if (data.checkoutUrl) {
      console.log("✅ Checkout creado:", data.checkoutUrl);
      // 🔹 Redirige automáticamente
      window.location.href = data.checkoutUrl;
      //return data.checkoutUrl;
      
    } else {
      throw new Error("El backend no devolvió checkoutUrl. Respuesta: " + JSON.stringify(data));
    }
  } catch (e) {
    console.error("⚠️ Error al crear checkout:", e.message);
    throw e;
  }
}
