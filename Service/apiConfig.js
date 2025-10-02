// DOminio
export const API_RD = "https://localhost:7291"//"https://apitect.somee.com"; //RD"http://pruebas.somee.com/"//
const API_DG = "https://api-llaveros.onrender.com"; //DG
const API_biometrica = "http://www.server.daossystem.pro:3406"


// Endpoints organizados
export const ENDPOINTS = {
  //Darwin
  listarPuestos: "/api/TipoUsuarios",


  //Ricardo
  login:"/api/Auth/login",
  registro: "/api/Usuarios",
  loginFace:"/api/Auth/login-face",

  //Biometria
  segmentar: "/api/Rostro/Segmentar",
  verificar: "/api/Rostro/Verificar"


};

// Helper para armar URLs completas
export const UrlWithApiRD = (endpoint) => `${API_RD}${endpoint}`;
export const UrlWithApiDG = (endpoint) => `${API_DG}${endpoint}`;
export const UrlWithApiFace = (endpoint) => `${API_biometrica}${endpoint}`;