
export default defineNuxtRouteMiddleware((to, from) => {
  const usuario = useCookie("usuario")

  if (to.path === '/usuario' && !usuario.value) {
    return navigateTo('/login', { replace: true })
  }
})