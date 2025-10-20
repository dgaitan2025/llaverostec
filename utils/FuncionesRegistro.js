//funcion para verificar la edad

export const validarEdad = (v) => {
  if (!v) return "Debe ingresar una fecha" 

  const hoy = new Date()
  const fechaNac = new Date(v)

  let edad = hoy.getFullYear() - fechaNac.getFullYear()
  const m = hoy.getMonth() - fechaNac.getMonth()
  const d = hoy.getDate() - fechaNac.getDate()

  // Ajustar si aún no cumplió años este año
  if (m < 0 || (m === 0 && d < 0)) {
    edad--
  }

  if (edad < 14) return "Debe tener al menos 14 años"
  if (edad > 100) return "La edad no puede ser mayor a 100 años"

  return true
}