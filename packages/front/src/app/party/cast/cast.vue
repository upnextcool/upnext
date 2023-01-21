<template>
  <v-main :style="background" class="cast-background">
    <v-navigation-drawer
      absolute
      color="transparent"
      dark
      permanent
      width="100%"
      touchless
    >
      <template v-slot:prepend>
        <v-toolbar class="elevation-0" color="transparent" height="90" fixed>
          <div class="toolbar-wrapper mx-4">
            <div class="toolbar-logo">
              <v-icon color="primary" x-large>mdi-music-note-plus</v-icon>
              <v-toolbar-title class="text-uppercase ml-3">
                <h1 class="text-h4 font-weight-light">UpNext</h1>
              </v-toolbar-title>
            </div>
            <div class="toolbar-party-name">
              <h1 class="text-h4">{{ partyName }}</h1>
            </div>
            <div class="toolbar-party-code">
              <h1 class="text-h4 text-uppercase">{{ partyCode }}</h1>
            </div>
          </div>
        </v-toolbar>
      </template>
      <template v-slot:default>
        <v-overlay :value="false" opacity="0.8" color="black">
          <v-progress-circular
            indeterminate
            size="150"
            color="primary"
          ></v-progress-circular>
        </v-overlay>
        <v-container fluid class="fill-height">
          <div class="cast-content-wrapper">
            <div class="current-song-wrapper pa-10">
              <v-img
                class="album-artwork elevation-20"
                :src="partyState.artwork"
                contain
              >
              </v-img>
            </div>
            <div class="scoreboard-wrapper pt-10">
              <div class="scoreboard-content">
                <h1 class="text-h6 font-weight-light ellipsis">Scoreboard</h1>
                <v-list color="transparent">
                  <template v-for="member in sortedMembers">
                    <v-list-item :key="member.id">
                      <v-list-item-content>
                        <v-list-item-title>
                          {{ member.username }}
                        </v-list-item-title>
                        <v-list-item-subtitle>
                          Partying for {{ format(member.joinedAt) }}
                        </v-list-item-subtitle>
                      </v-list-item-content>
                      <v-list-item-avatar>
                        <span>{{ member.score }}</span>
                      </v-list-item-avatar>
                    </v-list-item>
                  </template>
                </v-list>
              </div>
            </div>
            <div class="queue-wrapper pt-10">
              <div class="queue-content">
                <h1 class="text-h6 font-weight-light ellipsis">Queue</h1>
                <v-sheet v-if="sortedQueue.length === 0" class="text-center my-16" elevation="0" color="transparent">
                  <v-icon size="120">mdi-emoticon-sad-outline</v-icon>
                  <h1 class="text-h4 font-weight-light my-3">Queue is Empty</h1>
                  <h1 class="text-h6 font-weight-light my-3">Add some songs to the queue!</h1>
                </v-sheet>
                <v-list color="transparent">
                  <template v-for="(item, index) in sortedQueue">
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
                    <v-divider v-if="index < sortedQueue.length - 1" :key="item.id + 'l'"></v-divider>
                  </template>
                </v-list>
              </div>
            </div>
          </div>
        </v-container>
      </template>
      <template v-slot:append>
        <h1 class="text-h5 ellipsis ml-6">{{ partyState.name }}</h1>
        <h1 class="text-h6 font-weight-light ellipsis ml-6 mb-6">
          {{ partyState.artist }}
        </h1>
        <v-toolbar elevation="12" color="rgba(0,0,0,0.4)" height="50" fixed>
          <span class="text-overline mx-4">{{ progress }}</span>
          <v-progress-linear
            rounded
            color="white"
            :value="progressPercent"
            class="mx-4"
          ></v-progress-linear>
          <span class="text-overline mx-4">{{ duration }}</span>
        </v-toolbar>
      </template>
    </v-navigation-drawer>
  </v-main>
</template>

<script>
import Vue from 'vue';
import {GET_PARTY_STATE, PARTY, QUEUE, USERS_AT_PARTY,} from '../../../graphql';
import * as dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const hexToRGB = (colour) => {
  return {
    r: parseInt(colour.slice(1, 3), 16),
    g: parseInt(colour.slice(3, 5), 16),
    b: parseInt(colour.slice(5, 7), 16),
  };
};

const hexToHSL = (colour) => {
  let { r, g, b } = hexToRGB(colour);
  r /= 255;
  g /= 255;
  b /= 255;
  const lv = Math.max(r, g, b);
  const sv = lv - Math.min(r, g, b);
  const hv = sv
    ? lv === r
      ? (g - b) / sv
      : lv === g
      ? 2 + (b - r) / sv
      : 4 + (r - g) / sv
    : 0;
  const [h, s, l] = [
    60 * hv < 0 ? 60 * hv + 360 : 60 * hv,
    100 *
      (sv ? (lv <= 0.5 ? sv / (2 * lv - sv) : sv / (2 - (2 * lv - sv))) : 0),
    (100 * (2 * lv - sv)) / 2,
  ];

  return `hsl(${h.toFixed(2)}deg ${s.toFixed(2)}% ${l.toFixed(2)}%)`;
};

export default Vue.extend({
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
          this.projectedTime += 10;
          this.progressPercent =
            (this.projectedTime / this.partyState.duration) * 100;
        }, 10);
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
        .map((e) => (e.type === 'UP_VOTE' ? 1 : -1))
        .reduce((p, c) => p + c, 0);
    },
  },
  computed: {
    progressTime() {
      return this.partyState?.progress ?? 0;
    },
    background() {
      const colour = this.partyState?.palette
        ? this.partyState.palette?.darkVibrant ??
          this.partyState.palette?.vibrant
        : '#000000';
      const hslColour = hexToHSL(colour);
      return this.partyState
        ? `background-image: linear-gradient(hsl(0deg 0% 0%) 2%, ${hslColour} 100%);`
        : '';
    },
    partyCode() {
      return this.party?.code ?? '';
    },
    partyName() {
      return this.party?.name ?? '';
    },
    progress() {
      const asSeconds = (this.partyState?.progress ?? 0) / 1000;
      const m = Math.floor(asSeconds / 60);
      const s = Math.floor(asSeconds - Math.floor(asSeconds / 60) * 60);
      return `${m}:${s < 10 ? '0' : ''}${s}`;
    },
    duration() {
      const asSeconds = (this.partyState?.duration ?? 0) / 1000;
      const m = Math.floor(asSeconds / 60);
      const s = Math.floor(asSeconds - Math.floor(asSeconds / 60) * 60);
      return `${m}:${s < 10 ? '0' : ''}${s}`;
    },
    sortedMembers() {
      return (this.members ?? []).sort((a, b) => a.score - b.score);
    },
    sortedQueue() {
      return (this.queue ?? [])
        .map((q) => ({ ...q, score: this.processVotes(q.votes) }))
        .sort((a, b) => b.score - a.score).slice(0, 10);
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
});
</script>

<style scoped lang="scss">
.cast-background {
  transition: all 0.3s;
}

.toolbar-wrapper {
  display: flex;
  align-items: center;
  width: 100%;

  & > div {
    flex: 1;
    display: flex;
    align-items: center;
    flex-direction: row;
  }

  .toolbar-party-name {
    justify-content: center;
    span {
      font-weight: lighter;
    }
  }

  .toolbar-party-code {
    justify-content: flex-end;
  }
}

.cast-content-wrapper {
  display: flex;
  flex-direction: row;
  width: 100%;

  & > div {
    flex: 1;
  }

  .current-song-wrapper {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: center;
    .album-artwork {
      height: clamp(200px, 50vw, 60vh);
      width: clamp(200px, 50vw, 60vh);
      border-radius: 0.75rem;
    }
  }

  .scoreboard-wrapper {
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;

    .scoreboard-content {
      max-width: 400px;
      width: 100%;
    }
  }

  .queue-wrapper {
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    .queue-content {
      width: 100%;
    }
  }
}
</style>
