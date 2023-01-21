<template>
  <v-navigation-drawer
    absolute
    color="darker"
    dark
    permanent
    width="100%"
    touchless
  >
    <template v-slot:prepend>
      <v-toolbar class="elevation-0" color="transparent" fixed>
        <v-btn to="/info" icon x-large>
          <v-icon>mdi-information</v-icon>
        </v-btn>
        <v-spacer></v-spacer>
        <v-btn icon to="/new" x-large color="primary">
          <v-icon>mdi-plus</v-icon>
        </v-btn>
      </v-toolbar>
    </template>
    <template v-slot:default>
      <v-overlay :value="loading" opacity="0.8" color="black">
        <v-progress-circular
          indeterminate
          size="150"
          color="primary"
        ></v-progress-circular>
      </v-overlay>
      <v-container class="ma-0 pa-0" fluid>
        <div class="logo-wrapper">
          <div class="logo-container">
            <v-icon color="primary" size="120">mdi-music-note-plus</v-icon>
            <h1 class="text-h2 text-uppercase font-weight-thin">UpNext</h1>
            <unc-code-input class="code-input" @code="gotCode"></unc-code-input>
          </div>
        </div>
      </v-container>
    </template>
  </v-navigation-drawer>
</template>

<script lang="ts">
import Vue from 'vue';
import CodeInput from './code-input/code-input.vue';
import {PARTY_BY_CODE} from '../../../graphql';

export default Vue.extend({
  name: 'unc-landing-home',
  components: {
    'unc-code-input': CodeInput,
  },
  data: () => ({
    loading: false,
  }),
  methods: {
    gotCode(code: string) {
      this.loading = true;
      this.$apollo
        .query({
          query: PARTY_BY_CODE,
          variables: {
            code,
          },
        })
        .then(() => {
          this.$router.push(`/join?code=${code}`);
        })
        .catch((err) => {
          console.log(JSON.stringify(err));
          this.loading = false;
        });
    },
  },
});
</script>

<style lang="scss">
.logo-wrapper {
  width: 100%;
  display: flex;
  justify-content: center;
}

.logo-container {
  flex: 0 1 auto;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.join-form-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.code-input {
  margin-top: 5rem;
}
</style>
