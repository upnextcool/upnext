<template>
  <v-main>
    <v-app-bar fixed elevate-on-scroll color="darker">
      <h1 class="text-h4 font-weight-light ellipsis">History</h1>
      <v-spacer></v-spacer>
    </v-app-bar>
    <v-list color="transparent" class="mt-16 ma-0 pa-0">
      <template v-for="item in sortedHistory">
        <v-list-item dense :key="item.id">
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
            <span class="font-weight-light text-caption">{{
              format(item.playedAt)
            }}</span>
          </v-list-item-content>
          <v-list-item-action>
            <v-bottom-sheet overlay-opacity="0.95">
              <template v-slot:activator="{ on, attrs }">
                <v-btn icon dark v-bind="attrs" v-on="on">
                  <v-icon>mdi-dots-vertical</v-icon>
                </v-btn>
              </template>
              <v-sheet elevation="10" color="darker">
                <v-list>
                  <v-list-item :href="`spotify:track:${item.spotifyId}`">
                    <v-list-item-icon>
                      <v-icon>mdi-spotify</v-icon>
                    </v-list-item-icon>
                    <v-list-item-content>
                      <v-list-item-title>View in Spotify</v-list-item-title>
                    </v-list-item-content>
                    <v-list-item-action>
                      <v-icon>mdi-open-in-new</v-icon>
                    </v-list-item-action>
                  </v-list-item>
                </v-list>
              </v-sheet>
            </v-bottom-sheet>
          </v-list-item-action>
        </v-list-item>
      </template>
    </v-list>
  </v-main>
</template>

<script>
import { HISTORY } from "../../../graphql";
import * as dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

export default {
  name: "history",
  components: {},
  data: () => ({
    history: null,
  }),
  computed: {
    sortedHistory() {
      const x = this.history ? [...this.history] : [];
      x.sort((a, b) => dayjs(b.playedAt).diff(a.playedAt, "seconds"));
      return x;
    },
  },
  methods: {
    format(date) {
      return dayjs(date).fromNow();
    },
  },
  apollo: {
    history: {
      query: HISTORY,
      pollInterval: 60 * 1000,
    },
  },
};
</script>
