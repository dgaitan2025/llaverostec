// DOminio
export const API_RD = "https://localhost:7291"//PRINCIPAL"https://api-llavero-rd.onrender.com" ALTERNO//"https://rd-api-llaveros.onrender.com"//"https://pllaverosweb-d8fnd6d8dyd8hdgb.canadacentral-01.azurewebsites.net"//"https://localhost:7291"//"https://apitect.somee.com"; //RD"http://pruebas.somee.com/"//
const API_DG = "https://api-llaveros.onrender.com"; //DG
const API_biometrica = "https://www.daossystem.pro"


// Endpoints organizados
export const ENDPOINTS = { 
  //Darwin
  listarPuestos: "/api/TipoUsuarios",


  //Ricardo
  login:"/api/Auth/login",
  registro: "/api/Usuarios",
  loginFace:"/api/Auth/login-face",
  crearOrden:"/api/ordenes/CrearOrden",
  obtenerOrdenOP:"/api/ordenes/OrdenesPendientes/{operador}",
  obtenerOrdeneCL: (usuarioId) => `/api/ordenes/GetordenesUsuario?UsuarioId=${usuarioId}`,
  actualizarEstadoOrden: "/api/ordenes/ActualizarEstadoOrden",
  conexionWS:"/hubs/ordenes",
  ordenesFinalizadas: "/api/ordenes/OrdenesFinalizadas/{id}",
  qaRechazada:"/api/ordenes/QA",
  ordenesPendienteEntrega:"/api/ordenes/GetordenesPendienteEntrega",
  pagarOrden:"/api/ordenes/Pagar_orden",
  usuarioEntrega:"/api/ordenes/Registrar_entregaUsuario",
  PendienteEntegaDomicilio:"/api/ordenes/PendienteEntregaDomicilio",
  pendienteAsinarDomicilio:"/api/ordenes/PendienteAsignarRepartidor",
  ordenAsignadasRepartidor:(id)=>`/api/ordenes/OrdenesPorRepartidor/${id}`,
  ordenesClientesProceso:"/api/ordenes/GetordenesUsuarios",

  //Biometria
  segmentar: "/api/Rostro/Segmentar",
  verificar: "/api/Rostro/Verificar"


};

// Helper para armar URLs completas
export const UrlWithApiRD = (endpoint) => `${API_RD}${endpoint}`;
export const UrlWithApiDG = (endpoint) => `${API_DG}${endpoint}`;
export const UrlWithApiFace = (endpoint) => `${API_biometrica}${endpoint}`;