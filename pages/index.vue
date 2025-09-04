<script setup lang="ts">
import BarraInicio from '../components/barraInicio.vue';
import Card from '../components/card.vue';
import Carruosell from '../components/carruosell.vue';

</script>

<template>
    <v-container fluid>
        <BarraInicio />
        <carruosell />
        <Card title="Visión"
        id="vision" 
        text="Convertirnos en una empresa innovadora, sostenible y de confianza, 
        que transforme la vida de nuestros clientes a través de productos y 
        servicios de alta calidad, utilizando la tecnología y la creatividad como 
        motores de crecimiento, generando valor para la sociedad y oportunidades 
        de desarrollo para nuestro equipo."
        image="/imagenes/vision.jpg" 
        :imageLeft="true" />

        <Card title="Misión" 
        id="mision" 
        text="Brindar soluciones innovadoras y accesibles que satisfagan 
        las necesidades de nuestros clientes, ofreciendo productos y 
        servicios de calidad, apoyados en la tecnología, la creatividad y 
        un equipo comprometido"
        image="/imagenes/mision.jpg" 
        :imageLeft="false" />

        <Card title="Contacto" 
        id="contacto" 
        text="Telefono: 32323232 <br> Correo: darwinnoez@gmail.com <br>
        Direccion:Ciudad, Guatemala
        "
        
        image="/imagenes/contacto.jpg" 
        :imageLeft="true" />
    </v-container>
</template>