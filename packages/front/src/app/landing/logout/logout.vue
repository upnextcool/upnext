<template>
  <v-container fluid class="fill-height">
    <v-col cols="12">
      <v-row justify="center" align="center">
        <v-card elevation="0" color="transparent" class="text-center">
          <v-progress-circular
            indeterminate
            color="primary"
            size="150"
            class="mb-10"
          ></v-progress-circular>
          <h1 class="text-h4 font-weight-thin">Logging out</h1>
        </v-card>
      </v-row>
    </v-col>
  </v-container>
</template>

<script lang="ts">
import Vue from 'vue';
import {LEAVE_PARTY} from '../../../graphql';

export default Vue.extend({
  name: 'unc-landing-logout',
  mounted() {
    this.$apollo
      .mutate({
        mutation: LEAVE_PARTY,
        variables: {
          userId: localStorage.getItem('session'),
        },
      })
      .catch((err) => {
        console.error(err);
      })
      .finally(() => {
        localStorage.removeItem('token');
        setTimeout(() => {
          this.$router.push('/');
        }, 1000);
      });
  },
});
</script>
