<template>
  <v-bottom-sheet v-if="song" overlay-opacity="0.95" v-model="sheet">
    <template v-slot:activator="{ on, attrs }">
      <v-btn icon dark v-bind="attrs" v-on="on">
        <v-icon>mdi-dots-vertical</v-icon>
      </v-btn>
    </template>
    <v-sheet elevation="10"  color="darker">
      <v-list color="transparent">
        <v-list-item>
          <v-list-item-avatar size="100" tile>
            <v-img :src="albumArtwork"></v-img>
          </v-list-item-avatar>
          <v-list-item-content>
            <v-list-item-title class="text-h5">
              {{ song.name }}
            </v-list-item-title>
            <v-list-item-subtitle class="text-caption font-weight-light">
              {{ artists }}
            </v-list-item-subtitle>
          </v-list-item-content>
        </v-list-item>
        <v-divider></v-divider>
        <v-list-item
          v-if="song.artists.length === 1"
          :to="`/party/view/artist/${song.artists[0].id}`"
        >
          <v-list-item-icon>
            <v-icon>mdi-account-music</v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title>View artist</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-bottom-sheet v-else overlay-opacity="0.95">
          <template v-slot:activator="{ on, attrs }">
            <v-list-item v-on="on" v-bind="attrs">
              <v-list-item-icon>
                <v-icon>mdi-account-music</v-icon>
              </v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title>View artist</v-list-item-title>
              </v-list-item-content>
            </v-list-item>
          </template>
          <v-sheet elevation="10" color="darker">
            <v-list>
              <v-list-item
                :key="artist.id"
                v-for="artist in song.artists"
                :to="`/party/view/artist/${artist.id}`"
              >
                <v-list-item-icon>
                  <v-icon>mdi-account-music</v-icon>
                </v-list-item-icon>
                <v-list-item-content>
                  <v-list-item-title>{{ artist.name }}</v-list-item-title>
                </v-list-item-content>
              </v-list-item>
            </v-list>
          </v-sheet>
        </v-bottom-sheet>
        <v-list-item :to="`/party/view/album/${song.album.id}`">
          <v-list-item-icon>
            <v-icon>mdi-album</v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title>View album</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-list-item :href="`spotify:track:${songId}`">
          <v-list-item-icon>
            <v-icon>mdi-spotify</v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title>View in Spotify</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-list-item @click="shareTrack">
          <v-list-item-icon>
            <v-icon>mdi-share</v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title>Share</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-sheet>
  </v-bottom-sheet>
</template>

<script>
import { SPOTIFY_SONG } from '../../../graphql';

export default {
  name: 'app-home-current-song-menu',
  props: {
    songId: String,
  },
  data: () => ({
    sheet: false,
    song: null,
  }),
  async mounted() {
    await this.getSong();
  },
  watch: {
    async songId() {
      await this.getSong();
    },
  },
  computed: {
    albumArtwork() {
      return this.song.album.images[0].url;
    },
    artists() {
      return this.song.artists.map((e) => e.name).join(', ');
    },
  },
  methods: {
    async getSong() {
      const songId = this.songId;
      const { data } = await this.$apollo.query({
        query: SPOTIFY_SONG,
        variables: {
          songId,
        },
      });
      this.song = data.song;
    },
    async shareTrack() {
      const shareData = {
        title: 'Song',
        text: 'Check this song out!',
        url: `https://open.spotify.com/track/${this.songId}`,
      };
      await navigator.share(shareData);
    },
  },
};
</script>

<style scoped></style>
