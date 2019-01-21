<template>
    <div class="container">
        <div class="row justify-content-center">
            <div class="col-md-8">
                <div class="card card-default">
                    <div class="card-body text-center">
                        <h2>Hello {{currentUser.username ? currentUser.username : currentUser.address}}</h2>
                        <h4>PC</h4>
                        <div class="" v-if="!currentUser.username">
                            Now you dont have username.
                        </div>
                        <br>
                        <button class="btn btn-sm btn-warning" @click="showInputNewName">Change Name</button>
                        <div v-if="showNewName">
                            <input type="text"
                                   v-model="newname"
                                   placeholder="to submit press Enter"
                                   @keyup.13="changeName">
                        </div>
                        <br>
                        <br>

                        <img src="../tron.jpg" alt="ethereum" style="max-height: 120px"><br>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import  axios  from 'axios'
    import {config} from "../_helpers/config";


    export default {
        name: 'home',
        data(){
            return{
                showNewName:false,
                newname: null,
                socket: null,
            }
        },
        beforeCreate () {
            this.$store.dispatch('componentDidMount')
        },

        mounted()
        {
            // create connection
            var ws = new WebSocket(config.webSocketServerHost + this.currentUser.address);
            ws.onopen = () => {
                console.log('The connection is ESTABLISHING with: '+ config.webSocketServerHost + this.currentUser.address)
            };

            // socket.send('test');

            ws.onmessage = function(event) {
                var incomingMessage = event.data;

                if (incomingMessage == 'ok') {
                    // console.log('OK !');

                    alert('Hello from WS !!');
                } else
                    console.log(incomingMessage);
            };

            ws.close = event => {
                if (event.wasClean) {
                    console.log('The connection closed Clearly');
                } else {
                    console.log('The connection TERMINATED...');
                }
                console.log('Код: ' + event.code + ' Причина: ' + event.reason);
            };

            ws.onerror = error => {
                console.log('Some error: ' + error.message);
            }
        },
        computed: {
            currentUser() {
                this.newname = this.$store.getters.currentUser.username;
                return this.$store.getters.currentUser
            }
        },
        methods: {
            showInputNewName(){
                this.showNewName = !this.showNewName;
            },
            changeName(){
                if (this.newname.length < 1) return;

                axios.post(config.apiUrl + '/change-name', { newname: this.newname, address: this.currentUser.address})
                    .then((response) => {
                        this.newname = null;
                        this.showNewName = false;
                        localStorage.removeItem('user');
                        this.$store.commit("loginSuccess", response.data);
                    })
                    .catch((err) => {
                        console.log('Something wrong with token...', err);
                    })
            },
        }
    }
</script>