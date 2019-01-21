// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './_router'
import { store } from './_store'
import { initialize } from './_helpers/general'

Vue.use(router);

Vue.config.productionTip = false;

initialize(store, router);

import Toasted from 'vue-toasted';
Vue.use(Toasted);

new Vue({
    el: '#app',
    router,
    store,
    components: { App },
    template: '<App/>'
});
