<template>
  <v-bottom-sheet overlay-opacity="0.95" v-model="sheet">
    <template v-slot:activator="{ on, attrs }">
      <v-btn icon dark v-bind="attrs" v-on="on">
        <v-icon>mdi-dots-vertical</v-icon>
      </v-btn>
    </template>
    <v-sheet elevation="10" color="darker">
      <v-list>
        <v-list-item>
          <v-list-item-avatar size="100" tile>
            <v-img :src="songArtwork"></v-img>
          </v-list-item-avatar>
          <v-list-item-content>
            <v-list-item-title>
              {{ songName }}
            </v-list-item-title>
            <v-list-item-subtitle class="text-caption font-weight-light">
              {{ artists.map((m) => m.name).join(", ") }}
            </v-list-item-subtitle>
          </v-list-item-content>
        </v-list-item>
        <v-divider></v-divider>
        <v-list-item @click="addToQueue">
          <v-list-item-icon>
            <v-icon>mdi-playlist-plus</v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title>Add to queue</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-bottom-sheet overlay-opacity="0.95">
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
                v-for="artist in artists"
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
        <v-list-item :to="`/party/view/album/${albumId}`">
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
import { ADD_TO_QUEUE } from "../../../graphql";

export default {
  name: "app-song-menu",
  props: {
    songId: String,
    songName: String,
    songArtwork: String,
    artists: Array,
    albumId: String,
  },
  data: () => ({
    sheet: false,
  }),
  methods: {
    async addToQueue() {
      this.sheet = false;
      await this.$apollo.mutate({
        mutation: ADD_TO_QUEUE,
        variables: {
          songId: this.songId,
        },
      });
    },
    async shareTrack() {
      const shareData = {
        title: "Song",
        text: "Check this song out!",
        url: `https://open.spotify.com/track/${this.songId}`,
      };
      await navigator.share(shareData);
    },
  },
};
</script>

<style scoped></style>
