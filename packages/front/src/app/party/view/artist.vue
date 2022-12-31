<template>
  <v-main v-if="artist">
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
        :src="artist.info.images[0].url"
      ></v-img>
      <h1 class="ml-5 text-h5 font-weight-light ellipsis">
        {{ artist.info.name }}
      </h1>
    </v-app-bar>
    <v-img
      :src="artist.info.images[0].url"
      gradient="#121212aa 0%, #00000000 20%, #00000000 60%, #121212ff 100%"
      height="300"
      max-height="300"
      position="center"
    >
      <h1
        class="text-h4 font-weight-light ma-6"
        style="position: absolute; bottom: 0; left: 0"
      >
        {{ artist.info.name }}
      </h1>
    </v-img>
    <v-toolbar dense flat color="transparent">
      <h1 class="text-h6 font-weight-light">Top Songs</h1>
    </v-toolbar>
    <v-list dense width="100%" color="transparent" class="ma-0 pa-0">
      <template v-for="item in artist.tracks.tracks.slice(0, 5)">
        <v-list-item dense :key="item.uri">
          <v-list-item-avatar tile>
            <v-img :src="item.album.images[0].url"></v-img>
          </v-list-item-avatar>
          <v-list-item-content>
            <v-list-item-title>
              {{ item.name }}
            </v-list-item-title>
            <v-list-item-subtitle>
              {{ item.artists.map((m) => m.name).join(", ") }}
            </v-list-item-subtitle>
          </v-list-item-content>
          <v-list-item-action>
            <app-song-menu
              :song-id="item.id"
              :song-name="item.name"
              :song-artwork="item.album.images[0].url"
              :album-id="item.album.id"
              :artists="item.artists"
            ></app-song-menu>
          </v-list-item-action>
        </v-list-item>
      </template>
    </v-list>
    <v-toolbar dense flat color="transparent">
      <h1 class="text-h6 font-weight-light">Albums</h1>
    </v-toolbar>
    <v-list dense width="100%" color="transparent" class="ma-0 pa-0">
      <template v-for="item in albums">
        <v-list-item :to="`/party/view/album/${item.id}`" dense :key="item.uri">
          <v-list-item-avatar tile>
            <v-img :src="item.images[0].url"></v-img>
          </v-list-item-avatar>
          <v-list-item-content>
            <v-list-item-title>
              {{ item.name }}
            </v-list-item-title>
            <v-list-item-subtitle>
              {{ item.artists.map((m) => m.name).join(", ") }}
            </v-list-item-subtitle>
          </v-list-item-content>
          <v-list-item-action>
            <v-icon>mdi-chevron-right</v-icon>
          </v-list-item-action>
        </v-list-item>
      </template>
    </v-list>
    <v-toolbar dense flat color="transparent">
      <h1 class="text-h6 font-weight-light">Singles</h1>
    </v-toolbar>
    <v-list dense width="100%" color="transparent" class="ma-0 pa-0">
      <template v-for="item in singles">
        <v-list-item :to="`/party/view/album/${item.id}`" dense :key="item.uri">
          <v-list-item-avatar tile>
            <v-img :src="item.images[0].url"></v-img>
          </v-list-item-avatar>
          <v-list-item-content>
            <v-list-item-title>
              {{ item.name }}
            </v-list-item-title>
            <v-list-item-subtitle>
              {{ item.artists.map((m) => m.name).join(", ") }}
            </v-list-item-subtitle>
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
import { SPOTIFY_ARTIST } from "../../../graphql";
import AppSongMenu from "../shared/song-menu";

export default {
  components: { AppSongMenu },
  props: {
    id: String,
  },
  data: () => ({
    artist: null,
  }),
  watch: {
    id() {
      this.artist = null;
    },
  },
  computed: {
    albums() {
      return this.artist.albums.filter((album) => album.album_type === "album");
    },
    singles() {
      return this.artist.albums.filter(
        (album) => album.album_type === "single"
      );
    },
  },
  apollo: {
    artist: {
      query: SPOTIFY_ARTIST,
      variables: function () {
        return {
          artistId: this.id,
        };
      },
    },
  },
};
</script>

<style scoped></style>
