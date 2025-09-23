export default defineNuxtRouteMiddleware((to) => {
  const usuario = useCookie("usuario")

  console.log("¿Estoy en /usuario?:", to.path === '/usuario')
  console.log("¿Usuario vacío?:", !usuario.value)

  if (to.path === '/usuario' && !usuario.value) {
    console.log("ingreso al false")
    return navigateTo('/login', { replace: true })
  }
})