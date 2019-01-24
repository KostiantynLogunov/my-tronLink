<template>
    <div class="login row justify-content-center">
        <div class="col-md-4">
            <div class="card">
                <div class="card-header">SignIN</div>
                <div class="card-body">

                    <div class="text-center" v-if="!tronWeb.installed">
                        <h3>
                            Please install TronLink to your browser !
                        </h3>
                    </div>
                    <div class="text-center" v-if="tronWeb.installed && !tronWeb.loggedIn">
                        <h3>
                            Please login in TronLink and refresh page!
                        </h3>
                    </div>
                    <div class="text-center" v-if="tronWeb.installed && tronWeb.loggedIn">
                        <button class="btn btn-warning" @click="authenticate">SignIn</button>
                    </div>
                    <div class="form-group row" v-if="authError">
                        <p class="error text-center">
                            {{ authError }}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import {login} from '../../_helpers/auth';
    import {config} from '../../_helpers/config'

    export default {
        name: "login",
        data() {
            return {
                message: null
            };
        },
        beforeCreate () {
            this.$store.dispatch('componentDidMount')
        },
        computed: {
            tronWeb() {
                return this.$store.state.tronWeb
            },
            authError() {
                return this.$store.getters.authError;
            }
        },
        methods: {

            authenticate() {

                const messageToSign = config.messageToSign;
                let client_address = window.tronWeb.defaultAddress.base58;

                let signature = null;
                // let check = false;
                window.tronWeb.trx.sign(window.tronWeb.toHex(messageToSign), (err,res) => {
                    signature = res;
                    // console.log('signature: ',signature)

                if (client_address && signature && client_address) {
                    this.$store.dispatch('login');

                    login({
                        address: client_address,
                        signature: signature,
                        messageToSign: messageToSign,
                    })
                        .then((res) => {
                            // console.log(res)
                            this.$store.commit("loginSuccess", res);
                            this.$router.push({path: '/'});
                        })
                        .catch((error) => {
                            this.$store.commit("loginFailed", {error});
                        });
                }
                });
            }
        }
    }
</script>

<style scoped>
    .error {
        text-align: center;
        color: red;
    }
</style>