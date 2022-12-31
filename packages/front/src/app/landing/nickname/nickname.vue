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
        <p class="blurb">
          Before you hop in the party, give yourself a name so that everyone
          knows who's adding the bops.
        </p>
        <div class="nickname-input">
          <v-form @submit.prevent="join" autocomplete="off" v-model="valid">
            <v-text-field
              autofocus
              maxlength="20"
              label="Nickname"
              outlined
              v-model="nickname"
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
              Join the party
            </v-btn>
          </v-form>
        </div>
      </v-container>
    </template>
  </v-navigation-drawer>
</template>

<script lang="ts">
import Vue from 'vue';
import {CHECK_FOR_MEMBERSHIP, CONFIG, JOIN_PARTY} from "../../../graphql";

export default Vue.extend({
  name: 'unc-landing-nickname',
  components: {},
  data: () => ({
    nickname: '',
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
  async mounted() {
    const { data } = await this.$apollo.query({
      query: CHECK_FOR_MEMBERSHIP,
      variables: {
        userId: localStorage.getItem("session"),
      },
    });
    console.log(data);
  },
  methods: {
    async join() {
      console.log(this.nickname);
      this.loading = true;
      const code = this.$route.query.code;
      if (!code) {
        return this.$router.push('/');
      }

      const { data: memberData } = await this.$apollo.mutate({
        mutation: JOIN_PARTY,
        variables: {
          username: this.nickname,
          partyCode: code,
          userId: localStorage.getItem("session"),
        },
      });
      localStorage.setItem("token", memberData.token);
      location.href= '/party'
    },
  },
});
</script>

<style lang="scss">

.blurb {
  margin-inline: 1rem;
}

.nickname-input {
  margin-top: 3rem;
  margin-inline: 1rem;
}
</style>
