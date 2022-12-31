<template>
  <v-app-bar fixed color="transparent" dark elevation="0">
    <v-icon color="primary">mdi-music-note-plus</v-icon>
    <v-toolbar-title class="text-uppercase ml-3">
      <h1 class="text-h6 font-weight-light">UpNext</h1>
    </v-toolbar-title>
    <v-spacer />
    <app-home-menu></app-home-menu>
  </v-app-bar>
</template>
<script>
import AppHomeMenu from "./menu";

export default {
  name: "app-home-header",
  components: { AppHomeMenu },
};
</script>
