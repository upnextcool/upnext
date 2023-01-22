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
        <unc-info></unc-info>
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
        <unc-membership-dialog></unc-membership-dialog>
        <div class="logo-wrapper">
          <div class="logo-container">
            <v-icon color="primary" size="120">mdi-music-note-plus</v-icon>
            <h1 class="text-h2 text-uppercase font-weight-thin">UpNext</h1>
            <unc-code-input class="code-input" @code="gotCode"></unc-code-input>
            <div v-if="error" class="mt-3" style="color: red">
              Invalid code!
            </div>
          </div>
        </div>
      </v-container>
    </template>
  </v-navigation-drawer>
</template>

<script lang="ts">
import Vue from 'vue';
import CodeInput from './code-input/code-input.vue';
import {CHECK_FOR_MEMBERSHIP, PARTY_BY_CODE} from '../../../graphql';
import Membership from '../membership/membership.vue';
import Info from "./info/info.vue";

export default Vue.extend({
  name: 'unc-landing-home',
  components: {
    'unc-code-input': CodeInput,
    'unc-membership-dialog': Membership,
    'unc-info': Info,
  },
  data: () => ({
    loading: false,
    error: false,
    membership: null
  }),
  async mounted() {
    const { data: membership } = await this.$apollo.query({
      query: CHECK_FOR_MEMBERSHIP,
      variables: {
        userId: localStorage.getItem('session'),
      },
    });
    this.membership = membership.checkForMembership;
  },
  methods: {
    gotCode(code: string) {
      this.error = false;
      this.loading = true;
      this.$apollo
        .query({
          query: PARTY_BY_CODE,
          variables: {
            code,
          },
        })
        .then(() => {
          if ((this.membership as Record<string, string | null> | null)?.code ?? '' === code) {
            return this.$router.push(`/party`);
          }
          return this.$router.push(`/join?code=${code}`);
        })
        .catch(() => {
          this.loading = false;
          this.error = true;
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
