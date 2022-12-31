<template>
  <v-dialog v-model="voteDialog" :key="index" transition="fab-transition">
    <template v-slot:activator="{ on }">
      <v-list-item dense three-line v-on="on">
        <v-list-item-avatar tile>
          <v-img :src="item.albumArtwork"></v-img>
        </v-list-item-avatar>
        <v-list-item-content>
          <v-list-item-title>
            {{ item.name }}
          </v-list-item-title>
          <v-list-item-subtitle>
            {{ item.artist }}
          </v-list-item-subtitle>
          <v-list-item-subtitle>
            Added by: {{ item.addedBy.username }}
          </v-list-item-subtitle>
        </v-list-item-content>
        <v-list-item-action>
          <span>{{ processVotes(item.votes) }}</span>
        </v-list-item-action>
      </v-list-item>
    </template>
    <v-card height="100" tile>
      <v-container class="ma-0 pa-0">
        <v-row class="ma-0 pa-0">
          <v-col class="ma-0 pa-0" cols="6">
            <v-btn
              @click="downvoteSong(item)"
              block
              class="text-h4 font-weight-thin"
              color="error"
              height="100"
              tile
            >
              <v-icon class="mr-2" left large>mdi-arrow-down</v-icon>
              Nah
            </v-btn>
          </v-col>
          <v-col class="ma-0 pa-0" cols="6">
            <v-btn
              @click="upvoteSong(item)"
              block
              class="text-h4 font-weight-thin"
              color="primary"
              height="100"
              tile
            >
              Yah
              <v-icon class="ml-2" right large>mdi-arrow-up</v-icon>
            </v-btn>
          </v-col>
        </v-row>
      </v-container>
    </v-card>
  </v-dialog>
</template>
<script>
import { DOWNVOTE_SONG, UPVOTE_SONG } from "../../../graphql";

export default {
  name: "app-vote-dialog",
  props: {
    index: Number,
    item: Object,
  },
  data: () => ({
    voteDialog: false,
  }),
  methods: {
    processVotes(votes) {
      return votes
        .map((e) => (e.type === "UP_VOTE" ? 1 : -1))
        .reduce((p, c) => p + c, 0);
    },
    async upvoteSong(entry) {
      this.voteDialog = false;
      await this.$apollo.mutate({
        mutation: UPVOTE_SONG,
        variables: {
          entryId: entry.id,
        },
      });
    },
    async downvoteSong(entry) {
      this.voteDialog = false;
      await this.$apollo.mutate({
        mutation: DOWNVOTE_SONG,
        variables: {
          entryId: entry.id,
        },
      });
    },
  },
};
</script>
