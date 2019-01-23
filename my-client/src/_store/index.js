import {getLocalUser} from "../_helpers/auth";
import Vuex from 'vuex';
import Vue from 'vue';
import TronWeb from 'tronweb';

Vue.use(Vuex);

const user = getLocalUser();
// const FOUNDATION_ADDRESS = 'TBxGZWTWt7oNhbBXjWeXJgh3LCxrx3u5Q8';
export const store = new Vuex.Store({
    state: {
        currentUser: user,
        isLoggedIn: !!user,
        loading: false,
        auth_error: null,

        tronWeb: {
            installed: false,
            loggedIn: false,
        },

        currentMessage: {
            message: '',
            loading: false
        },

        contractInstance: null
    },

    getters: {
        isLoading(state) {
            return state.loading;
        },
        isLoggedIn(state) {
            return state.isLoggedIn;
        },
        authError(state){
            return state.auth_error;
        },
        currentUser(state){
                return state.currentUser;
        }
    },

    mutations: {
        login(state){
            state.loading = true;
            state.auth_error = null;
        },
        loginSuccess(state, payload){
            state.auth_error = null;
            state.isLoggedIn = true;
            state.isLoading = false;
            state.currentUser = Object.assign({}, payload.user, {token: payload.token});

            localStorage.setItem("user", JSON.stringify(state.currentUser));
        },
        loginFailed(state, payload){
            state.isLoading = false;
            state.auth_error = payload.error;
        },
        logout(state){
          localStorage.removeItem("user");
            state.isLoggedIn = false;
            state.currentUser = null;
        },

        setTronWeb(state, payload) {
            state.tronWeb = payload.tronWeb;
        },

        changeName(state, payload){

            state.currentUser = payload.user;
        }
    },

    actions: {
        login(context){
            context.commit("login");
        },

        async componentDidMount(state) {
            await new Promise(resolve => {
                const tronWebState = {
                    installed: !!window.tronWeb,
                    loggedIn: window.tronWeb && window.tronWeb.ready,
                };

                if(tronWebState.installed) {
                    state.commit("setTronWeb", {tronWeb: tronWebState});

                    return resolve();
                }

                let tries = 0;

                const timer = setInterval(() => {
                    if(tries >= 10) {
                        const TRONGRID_API = 'https://api.trongrid.io';

                        window.tronWeb = new TronWeb(
                            TRONGRID_API,
                            TRONGRID_API,
                            TRONGRID_API
                        );
                        state.commit("setTronWeb",
                            { tronWeb: {
                                installed: false,
                                loggedIn: false,
                                address: null
                            }
                        });

                        clearInterval(timer);
                        return resolve();
                    }

                    tronWebState.installed = !!window.tronWeb;
                    tronWebState.loggedIn = window.tronWeb && window.tronWeb.ready;

                    if(!tronWebState.installed)
                        return tries++;

                    state.commit("setTronWeb", {tronWeb: tronWebState});

                    resolve();
                }, 1000);
            });

            if( !state.tronWeb.loggedIn ) {
                // Set default address (foundation address) used for contract calls
                // Directly overwrites the address object as TronLink disabled the
                // function call
               /* window.tronWeb.defaultAddress = {
                    hex: window.tronWeb.address.toHex(FOUNDATION_ADDRESS),
                    base58: FOUNDATION_ADDRESS
                };*/
                window.tronWeb.on('addressChanged', () => {
                    if(state.tronWeb.loggedIn)
                        return;

                    state.commit("setTronWeb",
                        {tronWeb: {
                            installed: true,
                            loggedIn: true
                        }});
                });
            }

            // Utils.setTronWeb(window.tronWeb);

            /*this.startEventListener();
            this.fetchMessages();*/
        },
    }
});