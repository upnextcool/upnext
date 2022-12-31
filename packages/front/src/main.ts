import Vue from 'vue';
import App from './App.vue';
import router from './router';
import './registerServiceWorker';
import vuetify from './plugins/vuetify';
import { apolloProvider } from './plugins/apollo/apollo-provider';
import VueApollo from 'vue-apollo';

Vue.config.productionTip = false;

Vue.prototype.$apiUrl = `http://localhost:8443/`;
Vue.prototype.$frontUrl = `http://localhost:8080/`;

Vue.use(VueApollo);

new Vue({
  router,
  vuetify,
  apolloProvider,
  render: (h) => h(App),
}).$mount('#app');
