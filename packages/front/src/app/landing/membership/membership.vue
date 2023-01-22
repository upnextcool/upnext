<template>
  <v-dialog v-model="partyMembershipDialog" width="400" persistent>
    <v-card>
      <v-card-title> You're already partying! </v-card-title>

      <v-card-text>
        Looks like you're already a part of a party.
        <br />
        Would you like to jump back in?
        <br><br>
        <b>Party name</b>: {{ party?.name }}
        <br>
        <b>Party code</b>: {{ party?.code}}
      </v-card-text>

      <v-divider></v-divider>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn text @click="partyMembershipDialog = false"> Cancel </v-btn>
        <v-btn color="primary" text @click="joinPartyAgain"> reJoin </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import Vue from 'vue';
import { CHECK_FOR_MEMBERSHIP, PARTY_BY_CODE } from '../../../graphql';

export default Vue.extend({
  name: 'unc-membership-dialog',
  data: () => ({
    partyMembershipDialog: false,
    party: null
  }),
  async mounted() {
    const { data: membership } = await this.$apollo.query({
      query: CHECK_FOR_MEMBERSHIP,
      variables: {
        userId: localStorage.getItem('session'),
      },
    });
    if (membership.checkForMembership) {
      const { data: party } = await this.$apollo.query({
        query: PARTY_BY_CODE,
        variables: {
          code: membership.checkForMembership.code,
        },
      });
      this.party = party.partyByCode;
      this.partyMembershipDialog = true;
    }
  },
  methods: {
    joinPartyAgain() {
      this.$router.push('/party');
    }
  }
});
</script>
