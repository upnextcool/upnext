<template>
  <router-view></router-view>
</template>

<script lang="ts">
import Vue from 'vue';
import { CONFIG, REGISTER_FINGERPRINT } from './graphql';
import FingerprintJS from '@fingerprintjs/fingerprintjs';

export default Vue.extend({
  name: 'unc-code-input',
  async mounted() {
    const { data } = await this.$apollo.query({
      query: CONFIG,
      fetchPolicy: 'no-cache',
    });
    const version = data.config.version;
    const storedVersion = Number.parseInt(
      localStorage.getItem('version') as string
    );
    if (storedVersion && storedVersion < version) {
      location.href = `${location.href}`;
    }
    localStorage.setItem('version', version);

    const fpAgent = await FingerprintJS.load();
    const result = await fpAgent.get();
    const x = await this.$apollo.mutate({
      mutation: REGISTER_FINGERPRINT,
      variables: {
        fingerprint: result.visitorId,
      },
    });
    localStorage.setItem('session', x.data.user.id);
  },
});
</script>

<style lang="scss">
:root {
  color-scheme: dark;
}

.v-application {
  h1,
  h2,
  h3,
  h4,
  h5,
  h6 {
    &.text-h1,
    &.text-h2,
    &.text-h3,
    &.text-h4,
    &.text-h5,
    &.text-h6 {
      font-family: 'Montserrat', sans-serif !important;
    }
  }
}

.ellipsis {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
