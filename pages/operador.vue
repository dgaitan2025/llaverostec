<template>
  
  <Sidebar v-if="usuario && usuario.fotografia2" :foto="usuario.fotografia2" :title="usuario.nickname"
    :subtitle="usuario.email" :items="menuItems" @item-click="handleMenuClick">
    <div class="pa-6 text-center">
      <v-avatar size="80" class="cursor-pointer" @click="dialogFoto = true">
        <v-img :src="usuario.fotografia2" alt="Foto de usuario" />
      </v-avatar>
      <h2 class="mt-4">Bienvenido {{ usuario.nickname }}</h2>
      <p>Proceso de llavero</p>
    </div>

    <!-- Formulario NFC -->
    <div v-if="mostrarFormulario" class="pa-6 text-center">


      <v-select class="mt-4" v-model="formDataNFC.id_tipo_grabado" :items="[
        { text: 'URL', value: 1 },
        { text: 'Contacto', value: 2 }
      ]" item-title="text" item-value="value" label="Grabador de NFC" disabled />

      <!-- URL -->
      <div v-if="formDataNFC.id_tipo_grabado === 1">
        <v-text-field v-model="formDataNFC.link" label="Ingresa la URL" type="url" disabled />
      </div>

      <!-- Contacto -->
      <div v-else-if="formDataNFC.id_tipo_grabado === 2">
        <v-text-field v-model="formDataNFC.nombre" label="Nombre" disabled />
        <v-text-field v-model="formDataNFC.telefono_detalle" label="Teléfono" disabled />
      </div>

      <!-- Foto Anverso -->
      <v-select v-model="opcionFoto" :items="['Tomar Foto', 'Subir Archivo']" label="Fotografía Anverso"
        prepend-icon="mdi-camera" @update:model-value="manejarSeleccionFoto" disabled />

      <input ref="fileInput" type="file" accept="image/*" hidden @change="mostrarPreview1" />

      <div v-if="formDataNFC.foto_anverso" class="mt-4 text-center">
        <div
          style="width:3.4cm; height:4.5cm; border:1px solid #000; overflow:hidden; margin:auto; display:flex; align-items:center; justify-content:center;">
          <img :src="`data:image/png;base64,${formDataNFC.foto_anverso}`" :style="{
            transform: `rotate(${rotation}deg)`,
            objectFit: 'contain',
            width: 'auto',
            height: '100%'
          }" />
        </div>
        <v-btn color="primary" size="small" class="mt-2" @click="rotarImagen">Rotar</v-btn>
      </div>

      <!-- Foto Reverso -->
      <v-select v-model="opcionFoto2" :items="['Tomar Foto 2', 'Subir Archivo 2']" label="Fotografía Reverso"
        prepend-icon="mdi-camera" @update:model-value="manejarSeleccionFoto2" disabled />

      <input ref="fileInput2" type="file" accept="image/*" hidden @change="mostrarPreview2" />

      <div v-if="formDataNFC.foto_reverso" class="mt-4 text-center">
        <div
          style="width:3.4cm; height:4.5cm; border:1px solid #000; overflow:hidden; margin:auto; display:flex; align-items:center; justify-content:center;">
          <!-- Imagen -->
          <div
            style="width:3.5cm; height:4.5cm; border:1px solid #000; overflow:hidden; margin:auto; display:flex; align-items:center; justify-content:center;">
            <img :src="`data:image/png;base64,${formDataNFC.foto_reverso}`" :style="{
              transform: `rotate(${rotation2}deg)`,
              objectFit: 'contain',
              width: 'auto',
              height: '100%'
            }" />
          </div>
        </div>
        <v-btn color="primary" size="small" class="mt-2" @click="rotarImagen2">Rotar</v-btn>
      </div>

      <BotonSecuencial :acciones="acciones" :fase-actual="formDataNFC?.fase_actual" />
      


    </div>
  </Sidebar>



  <!-- Foto ampliada -->
  <v-dialog v-model="dialogFoto" max-width="500">
    <v-card>
      <v-img :src="usuario.fotografia2" alt="Foto en grande" />
      <v-card-actions class="justify-center">
        <v-btn color="primary" @click="dialogFoto = false">Cerrar</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <PiePagina />

  <v-dialog v-model="dialogQA" max-width="400" persistent>
    <v-card class="pa-6 text-center">
      <v-card-title class="text-h6 font-weight-bold">
        Control de Calidad
      </v-card-title>

      <v-card-text>
        ¿El producto pasó el control de calidad?
      </v-card-text>

      <v-card-actions class="justify-center gap-4">
        <v-btn color="success" variant="elevated" @click="seleccionarResultadoQA(true)">
          ✅ Funcional
        </v-btn>
        <v-btn color="error" variant="elevated" @click="seleccionarResultadoQA(false)">
          ❌ No funcional
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <v-dialog v-model="visible" max-width="450" persistent>
    <v-card class="pa-6">
      <v-card-title class="text-h6 font-weight-bold text-center">
        Motivo del Rechazo
      </v-card-title>

      <v-form ref="formRechazo" v-model="formValido">
        <v-card-text>
          <!-- Radios requeridos -->
          <v-radio-group v-model="opcionSeleccionada" :rules="[v => !!v || 'Debes seleccionar un motivo']"
            label="Selecciona el tipo de rechazo" class="mb-4">
            <v-radio label="Impresión" value="Impresión" color="primary" />
            <v-radio label="Programación QR" value="Programación" color="secondary" />
          </v-radio-group>

          <!-- Comentario obligatorio -->
          <v-textarea v-model="comentario" label="Comentario" placeholder="Describe brevemente el problema..."
            :rules="[v => !!v?.trim() || 'El comentario es obligatorio']" rows="3" auto-grow clearable />
        </v-card-text>

        <v-card-actions class="justify-center mt-3">
          <v-btn color="primary" variant="flat" @click="confirmar">Confirmar</v-btn>
          <v-btn text color="grey" @click="cancelar">Cancelar</v-btn>
        </v-card-actions>
      </v-form>
    </v-card>
  </v-dialog>

  <dialogStatus v-model="dialogEvento" :loading="loadingEvento" :state="dialogState" :message="dialogMessage"
    :auto-close="3000" />
</template>

<script setup>
import Sidebar from "../components/barraUser.vue"
import PiePagina from "../components/piePagina.vue"
import { ref, onMounted } from "vue"
import { useRouter } from "vue-router"
import { abrirCamara, cerrarCamara, tomarFoto } from "../utils/camara"
import { generarHtmlImpresion } from "../utils/imprimir"
import BotonSecuencial from "../components/botonMultiTarea.vue"
import { obtenerOrdenPendiente,registrarFaseQA } from "../utils/API_ordenes"
import dialogStatus from "../components/dialogStatus.vue"


const dialogEvento = ref(false)
const loadingEvento = ref(false)
const dialogState = ref("")
const dialogMessage = ref("")
const ordenes = ref([])
const loading = ref(false)

const visible = ref(false);
const formRechazo = ref(null);
const formValido = ref(false);
const opcionSeleccionada = ref(null);
const comentario = ref("");
let resolver = null; // para resolver la promesa

// 🔹 Estado del modal QA
const dialogQA = ref(false)
const resolverQA = ref(null)

// ✅ Método que se exporta para abrir el modal y esperar resultado
const mostrarModalRechazo = () => {
  visible.value = true;
  return new Promise((resolve) => {
    resolver = resolve;
  });
};

async function confirmar() {
  const valido = await formRechazo.value.validate();
  if (!valido.valid) return;

  const resultado = {
    motivo: opcionSeleccionada.value,
    comentario: comentario.value.trim(),
  };

  resolver?.(resultado); // devuelve datos al que abrió el modal
  cerrar();
}

function cancelar() {
  resolver?.(null); // devuelve null si cancela
  cerrar();
}

function cerrar() {
  visible.value = false;
  opcionSeleccionada.value = null;
  comentario.value = "";
  formRechazo.value?.resetValidation();
}

// 🔹 Mostrar el modal y esperar la respuesta (true / false)
const mostrarModalQA = () => {
  dialogQA.value = true
  return new Promise((resolve) => {
    resolverQA.value = resolve
  })
}



// 🔹 Cuando el usuario hace clic en Funcional o No funcional
const seleccionarResultadoQA = (resultado) => {
  dialogQA.value = false
  if (resolverQA.value) resolverQA.value(resultado)
}


onMounted(async () => {
  // registra el listener antes de conectar
  on("RecibirSaludo", async (payload) => {
    console.log("📡 Datos recibidos:", payload);
    ordenes.value = {
      id: payload.orden,
      estado: payload.estado,
      avance: payload.avance,
      pasoActual: payload.pasoActual,
    }
  });

  // inicia conexión
  await startConnection();
});


const orden = ref(0);
const estados = ref("Esperando actualización...");
const avance = ref(0);

const acciones = [
  {
    label: '🖨️ Imprimir', valor: 'imprimir', fase: [3, 4],
    funcion: async () => {
      const resultado = imprimirFotos();

      if (!resultado.ok) {
        return { ok: false, error: resultado.error };
      }

      await avanzarFaseOrden(formDataNFC.value.id_Detalle);
      await new Promise(r => setTimeout(r, 1000));

      return { ok: true };
    }
  },
  {
    label: '📅 Programar',
    valor: 'programar',
    fase: [5],
    funcion: async () => {
      const resultado = await escribir();

      if (!resultado.ok) {
        return { ok: false, error: resultado.error }; // 🚫 Detiene el flujo
      }


      await avanzarFaseOrden(formDataNFC.value.id_Detalle);
      await new Promise(r => setTimeout(r, 1000));
      return { ok: true }; // ✅ Avanza al siguiente paso
    }
  },
  {
    label: 'Control de calidad',
    valor: 'probar',
    fase: [6],
    funcion: async () => {

      try {
        // Mostrar el modal y esperar selección
        const resultado = await mostrarModalQA();

        if (resultado) {
          await avanzarFaseOrden(formDataNFC.value.id_Detalle);
          return { ok: true };
        } else {
          const resultado = await mostrarModalRechazo()

          if (resultado.motivo === "Impresión") {
            await registrarFaseQA(
              {idDetalle: formDataNFC.value.id_Detalle,
                idFase: 4,
                comentario: resultado.comentario})
            console.log(formDataNFC.value.id_Detalle,resultado.comentario)

            console.log("ingreso a la opcion de falla impresion")
            await obtenerOrdenPendiente(usuario.value.usuarioId)
            cargaOrden()

          } else {
            await registrarFaseQA({idDetalle: formDataNFC.value.id_Detalle,
                idFase: 5,
                comentario: resultado.comentario})

            console.log("Ingreso a la opcion de programacion ")
            await obtenerOrdenPendiente(usuario.value.usuarioId)
            cargaOrden()
          }

          console.log("resultado del rechazo ", resultado)


          return { ok: false, error: 'Producto no funcional' };
        }
      } catch (err) {
        console.error("Error al avanzar fase:", err.message);
        dialogEvento.value = true
        dialogState.value = "error";
        dialogMessage.value = "No se pudo avanzar la fase.";
        return { ok: false, error: 'fallo la integracion ' };
      }

    }
  },
  {
    label: '📦 Finalizar', valor: 'entregar', fase: [1],
    funcion: async () => {
     
      //reiniciar formulario
      localStorage.removeItem("ordenPendiente")
      formDataNFC.value = {
        tipoNFC: "",
        textUrl: "",
        id_orden: "",
        fase: "",
        barraAvance: "",
        link: "",
        nombre: "",
        telefono_detalle: "",
        foto_anverso: "",
        foto_reverso: "",
        id_tipo_grabado: null,
        id_Detalle: 0,
        fase_actual: 0,
        domicilio: 0,
      };
      mostrarFormulario.value = false
      dialogEvento.value = true
      loadingEvento.value = true
      dialogState.value = ""
      dialogMessage.value = ""

      //await avanzarFaseOrden(formDataNFC.value.id_Detalle);
      await new Promise(r => setTimeout(r, 500))

      loadingEvento.value = false
      dialogState.value = "success"
      dialogMessage.value = "Orden finalizada " + formDataNFC.value.id_orden

      return { ok: true };
    }
  }
]

const imprimirFotos = () => {
  try {
    const anverso = formDataNFC.value.foto_anverso;
    const reverso = formDataNFC.value.foto_reverso;

    // 🚫 Validar que ambas fotos existan
    if (!anverso || !reverso) {
      alert("⚠️ Faltan fotos. Asegúrate de cargar Anverso y Reverso.");
      return { ok: false, error: "Faltan fotos para imprimir." };
    }

    // 🧩 Generar HTML de impresión
    const html = generarHtmlImpresion({
      anverso: `data:image/png;base64,${anverso}`,
      reverso: `data:image/png;base64,${reverso}`,
      orden: formDataNFC.value.id_orden,
      rotationDegFront: rotation.value || 0,
      rotationDegBack: rotation2.value || 0,
      titulo: "Carnet – Llavero",
    });

    // 🖨️ Abrir ventana e imprimir
    const w = window.open("", "_blank");
    if (!w) {
      return { ok: false, error: "El navegador bloqueó la ventana emergente." };
    }

    w.document.open();
    w.document.write(html);
    w.document.close();

    return { ok: true }; // ✅ Éxito
  } catch (err) {
    console.error("❌ Error al imprimir:", err);
    return { ok: false, error: err.message || "Error al imprimir las fotos." };
  }
};


const dialog = ref(false)
const dialogFoto = ref(false)
const videoRef = ref(null)
const fileInput = ref(null)
const fileInput2 = ref(null)

const opcionFoto = ref(null)
const opcionFoto2 = ref(null)
const mostrarFormulario = ref(false)

const router = useRouter()
const rotation = ref(0)
const rotation2 = ref(0)

const usuario = ref({
  id: null,
  email: "",
  nickname: "",
  fotografia2: ""
})

const formDataNFC = ref({
  tipoNFC: "",
  textUrl: "",
  id_orden: "",
  fase: "",
  barraAvance: "",
  link: "",
  nombre: "",
  telefono_detalle: "",
  foto_anverso: "",
  foto_reverso: "",
  id_tipo_grabado: null,
  id_Detalle: 0,
  fase_actual: 0,
  domicilio: 0,

})

// 🔹 Restaurar datos del localStorage 
onMounted(() => {
  const usuarioGuardado = localStorage.getItem("usuario")
  if (usuarioGuardado) usuario.value = JSON.parse(usuarioGuardado)
})

// 📸 Funciones de cámara
const manejarSeleccionFoto = (valor) => {
  if (valor === "Tomar Foto") onAbrirCamara()
  else if (valor === "Subir Archivo") fileInput.value.click()
}

const manejarSeleccionFoto2 = (valor) => {
  if (valor === "Tomar Foto 2") onAbrirCamara()
  else if (valor === "Subir Archivo 2") fileInput2.value.click()
}

const onAbrirCamara = () => abrirCamara(dialog, videoRef, fileInput)


const mostrarPreview1 = (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (ev) => {
    const img = new Image();
    img.onload = () => {
      // Conversión: 4.7 cm ≈ 177 px (alto), 3.4 cm ≈ 128 px (ancho)
      const width = 128;
      const height = 177;

      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      canvas.width = width;
      canvas.height = height;

      // Fondo blanco
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, width, height);

      // Escala proporcional
      const scale = Math.min(width / img.width, height / img.height);
      const x = (width / 2) - (img.width / 2) * scale;
      const y = (height / 2) - (img.height / 2) * scale;

      // Dibuja imagen ajustada y centrada
      ctx.drawImage(img, x, y, img.width * scale, img.height * scale);

      // Convierte a Base64 (sin encabezado)
      const resizedDataUrl = canvas.toDataURL("image/jpeg", 0.95);
      formDataNFC.value.foto_anverso = resizedDataUrl.split(",")[1];

      // (Opcional) guardar vista previa completa
      formDataNFC.value.preview_anverso = resizedDataUrl;
    };
    img.src = ev.target.result;
  };
  reader.readAsDataURL(file);
};


const mostrarPreview2 = (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (ev) => {
    const img = new Image();
    img.onload = () => {
      // Conversión: 4.7 cm ≈ 177 px (alto), 3.4 cm ≈ 128 px (ancho)
      const width = 128;
      const height = 177;

      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      canvas.width = width;
      canvas.height = height;

      // Fondo blanco
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, width, height);

      // Escala proporcional y centrado
      const scale = Math.min(width / img.width, height / img.height);
      const x = (width / 2) - (img.width / 2) * scale;
      const y = (height / 2) - (img.height / 2) * scale;

      ctx.drawImage(img, x, y, img.width * scale, img.height * scale);

      // Convierte la imagen a Base64 (sin encabezado)
      const resizedDataUrl = canvas.toDataURL("image/jpeg", 0.95);
      formDataNFC.value.foto_reverso = resizedDataUrl.split(",")[1];

      // (Opcional) guardar versión completa con encabezado para mostrar vista previa
      formDataNFC.value.preview_reverso = resizedDataUrl;
    };
    img.src = ev.target.result;
  };
  reader.readAsDataURL(file);
};


// 🔁 Rotaciones
const rotarImagen = async () => (rotation.value = (rotation.value + 90) % 360)
const rotarImagen2 = async () => (rotation2.value = (rotation2.value + 90) % 360)

// 🔹 Sidebar
const menuItems = [
  { icon: "mdi-briefcase", title: "Asignar Orden", value: "shared" },
  { icon: "mdi-login", title: "Salir", value: "exit" }
]

const ordenPendiente = ref(null)

const handleMenuClick = async (item) => {
  if (item.value === "exit") {
    localStorage.removeItem("usuario")
    localStorage.removeItem("ordenPendiente")
    router.push("/login")
  } else if (item.value === "shared") {
    dialogEvento.value = true
    loadingEvento.value = true
    dialogState.value = ""
    dialogMessage.value = "" 

    // Llamar al backend para obtener orden pendiente
    ordenPendiente.value = await obtenerOrdenPendiente(usuario.value.usuarioId)
    //ordenes.value = await ordenCliente(usuario.value.usuarioId);
    console.log("ordenes paso", ordenes.value)

    // 🔍 Si no hay datos (null, undefined o vacío), cerrar el diálogo y salir
    if (!ordenPendiente.value) {
      loadingEvento.value = false
      dialogState.value = "error"
      dialogMessage.value = "No hay orden pendientes"

      return
    }
    formDataNFC.value = ordenPendiente.value


    console.log("Fase actual", formDataNFC.value.fase_actual)
    if(formDataNFC.value.fase_actual === 3){
       await avanzarFaseOrden(formDataNFC.value.id_Detalle);
       console.log("Fase actual", formDataNFC.value.fase_actual)
    }

   
    

    // Si hay datos, continuar con el flujo normal
   

    // Mostrar formulario
    loadingEvento.value = false
    dialogState.value = "success"
    dialogMessage.value = "Orden " + formDataNFC.value.id_orden
    mostrarFormulario.value = true
  } else {
    mostrarFormulario.value = false
  }
}

async function cargaOrden(datos) {
   const datosGuardados = datos
    if (datosGuardados) {
      formDataNFC.value = datos.value
      console.log("📦 Datos form:", formDataNFC.value)
    }

    orden.value = formDataNFC.value.id_orden
    console.log("✅ Datos de orden:", ordenPendiente.value)
    console.log("Valor de fase ", formDataNFC.value.fase_actual)
  
}

// 🔹 Escritura NFC
async function escribir() {
  dialogEvento.value = true;
  loadingEvento.value = true;
  dialogState.value = "";
  dialogMessage.value = "Aproxime la NFC para grabar"

  console.log("Link a grabar ", formDataNFC.value.link?.trim())

  // 🚫 Validar soporte NFC
  if (!("NDEFReader" in window)) {
    loadingEvento.value = false;
    dialogState.value = "error";
    dialogMessage.value = "Este dispositivo o navegador no soporta NFC.";
    return { ok: false, error: "Navegador no soporta NFC" };
  }

  // 🧩 Crear registro según tipo de grabado
  let record;
  if (formDataNFC.value.id_tipo_grabado === 1) {
    record = { recordType: "url", data: formDataNFC.value.link };
  } else if (formDataNFC.value.id_tipo_grabado === 2) {
    const vcard = `BEGIN:VCARD\r\nVERSION:3.0\r\nFN:${formDataNFC.value.nombre}\r\nTEL:${formDataNFC.value.telefono_detalle}\r\nEND:VCARD`;
    const encoder = new TextEncoder();
    record = {
      recordType: "mime",
      mediaType: "text/vcard",
      data: encoder.encode(vcard),
    };
  } else {
    return { ok: false, error: "Tipo de grabado inválido o no definido." };
  }

  try {
    const ndef = new NDEFReader();
    await ndef.write({ records: [record] });

    // ✅ Éxito
    loadingEvento.value = false;
    dialogState.value = "success";
    dialogMessage.value =
      formDataNFC.value.id_tipo_grabado === 1
        ? "NFC grabado correctamente con la URL."
        : "NFC grabado correctamente con el contacto.";
    console.log("✅ NFC grabado:", record);

    return { ok: true };
  } catch (err) {
    console.error("⚠️ Error al escribir NFC:", err);
    loadingEvento.value = false;
    dialogState.value = "error";
    dialogMessage.value = "Error al grabar NFC.";
    return { ok: false, error: err.message || "Error al grabar NFC" };
  }
}



async function avanzarFaseOrden(idDetalle) {
  const result = await actualizarEstadoOrden(idDetalle);
  if (result?.mensaje) {
    console.log(result.mensaje);
  }
}
</script>
