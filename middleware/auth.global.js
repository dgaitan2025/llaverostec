

export default defineNuxtRouteMiddleware((to, from) => {
  if (process.server) return   // 🚫 no se ejecuta en SSR

  const usuario = localStorage.getItem("usuario")

  if (to.path === '/usuario' && !usuario) {
    return navigateTo('/login')
  }
})