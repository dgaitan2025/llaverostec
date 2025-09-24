export default defineNuxtRouteMiddleware((to) => {
  const usuario = useCookie("usuario")

  if (to.path === '/usuario' && !usuario.value) {
    console.log("ingreso al false")
    return navigateTo('/login', { replace: true })
  }

  
})