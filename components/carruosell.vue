<template>
    
        <v-carousel width="100%" height="500" style="max-height: 80vh;" show-arrows="hover" cycle
            >
            <v-carousel-item v-for="(slide, i) in slides" :key="i">
                <v-img :color="colors[i]" height="100%">
                    <div class="d-flex fill-height justify-center align-center">
                        <div class="text-h2">
                            {{ slide }} Slide
                        </div>
                    </div>
                </v-img>
            </v-carousel-item>
        </v-carousel>
    
</template>

<script setup>
const colors = [
    'indigo',
    'warning',
    'pink darken-2',
    'red lighten-1',
    'deep-purple accent-4',
]
const slides = [
    'First',
    'Second',
    'Third',
    'Fourth',
    'Fifth',
]
</script>