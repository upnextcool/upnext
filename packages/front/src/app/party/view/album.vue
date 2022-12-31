<template>
  <v-main v-if="album">
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
        :src="album.images[0].url"
      ></v-img>
      <h1 class="ml-5 text-h5 font-weight-light ellipsis">
        {{ album.name }}
      </h1>
    </v-app-bar>
    <v-card class="px-5 pt-5" color="transparent" elevation="0">
      <v-img contain max-height="200" :src="album.images[0].url"></v-img>
      <h1 class="mt-3 text-h5 font-weight-light">
        {{ album.name }}
      </h1>
      <p class="text-caption">
        {{ album.artists.map((a) => a.name).join(", ") }}
      </p>
    </v-card>
    <v-list dense color="transparent" class="ma-0 pa-0">
      <template v-for="(item, index) in tracks">
        <v-list-item :key="item.uri + index">
          <v-list-item-avatar tile>
            <span>{{ item.track_number }}</span>
          </v-list-item-avatar>
          <v-list-item-content>
            <v-list-item-title>
              {{ item.name }}
            </v-list-item-title>
            <v-list-item-subtitle>
              <v-icon x-small>{{
                item.explicit ? "mdi-alpha-e-box-outline" : ""
              }}</v-icon>
              {{ item.artists.map((m) => m.name).join(", ") }}
            </v-list-item-subtitle>
          </v-list-item-content>
          <v-list-item-action>
            <app-song-menu
              :song-id="item.id"
              :song-name="item.name"
              :song-artwork="album.images[0].url"
              :album-id="album.id"
              :artists="item.artists"
            ></app-song-menu>
          </v-list-item-action>
        </v-list-item>
      </template>
    </v-list>
    <v-toolbar dense flat color="transparent">
      <h1 class="text-h6 font-weight-light">Artists</h1>
    </v-toolbar>
    <v-list dense width="100%" color="transparent" class="ma-0 pa-0">
      <template v-for="item in album.artists">
        <v-list-item :to="`/party/view/artist/${item.id}`" :key="item.uri">
          <v-list-item-content>
            <v-list-item-title>
              {{ item.name }}
            </v-list-item-title>
          </v-list-item-content>
          <v-list-item-action>
            <v-icon>mdi-chevron-right</v-icon>
          </v-list-item-action>
        </v-list-item>
      </template>
    </v-list>
  </v-main>
</template>

<script>
import { SPOTIFY_ALBUM } from "../../../graphql";
import AppSongMenu from "../shared/song-menu";

export default {
  components: { AppSongMenu },
  props: {
    id: String,
  },
  data: () => ({
    album: null,
  }),
  watch: {
    id() {
      this.album = null;
    },
  },
  computed: {
    tracks() {
      return this.album.tracks.items.filter(
        (t) => t.restrictions === undefined
      );
    },
  },
  apollo: {
    album: {
      query: SPOTIFY_ALBUM,
      variables: function () {
        return {
          albumId: this.id,
        };
      },
    },
  },
};
</script>

<style scoped></style>
