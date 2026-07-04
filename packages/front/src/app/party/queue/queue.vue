<template>
  <v-main>
    <v-app-bar fixed elevate-on-scroll color="darker">
      <h1 class="text-h4 font-weight-light ellipsis">Queue</h1>
      <v-spacer></v-spacer>
      <app-queue-menu />
    </v-app-bar>
    <v-container v-if="queue && queue.length === 0" fluid class="fill-height">
      <v-col cols="12">
        <v-row align="center" justify="center">
          <v-sheet class="text-center" elevation="0" color="transparent">
            <v-icon size="120">mdi-gauge-empty</v-icon>
            <h1 class="text-h4 font-weight-light my-3">Queue is Empty</h1>
            <v-btn to="/party/search" text small>
              <v-icon left>mdi-magnify</v-icon>
              Search for music
            </v-btn>
          </v-sheet>
        </v-row>
      </v-col>
    </v-container>
    <v-list dense v-if="queue" color="transparent" class="ma-0 pa-0 mt-16">
      <template v-for="(item, index) in sortedQueue">
        <app-vote-dialog
          :key="index"
          :item="item"
          :my-member-id="me && me.id"
          @removed="removeLocally"
        />
      </template>
    </v-list>
    <v-list dense v-else color="transparent" class="ma-0 pa-0 mt-16">
      <v-skeleton-loader
        tile
        v-for="(_, index) in Array(15).fill(0)"
        :key="index"
        type="list-item-avatar-three-line"
      ></v-skeleton-loader>
    </v-list>
  </v-main>
</template>

<script>
import {
  ME,
  NEW_SONG_IN_QUEUE,
  QUEUE,
  QUEUE_DOWNVOTE,
  QUEUE_UPVOTE,
  REMOVE_SONG_FROM_QUEUE,
} from '../../../graphql';
import AppVoteDialog from './vote-dialog';
import AppQueueMenu from './menu';
import dayjs from "dayjs";

export default {
  components: { AppQueueMenu, AppVoteDialog },
  data: () => ({
    queue: null,
    me: null,
  }),
  created() {
    this.$watch(
      () => this.$route.params,
      () => {
        this.updateQueue();
      },
      { immediate: true }
    );
  },
  computed: {
    sortedQueue() {
      return this.queue
        .map((q) => ({ ...q, score: this.processVotes(q.votes) }))
        .sort((a, b) => dayjs(a.addedAt).diff(dayjs(b.addedAt)))
        .sort((a, b) => b.score - a.score);
    },
  },
  methods: {
    async updateQueue() {
      this.queue = null;

      const { data } = await this.$apollo.query({
        query: QUEUE,
        fetchPolicy: 'no-cache',
      });

      this.queue = data.queue;
    },
    processVotes(votes) {
      return votes
        .map((e) => (e.type === 'UP_VOTE' ? 1 : -1))
        .reduce((p, c) => p + c, 0);
    },
    // Drop the entry immediately after a successful remove; the
    // QUEUE_REMOVE_SONG subscription event that follows is a no-op here.
    removeLocally(entryId) {
      if (!this.queue) {
        return;
      }
      this.queue = this.queue.filter((q) => q.id !== entryId);
    },
  },
  apollo: {
    me: ME,
    $subscribe: {
      newSong: {
        query: NEW_SONG_IN_QUEUE,
        result({ data }) {
          if (!this.queue) {
            return;
          }
          if (this.queue.some((q) => q.id === data.newSongInQueue.id)) {
            return;
          }
          this.queue.push(data.newSongInQueue);
        },
      },
      removeSong: {
        query: REMOVE_SONG_FROM_QUEUE,
        result({ data }) {
          if (!this.queue) {
            return;
          }
          this.queue = this.queue.filter(
            (q) => q.id !== data.removeSongFromQueue.id
          );
        },
      },
      upvote: {
        query: QUEUE_UPVOTE,
        result({ data }) {
          if (!this.queue) {
            return;
          }
          const entryToUpdate = data.queueUpvote;
          this.queue = this.queue.map((q) =>
            q.id === entryToUpdate.id ? entryToUpdate : q
          );
        },
      },
      downvote: {
        query: QUEUE_DOWNVOTE,
        result({ data }) {
          if (!this.queue) {
            return;
          }
          const entryToUpdate = data.queueDownvote;
          this.queue = this.queue.map((q) =>
            q.id === entryToUpdate.id ? entryToUpdate : q
          );
        },
      },
    },
  },
};
</script>
