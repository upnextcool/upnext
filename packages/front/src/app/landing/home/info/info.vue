<template>
  <v-dialog v-model="dialog" fullscreen hide-overlay transition="dialog-bottom-transition">
    <template v-slot:activator="{ on, attrs }">
      <v-btn icon x-large  v-bind="attrs" v-on="on">
        <v-icon>mdi-information</v-icon>
      </v-btn>
    </template>

    <v-card>
      <v-card-title >
        Welcome to UpNext
        <v-spacer></v-spacer>
        <v-btn icon x-large @click="dialog = false">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-card-text>
        upnext is the future of party technology.
      </v-card-text>

    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
  name: 'unc-landing-info',
  data: () => ({
    dialog: false,
  }),
});
</script>

<style lang="scss"></style>
