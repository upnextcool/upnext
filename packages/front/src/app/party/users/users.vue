<template>
  <v-main>
    <v-app-bar fixed elevate-on-scroll color="darker">
      <h1 class="text-h4 font-weight-light ellipsis">Users</h1>
      <v-spacer></v-spacer>
    </v-app-bar>
    <v-list color="transparent" class="mt-16 ma-0 pa-0">
      <template v-for="member in members">
        <v-list-item dense :key="member.id">
          <!--          <v-list-item-avatar>-->
          <!--            <span>{{ member.score }}</span>-->
          <!--          </v-list-item-avatar>-->
          <v-list-item-content>
            <v-list-item-title>
              {{ member.username }}
            </v-list-item-title>
            <v-list-item-subtitle>
              Joined {{ format(member.joinedAt) }}
            </v-list-item-subtitle>
          </v-list-item-content>
        </v-list-item>
      </template>
    </v-list>
  </v-main>
</template>

<script>
import { USERS_AT_PARTY } from "../../../graphql";
import * as dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

export default {
  methods: {
    format(date) {
      return dayjs(date).fromNow();
    },
  },
  apollo: {
    members: USERS_AT_PARTY,
  },
};
</script>

<style scoped></style>
