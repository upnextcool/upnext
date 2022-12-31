<template>
  <v-main :style="background">
    <v-app-bar
      class="px-6"
      fixed
      color="transparent"
      dark
      elevation="0"
      height="90"
      app
    >
      <div style="flex: 1; display: flex; flex-direction: row">
        <v-icon color="primary" x-large>mdi-music-note-plus</v-icon>
        <v-toolbar-title class="text-uppercase ml-4">
          <h1 class="text-h4 font-weight-light">UpNext</h1>
        </v-toolbar-title>
      </div>
      <v-spacer />
      <div
        style="
          flex: 1;
          display: flex;
          flex-direction: row;
          align-items: center;
          justify-content: center;
        "
      >
        <span class="text-h6">{{ partyName }}</span>
      </div>
      <v-spacer />
      <div style="flex: 1; display: flex; flex-direction: row-reverse">
        <span class="party-code text-h4 text-uppercase">{{ partyCode }}</span>
      </div>
    </v-app-bar>
    <v-container v-if="partyState" fluid>
      <v-row>
        <v-col cols="5">
          <v-responsive class="mx-auto px-7 pb-7" aspect-ratio="1">
            <v-card
              rounded
              elevation="20"
              :key="partyState.artwork"
              class="text-center"
            >
              <v-img :src="partyState.artwork" class="elevation-0" contain>
              </v-img>
            </v-card>
          </v-responsive>
          <v-sheet
            style="display: flex; flex-direction: column"
            color="transparent"
            class="mx-7"
          >
            <h1 class="text-h5 ellipsis">{{ partyState.name }}</h1>
            <h1 class="text-h6 font-weight-light mb-5 ellipsis">
              {{ partyState.artist }}
            </h1>
          </v-sheet>
          <v-card color="transparent" elevation="0" class="mx-7">
            <v-progress-linear
              rounded
              color="white"
              :value="progressPercent"
            ></v-progress-linear>
            <div style="display: flex; flex-direction: row">
              <span class="text-overline">{{ progress }}</span>
              <v-spacer></v-spacer>
              <span class="text-overline">{{ duration }}</span>
            </div>
          </v-card>
        </v-col>
        <v-divider vertical></v-divider>
        <v-col cols="7">
          <v-row>
            <v-col cols="7" class="px-6">
              <h1 class="text-h6 font-weight-light ellipsis">Queue</h1>
              <v-list v-if="queue" color="transparent" class="ma-0 pa-0">
                <template v-for="item in sortedQueue">
                  <v-list-item three-line :key="item.id">
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
                      {{ processVotes(item.votes) }}
                    </v-list-item-action>
                  </v-list-item>
                  <v-divider :key="item.id + 'l'"></v-divider>
                </template>
              </v-list>
            </v-col>
            <v-divider vertical></v-divider>
            <v-col cols="5" class="px-6">
              <h1 class="text-h6 font-weight-light ellipsis">Scoreboard</h1>
              <v-list color="transparent" class="ma-0 pa-0">
                <template v-for="member in sortedMembers">
                  <v-list-item :key="member.id">
                    <!--                    <v-list-item-avatar>-->
                    <!--                      <span>{{ member.score }}</span>-->
                    <!--                    </v-list-item-avatar>-->
                    <v-list-item-content>
                      <v-list-item-title>
                        {{ member.username }}
                      </v-list-item-title>
                      <v-list-item-subtitle>
                        Partying for {{ format(member.joinedAt) }}
                      </v-list-item-subtitle>
                    </v-list-item-content>
                  </v-list-item>
                </template>
              </v-list>
            </v-col>
          </v-row>
        </v-col>
      </v-row>
    </v-container>
  </v-main>
</template>

<script>
import {
  GET_PARTY_STATE,
  PARTY,
  QUEUE,
  USERS_AT_PARTY,
} from "../../../graphql";
import * as dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

export default {
  data: () => ({
    partyState: null,
    progressPercent: 0,
    progressInterval: null,
    projectedTime: 0,
    previousTime: null,
  }),
  watch: {
    progressTime(val) {
      this.projectedTime = val;
      if (this.previousTime === null) {
        clearInterval(this.progressInterval);
        this.progressInterval = setInterval(() => {
          this.projectedTime += 100;
          this.progressPercent =
            (this.projectedTime / this.partyState.duration) * 100;
        }, 50);
      }

      this.previousTime = val;
    },
  },
  methods: {
    format(date) {
      return dayjs(date).fromNow(true);
    },
    processVotes(votes) {
      return votes
        .map((e) => (e.type === "UP_VOTE" ? 1 : -1))
        .reduce((p, c) => p + c, 0);
    },
  },
  computed: {
    progressTime() {
      return this.partyState?.progress ?? 0;
    },
    background() {
      return this.partyState
        ? `background-image: linear-gradient(rgba(0,0,0,0.1) 1%, ${
            this.partyState.palette
              ? this.partyState.palette.darkVibrant ??
                this.partyState.palette.darkMuted
              : "000000"
          }ff 100%);`
        : "";
    },
    partyCode() {
      return this.party?.code ?? "";
    },
    partyName() {
      return this.party?.name ?? "";
    },
    progress() {
      const asSeconds = (this.partyState?.progress ?? 0) / 1000;
      const m = Math.floor(asSeconds / 60);
      const s = Math.floor(asSeconds - Math.floor(asSeconds / 60) * 60);
      return `${m}:${s < 10 ? "0" : ""}${s}`;
    },
    duration() {
      const asSeconds = (this.partyState?.duration ?? 0) / 1000;
      const m = Math.floor(asSeconds / 60);
      const s = Math.floor(asSeconds - Math.floor(asSeconds / 60) * 60);
      return `${m}:${s < 10 ? "0" : ""}${s}`;
    },
    sortedMembers() {
      return (this.members ?? []).sort((a, b) => a.score - b.score);
    },
    sortedQueue() {
      return (this.queue ?? [])
        .map((q) => ({ ...q, score: this.processVotes(q.votes) }))
        .sort((a, b) => b.score - a.score);
    },
  },
  apollo: {
    party: PARTY,
    members: {
      query: USERS_AT_PARTY,
      pollInterval: 2000,
    },
    partyState: {
      query: GET_PARTY_STATE,
      pollInterval: 1000,
    },
    queue: {
      query: QUEUE,
      pollInterval: 500,
    },
  },
};
</script>

<style scoped>
.party-code {
  font-family: monospace !important;
}
</style>
