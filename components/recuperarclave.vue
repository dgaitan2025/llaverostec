<template>
  <v-dialog
  :model-value="modelValue"
  @update:model-value="$emit('update:modelValue', $event)"
  transition="dialog-top-transition"
  width="400"
> 
    <v-card>
      <v-toolbar color="indigo-lighten-1" dark>
        <v-toolbar-title>Recuperación de contraseña</v-toolbar-title>
      </v-toolbar>

      <v-card-text>
        <v-form ref="form" v-model="valid" lazy-validation>
          <v-text-field
            v-model="userName"
            :rules="[v => !!v || 'El usuario es requerido']"
            label="Nombre de usuario"
            prepend-inner-icon="mdi-account"
            required
          />
        </v-form>
      </v-card-text>

      <v-card-actions class="justify-end">
        <v-btn text color="red" @click="$emit('update:modelValue', false)">
          Cerrar
        </v-btn>
        <v-btn color="primary" :loading="loading" @click="submitForm">
          Enviar
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref } from "vue"

const props = defineProps({
  modelValue: Boolean // viene del padre
})

const emit = defineEmits(["update:modelValue"])

const userName = ref("")
const valid = ref(false)
const form = ref(null)
const loading = ref(false)

const submitForm = async () => {
  const { valid } = await form.value.validate()
    if (!valid) return

  loading.value = true
  setTimeout(() => {
    loading.value = false
    alert(`Se ha enviado un correo de recuperación a: ${userName.value}`)
    emit("update:modelValue", false) // cierra el modal
    userName.value = ""
  }, 2000)
}
</script>
