<template>
  <v-main>
    <v-app-bar color="darker" fixed dark elevate-on-scroll>
      <v-text-field
        placeholder="Search..."
        hide-details
        prepend-inner-icon="mdi-magnify"
        color="primary"
        outlined
        dense
        rounded
        autofocus
        v-model="query"
        @input="searchInput"
      ></v-text-field>
    </v-app-bar>
    <v-container v-if="query === ''" class="mt-16 px-4" fluid>
      <v-col cols="12">
        <v-row v-if="recommendations">
          <v-col cols="12">
            <v-row class="pb-4" justify="center" align="center">
              <h1 class="text-h6">Popular Playlists</h1>
              <v-spacer></v-spacer>
              <v-btn x-small text to="/party/view/popular">more</v-btn>
            </v-row>
            <v-row class="mt-4">
              <div class="playlist-grid-container">
                <v-card
                  tile
                  max-width="28vw"
                  :key="item.id"
                  elevation="0"
                  color="transparent"
                  class="mb-2"
                  v-for="item in recommendationPlaylists"
                  :to="`/party/view/playlist/${item.id}`"
                >
                  <v-img class="rounded-xl" :src="item.images[0].url"></v-img>
                  <p class="text-caption py-2">{{ item.name }}</p>
                </v-card>
              </div>
            </v-row>
          </v-col>
        </v-row>
        <v-row align="center" justify="center" v-else>
          <v-progress-circular
            class="mt-10"
            size="100"
            width="5"
            color="primary"
            indeterminate
          ></v-progress-circular>
        </v-row>
      </v-col>
    </v-container>
    <div v-else-if="results" class="mt-16 pt-2 px-4">
      <v-toolbar dense flat color="transparent">
        <h1 class="text-h6 font-weight-light">Songs</h1>
        <v-spacer></v-spacer>
        <!--        <v-btn text x-small>View All</v-btn>-->
      </v-toolbar>
      <v-list dense width="100%" color="transparent" class="ma-0 pa-0">
        <template v-for="item in results.tracks.items.slice(0, 4)">
          <v-list-item dense :key="item.uri">
            <v-list-item-avatar tile>
              <v-img :src="item.album.images[0].url"></v-img>
            </v-list-item-avatar>
            <v-list-item-content>
              <v-list-item-title>
                {{ item.name }}
              </v-list-item-title>
              <v-list-item-subtitle class="text-caption font-weight-light">
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
        <v-spacer></v-spacer>
        <!--        <v-btn text x-small>View All</v-btn>-->
      </v-toolbar>
      <v-list dense width="100%" color="transparent" class="ma-0 pa-0">
        <template v-for="item in results.albums.items.slice(0, 4)">
          <v-list-item :to="`/party/view/album/${item.id}`" dense :key="item.uri">
            <v-list-item-avatar tile>
              <v-img :src="item.images[0].url"></v-img>
            </v-list-item-avatar>
            <v-list-item-content>
              <v-list-item-title>
                {{ item.name }}
              </v-list-item-title>
              <v-list-item-subtitle class="text-caption font-weight-light">
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
        <h1 class="text-h6 font-weight-light">Artists</h1>
        <v-spacer></v-spacer>
        <!--        <v-btn text x-small>View All</v-btn>-->
      </v-toolbar>
      <v-list dense width="100%" color="transparent" class="ma-0 pa-0">
        <template v-for="item in results.artists.items.slice(0, 4)">
          <v-list-item :to="`/party/view/artist/${item.id}`" :key="item.uri">
            <v-list-item-avatar tile>
              <v-img :src="item.images[0].url"></v-img>
            </v-list-item-avatar>
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
      <v-toolbar dense flat color="transparent">
        <h1 class="text-h6 font-weight-light">Playlists</h1>
        <v-spacer></v-spacer>
        <!--        <v-btn text x-small>View All</v-btn>-->
      </v-toolbar>
      <v-list dense width="100%" color="transparent" class="ma-0 pa-0">
        <template v-for="item in results.playlists.items.slice(0, 4)">
          <v-list-item
            :to="`/party/view/playlist/${item.id}`"
            dense
            :key="item.uri"
          >
            <v-list-item-avatar tile>
              <v-img :src="item.images[0].url"></v-img>
            </v-list-item-avatar>
            <v-list-item-content>
              <v-list-item-title>
                {{ item.name }}
              </v-list-item-title>
              <v-list-item-subtitle class="text-caption font-weight-light">
                Created by: {{ item.owner.display_name }}
              </v-list-item-subtitle>
            </v-list-item-content>
            <v-list-item-action>
              <v-icon>mdi-chevron-right</v-icon>
            </v-list-item-action>
          </v-list-item>
        </template>
      </v-list>
    </div>
  </v-main>
</template>

<script>
import { SPOTIFY_RECOMMENDATIONS, SPOTIFY_SEARCH } from "../../../graphql";
import debounce from "debounce";
import AppSongMenu from "../shared/song-menu";

export default {
  components: { AppSongMenu },
  data: () => ({
    recommendations: null,
    debounceSearch: null,
    query: "",
    searching: false,
    results: null,
  }),
  async mounted() {
    this.debounceSearch = debounce(this.updateRoute, 500);

    const query = this.$route.query?.q;
    if (query) {
      this.query = query;
      await this.search();
    }
  },
  methods: {
    async searchInput() {
      this.searching = true;
      this.debounceSearch();
    },
    async updateRoute() {
      await this.$router.push({
        query: {
          q: this.query,
        },
      });
    },
    async search() {
      if (!this.query || this.query === "") {
        this.results = null;
        this.query = "";
        return;
      }
      const { data } = await this.$apollo.query({
        query: SPOTIFY_SEARCH,
        // fetchPolicy: "network-only",
        variables: {
          query: this.query,
        },
      });
      this.results = data.spotifySearch;
      this.searching = false;
    },
  },
  computed: {
    recommendationPlaylists() {
      return this.recommendations.playlists.items.slice(0, 9);
    },
  },
  beforeRouteUpdate(to, from, next) {
    this.query = to.query?.q;
    this.search();
    next();
  },
  apollo: {
    recommendations: {
      query: SPOTIFY_RECOMMENDATIONS,
    },
  },
};
</script>

<style scoped>
.playlist-grid-container {
  width: 100%;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  text-align: center;
  justify-items: center;
  align-items: center;
}
</style>
