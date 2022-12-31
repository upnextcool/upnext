<template>
  <v-main :style="background">
    <app-home-header></app-home-header>
    <v-container v-if="partyState" fluid class="fill-height">
      <v-col cols="12">
        <v-row align="center" justify="center">
          <!--          <v-card width="80vw" class="mb-2" elevation="0" color="transparent">-->
          <!--            <div style="display: flex; flex-direction: row">-->
          <!--              <h1 class="text-overline">Added by: &nbsp;</h1>-->
          <!--              <h1 class="text-overline ellipsis">Ethan</h1>-->
          <!--              <v-spacer></v-spacer>-->
          <!--              <v-btn icon><v-icon>mdi-spotify</v-icon></v-btn>-->
          <!--            </div>-->
          <!--          </v-card>-->
          <v-responsive
            max-height="80vw"
            max-width="80vw"
            class="mx-auto"
            aspect-ratio="1"
          >
            <v-card
              v-if="partyState"
              rounded
              elevation="20"
              :key="partyState.artwork"
              class="text-center"
            >
              <v-img :src="partyState.artwork" class="elevation-0" contain>
              </v-img>
            </v-card>
          </v-responsive>
          <v-card elevation="0" color="transparent" width="80vw">
            <v-sheet
              color="transparent"
              style="
                display: flex;
                flex-direction: row;
                justify-content: center;
                align-items: center;
              "
            >
              <v-sheet
                max-width="calc(80vw - 36px)"
                style="display: flex; flex-direction: column"
                color="transparent"
              >
                <h1 class="text-h6 mt-2 ellipsis">{{ partyState.name }}</h1>
                <h1 class="text-body-2 font-weight-light mb-5 ellipsis">
                  {{ partyState.artist }}
                </h1>
              </v-sheet>
              <v-spacer></v-spacer>
              <app-home-current-song-menu
                :song-id="partyState.spotifyId"
              ></app-home-current-song-menu>
            </v-sheet>
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
        </v-row>
      </v-col>
    </v-container>

    <v-container v-else fluid class="fill-height">
      <v-col cols="12">
        <v-row align="center" justify="center">
          <v-sheet class="text-center" elevation="0" color="transparent">
            <v-icon color="primary" size="120">mdi-music-rest-quarter</v-icon>
            <h1 class="text-h4 font-weight-light my-3">Nothing playing</h1>
            <p class="text-body-2">There's no music playing anywhere</p>
          </v-sheet>
        </v-row>
      </v-col>
    </v-container>
  </v-main>
</template>

<script>
import AppHomeHeader from "./header";
import { GET_PARTY_STATE } from "../../../graphql";
import AppHomeCurrentSongMenu from "./current-song-menu";

export default {
  components: { AppHomeCurrentSongMenu, AppHomeHeader },
  data: () => ({
    partyState: null,
  }),
  computed: {
    progress() {
      const asSeconds = this.partyState.progress / 1000;
      const m = Math.floor(asSeconds / 60);
      const s = Math.floor(asSeconds - Math.floor(asSeconds / 60) * 60);
      return `${m}:${s < 10 ? "0" : ""}${s}`;
    },
    duration() {
      const asSeconds = this.partyState.duration / 1000;
      const m = Math.floor(asSeconds / 60);
      const s = Math.floor(asSeconds - Math.floor(asSeconds / 60) * 60);
      return `${m}:${s < 10 ? "0" : ""}${s}`;
    },
    progressPercent() {
      return (this.partyState.progress / this.partyState.duration) * 100;
    },
    background() {
      return this.partyState
        ? `background-image: linear-gradient(rgba(0,0,0,0.1) 1%, ${
            this.partyState.palette
              ? this.partyState.palette.darkVibrant ??
                this.partyState.palette.darkMuted
              : "000000"
          }ff 50%, rgba(0,0,0,1) 100%);`
        : "";
    },
  },
  apollo: {
    partyState: {
      query: GET_PARTY_STATE,
      pollInterval: 1000,
    },
  },
};
</script>
