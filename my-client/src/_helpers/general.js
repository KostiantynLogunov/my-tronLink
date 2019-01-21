import  axios  from 'axios'
export function initialize(store, router) {
    router.beforeEach((to, from, next) => {
        const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
        const currenrUser = store.state.currentUser;
        const loggedIn =  window.tronWeb && window.tronWeb.ready;


        if (requiresAuth && !currenrUser){
            next('/signin');
        } else if (to.path == '/signin' && currenrUser) {
            next('/');
        } else {
            next();
        }

    });

    axios.interceptors.response.use(null, (error) => {
        if (error.response.status == 401)  {
            store.commit('logout');
            router.push('signin');
        }

        return Promise.reject(error);
    });

    if (store.getters.currentUser) {
        setAuthorization(store.getters.currentUser.token);
    }
}
export function setAuthorization(token) {
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`
}