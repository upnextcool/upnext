<template>
  <v-main v-if="playlist">
    <v-app-bar
      fixed
      elevation="10"
      inverted-scroll
      scroll-threshold="150"
      color="darker"
    >
      <v-img
        contain
        max-height="40"
        max-width="40"
        :src="playlist.images[0].url"
      ></v-img>
      <h1 class="ml-5 text-h5 font-weight-light ellipsis">
        {{ playlist.name }}
      </h1>
    </v-app-bar>
    <v-card class="px-5 pt-5" color="transparent" elevation="0">
      <v-img contain max-height="200" :src="playlist.images[0].url"></v-img>
      <h1 class="mt-3 text-h5 font-weight-light">
        {{ playlist.name }}
      </h1>
      <component :is="parsedDescription"></component>
    </v-card>
    <v-list dense color="transparent" class="ma-0 pa-0">
      <template v-for="(item, index) in tracks">
        <v-list-item dense :key="item.track.uri + index">
          <v-list-item-avatar tile>
            <v-img
              v-if="item.track.album.images.length !== 0"
              :src="item.track.album.images[0].url"
            ></v-img>
          </v-list-item-avatar>
          <v-list-item-content>
            <v-list-item-title>
              {{ item.track.name }}
            </v-list-item-title>
            <v-list-item-subtitle>
              {{ item.track.artists.map((m) => m.name).join(", ") }}
            </v-list-item-subtitle>
          </v-list-item-content>
          <v-list-item-action>
            <app-song-menu
              :song-id="item.track.id"
              :song-name="item.track.name"
              :song-artwork="item.track.album.images[0].url"
              :album-id="item.track.album.id"
              :artists="item.track.artists"
            ></app-song-menu>
          </v-list-item-action>
        </v-list-item>
      </template>
    </v-list>
  </v-main>
  <v-main v-else>
    <v-card class="px-5 pt-5" color="transparent" elevation="0">
      <v-skeleton-loader
        class="mx-auto"
        width="200"
        height="200"
        type="image"
      ></v-skeleton-loader>
      <v-skeleton-loader class="my-3" type="heading"></v-skeleton-loader>
      <v-skeleton-loader class="mb-5" type="text"></v-skeleton-loader>
    </v-card>
    <v-skeleton-loader
      tile
      v-for="(_, index) in Array(8).fill(0)"
      :key="index"
      type="list-item-avatar-two-line"
    ></v-skeleton-loader>
  </v-main>
</template>

<script>
import { SPOTIFY_PLAYLIST } from "../../../graphql";
import AppSongMenu from "../shared/song-menu";

export default {
  components: { AppSongMenu },
  props: {
    id: String,
  },
  data: () => ({
    playlist: null,
  }),
  watch: {
    id() {
      this.playlist = null;
    },
  },
  computed: {
    tracks() {
      return this.playlist.tracks.filter(
        (t) => t.track && t.track.restrictions === undefined
      );
    },
    parsedDescription() {
      let d = `<p class="text-caption">${this.playlist.description}</p>`;
      const regex = /<a href=spotify:([\S]+):([\S]{22})>([ A-Za-z0-9]+)<\/a>/g;
      const array = [...d.matchAll(regex)];
      array.forEach((e) => {
        const link = `<router-link to="/party/view/${e[1]}/${e[2]}">${e[3]}</router-link>`;
        d = d.replace(`${e[0]}`, link);
      });
      return {
        template: d,
      };
    },
  },
  apollo: {
    playlist: {
      query: SPOTIFY_PLAYLIST,
      variables: function () {
        return {
          playlistId: this.id,
        };
      },
    },
  },
};
</script>

<style scoped></style>
