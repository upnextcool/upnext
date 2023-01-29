import Vue from 'vue';
import App from './App.vue';
import router from './router';
import './registerServiceWorker';
import vuetify from './plugins/vuetify';
import { getProvider } from './plugins/apollo/apollo-provider';
import VueApollo from 'vue-apollo';
import axios from 'axios';
import { Environment } from './environment';

Vue.config.productionTip = false;

const apiUrl =
  process.env.NODE_ENV === 'production'
    ? 'https://upnext-server.onrender.com'
    : 'http://localhost:8443';

axios.get(`${apiUrl}/api/front/config/`).then(({ data }) => {
  Environment.instance.config = data;

  Vue.use(VueApollo);

  const { apolloProvider } = getProvider();

  new Vue({
    router,
    vuetify,
    apolloProvider,
    render: (h) => h(App),
  }).$mount('#app');
});
