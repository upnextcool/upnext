<template>
  <v-app dark>
    <router-view></router-view>
    <app-bottom-nav />
  </v-app>
</template>

<script>
import AppBottomNav from './shared/bottom-nav';
import { VALID_TOKEN } from '../../graphql';

export default {
  components: { AppBottomNav },
  watch: {
    validToken(val) {
      if (val === false) {
        this.$router.push('/logout');
      }
    },
  },
  apollo: {
    validToken: {
      query: VALID_TOKEN,
      pollInterval: 60 * 1000,
      error() {
        this.$router.push('/logout');
      },
    },
  },
};
</script>
