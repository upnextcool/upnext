<template>
  <v-main>
    <v-container class="px-4" fluid>
      <v-col cols="12">
        <v-row class="pb-4" justify="center" align="center">
          <h1 class="text-h4 font-weight-light ellipsis">Suggested Tracks</h1>
          <v-spacer></v-spacer>
        </v-row>
        <v-row v-if="recommendations" class="mt-4">
          <v-list dense width="100%" color="transparent" class="ma-0 pa-0">
            <template v-for="item in recommendationTracks">
              <v-list-item dense :key="item.uri">
                <v-list-item-avatar tile>
                  <v-img :src="item.album.images[0].url"></v-img>
                </v-list-item-avatar>
                <v-list-item-content>
                  <v-list-item-title>
                    {{ item.name }}
                  </v-list-item-title>
                  <v-list-item-subtitle class="text-caption font-weight-light">
                    {{ item.artists.map((m) => m.name).join(', ') }}
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
        </v-row>
        <v-row v-else class="mt-4" align="center" justify="center">
          <v-progress-circular
            class="mt-10"
            indeterminate
            size="150"
            color="primary"
          ></v-progress-circular>
        </v-row>
      </v-col>
    </v-container>
  </v-main>
</template>

<script>
import { SPOTIFY_RECOMMENDATIONS } from '../../../graphql';
import AppSongMenu from '../shared/song-menu.vue';

export default {
  name: 'app-suggested-tracks',
  components: { AppSongMenu },
  data: () => ({
    recommendations: null,
  }),
  computed: {
    recommendationTracks() {
      return this.recommendations.recommendedTracks.tracks;
    },
  },
  apollo: {
    recommendations: {
      query: SPOTIFY_RECOMMENDATIONS,
      fetchPolicy: 'no-cache',
    },
  },
};
</script>
