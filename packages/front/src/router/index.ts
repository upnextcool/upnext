import Vue from 'vue';
import VueRouter, { RouteConfig } from 'vue-router';

Vue.use(VueRouter);

const routes: Array<RouteConfig> = [
  {
    path: '/',
    component: () => import('../app/landing/app.vue'),
    children: [
      {
        path: '',
        component: () => import('../app/landing/home/home.vue'),
      },
      {
        path: 'new',
        component: () => import('../app/landing/new/new.vue'),
      },
      {
        path: 'nickname',
        component: () => import('../app/landing/nickname/nickname.vue'),
      },
      {
        path: 'logout',
        component: () => import('../app/landing/logout/logout.vue'),
      },
    ],
  },
  {
    path: '/party',
    redirect: '/party/home',
    component: () => import('../app/party/app.vue'),
    children: [
      {
        path: 'home',
        component: () => import('../app/party/home/home.vue'),
      },
      {
        path: 'cast',
        component: () => import('../app/party/cast/cast.vue'),
      },
      {
        path: 'users',
        component: () => import('../app/party/users/users.vue'),
      },
      {
        path: 'search',
        component: () => import('../app/party/search/search.vue'),
      },
      {
        path: 'history',
        component: () => import('../app/party/history/history.vue'),
      },
      {
        path: 'view',
        component: () => import('../app/party/view/view.vue'),
        children: [
          {
            path: 'popular',
            props: true,
            component: () => import('../app/party/view/popular-playlists.vue'),
          },
          {
            path: 'playlist/:id',
            props: true,
            component: () => import('../app/party/view/playlist.vue'),
          },
          {
            path: 'album/:id',
            props: true,
            component: () => import('../app/party/view/album.vue'),
          },
          {
            path: 'artist/:id',
            props: true,
            component: () => import('../app/party/view/artist.vue'),
          },
        ],
      },
      {
        path: 'queue',
        component: () => import('../app/party/queue/queue.vue'),
      },
      {
        path: '*',
        redirect: '/party',
      },
    ],
  },
  {
    path: '*',
    redirect: '/',
  },
];

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes,
});

export default router;
