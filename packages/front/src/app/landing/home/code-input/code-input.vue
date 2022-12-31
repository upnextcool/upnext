<template>
  <div class="code-input">
    <div class="party-code-input-wrapper">
      <v-text-field
        maxlength="1"
        outlined
        type="tel"
        autocomplete="off"
        height="5rem"
        ref="input1"
        v-model="code1"
        @input="code1Change"
        name="code"
        placeholder="#"
        autofocus
        dense
        hide-details
      />
      <v-text-field
        maxlength="1"
        outlined
        type="tel"
        autocomplete="off"
        height="5rem"
        ref="input2"
        v-model="code2"
        @input="code2Change"
        placeholder="#"
        dense
        hide-details
      />
      <v-text-field
        maxlength="1"
        outlined
        type="tel"
        autocomplete="off"
        height="5rem"
        ref="input3"
        v-model="code3"
        @input="code3Change"
        placeholder="#"
        dense
        hide-details
      />
      <v-text-field
        maxlength="1"
        outlined
        type="tel"
        autocomplete="off"
        height="5rem"
        ref="input4"
        v-model="code4"
        @input="code4Change"
        placeholder="#"
        dense
        hide-details
      />
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
  name: 'unc-code-input',
  data: () => ({
    code1: '',
    code2: '',
    code3: '',
    code4: '',
  }),
  methods: {
    code1Change(val: string) {
      if (val && val.length > 0 && !/[0-9]/g.test(val)) {
        (this.$refs.input1 as any)?.reset();
      }
    },
    code2Change(val: string) {
      if (val && val.length > 0 && !/[0-9]/g.test(val)) {
        (this.$refs.input2 as any)?.reset();
      }
    },
    code3Change(val: string) {
      if (val && val.length > 0 && !/[0-9]/g.test(val)) {
        (this.$refs.input3 as any)?.reset();
      }
    },
    code4Change(val: string) {
      if (val && val.length > 0 && !/[0-9]/g.test(val)) {
        (this.$refs.input4 as any)?.reset();
      }
    },
  },
  computed: {
    code() {
      return this.code1 + this.code2 + this.code3 + this.code4;
    },
  },
  watch: {
    code1(val: string) {
      if (Number.isNaN(Number.parseInt(val))) {
        return;
      }

      if (val.length === 1) {
        (this.$refs.input2 as any)?.focus();
      } else if (val.length === 0) {
        // do nothing
      }
    },
    code2(val) {
      if (Number.isNaN(Number.parseInt(val))) {
        return;
      }

      if (val.length === 1) {
        (this.$refs.input3 as any)?.focus();
      } else if (val.length === 0) {
        (this.$refs.input1 as any)?.focus();
      }
    },
    code3(val) {
      if (Number.isNaN(Number.parseInt(val))) {
        return;
      }

      if (val.length === 1) {
        (this.$refs.input4 as any)?.focus();
      } else if (val.length === 0) {
        (this.$refs.input2 as any)?.focus();
      }
    },
    code4(val) {
      if (Number.isNaN(Number.parseInt(val))) {
        return;
      }

      if (val.length === 1) {
        (this.$refs.input4 as any)?.blur();
        this.$emit('code', this.code);
      } else if (val.length === 0) {
        (this.$refs.input3 as any)?.focus();
      }
    },
  },
});
</script>

<style lang="scss">
.code-input {
  padding-inline: 1rem;

  .party-code-input-wrapper {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 1rem;
    & > .v-input {
      font-size: 4rem;
      max-width: 5rem;

      text-align: center;
      input {
        max-height: none;
        text-align: center;
      }
    }
  }
}
</style>
