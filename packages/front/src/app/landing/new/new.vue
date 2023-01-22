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
        <v-icon color="primary">mdi-music-note-plus</v-icon>
        <v-toolbar-title class="text-uppercase ml-3">
          <h1 class="text-h6 font-weight-light">UpNext</h1>
        </v-toolbar-title>
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
      <v-container class="pt-10" fluid>
        <div class="wrapper">
          <p class="blurb">
            Give your party a name to get started!
          </p>
          <div class="nickname-input">
            <v-form @submit.prevent="join" autocomplete="off" v-model="valid">
              <v-text-field
                autofocus
                maxlength="20"
                label="Party Name"
                outlined
                v-model="partyName"
                :rules="[rules.required, rules.limit, rules.minimum]"
              ></v-text-field>
              <v-btn
                block
                tile
                color="primary"
                x-large
                @click="join"
                :disabled="!valid"
              >
                Start the party
              </v-btn>
            </v-form>
          </div>
        </div>

      </v-container>
    </template>
  </v-navigation-drawer>
</template>

<script lang="ts">
import Vue from 'vue';
import {START_AUTH, START_PARTY} from "../../../graphql";

export default Vue.extend({
  name: 'unc-landing-new',
  components: {},
  data: () => ({
    partyName: '',
    valid: false,
    loading: false,
    rules: {
      required: (value: string) => !!value || 'Required',
      limit: (value: string) =>
        (value ? value.length : 0) <= 20 || 'Nickname less than 20 chars',
      minimum: (value: string) =>
        (value ? value.length : 0) > 1 || 'Nickname 2 or more chars',
      requiredLength: (value: string) =>
        (value ? value.length : 0) === 4 || 'Party code is 4 chars long',
    },
  }),
  methods: {
    async join() {
      this.loading = true;
      const { data: partyData } = await this.$apollo.mutate({
        mutation: START_PARTY,
        variables: {
          partyName: this.partyName,
        },
      });

      const { data: authData } = await this.$apollo.mutate({
        mutation: START_AUTH,
        variables: {
          userId: localStorage.getItem("session"),
          partyId: partyData.party.id,
        },
      });

      location.href = authData.url;
    },
  },
});
</script>

<style lang="scss">
.wrapper {
  max-width: 500px;
  margin-inline: auto;
}

.blurb {
  margin-inline: 1rem;
}

.nickname-input {
  margin-top: 3rem;
  margin-inline: 1rem;
}
</style>
