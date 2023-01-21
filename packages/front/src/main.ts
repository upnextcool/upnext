import Vue from 'vue';
import App from './App.vue';
import router from './router';
import './registerServiceWorker';
import vuetify from './plugins/vuetify';
import { apolloProvider } from './plugins/apollo/apollo-provider';
import VueApollo from 'vue-apollo';

Vue.config.productionTip = false;

Vue.prototype.$apiUrl = `https://upnext-server.onrender.com/`;
Vue.prototype.$frontUrl = `https://upnext.cool`;

Vue.use(VueApollo);

new Vue({
  router,
  vuetify,
  apolloProvider,
  render: (h) => h(App),
}).$mount('#app');
