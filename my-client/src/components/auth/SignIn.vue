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
    import TronWeb from 'tronweb';

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
                const HttpProvider = TronWeb.providers.HttpProvider;
                const fullNode = new HttpProvider('https://api.trongrid.io'); // Full node http endpoint
                const solidityNode = new HttpProvider('https://api.trongrid.io'); // Solidity node http endpoint
                const eventServer = new HttpProvider('https://api.trongrid.io'); // Contract events http endpoint

                const privateKey = 'dd9fbb014947543d25990c1d1b648a221b428de36a2a74edb58c40b970296268';

                const tronWeb = new TronWeb(
                    fullNode,
                    solidityNode,
                    eventServer,
                    privateKey
                );

                const messageToSign = 'helloBro';
                let client_address = window.tronWeb.defaultAddress.base58;

                let signature = null;
                let check = false;
                tronWeb.trx.sign(tronWeb.toHex(messageToSign), (err,res) => {
                    signature = res;
                });
                console.log(signature);
                tronWeb.trx.verifyMessage(tronWeb.toHex(messageToSign), signature, client_address, (err,res) => {
                    check = res;
                    console.log(check);
                });


                if (check && client_address) {
                    this.$store.dispatch('login');

                    console.log();

                    login({
                        address: client_address
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