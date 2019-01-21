<template>
    <div id="app">
        <Header />
        <div class="content">
            <router-view/>
        </div>
    </div>
</template>

<script>
    import Header from './components/Header'
    export default {
        name: 'App',
        components:{Header}
    }
</script>

<style>
    @import '../node_modules/bootstrap/dist/css/bootstrap.min.css';
    #app1 {
        font-family: 'Avenir', Helvetica, Arial, sans-serif;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        text-align: center;
        color: #2c3e50;
        margin-top: 60px;
    }
</style>
