<template>
  <v-app>
    <v-app-bar
      app
      color="white"
    >
      <div class="d-flex align-center">
        <div class="text-h5">レストラン予約</div>
      </div>

      <v-spacer></v-spacer>

      <v-btn text @click="logout" v-show="(this.$route.path === '/manage')">
        <v-icon>mdi-logout</v-icon>
        <span class="mr-2"> ログアウト</span>
      </v-btn>
    </v-app-bar>

    <v-main>
      <router-view/>
    </v-main>
  </v-app>
</template>

<script>

export default {
  name: 'App',
  data: () => ({
    //
  }),
  methods: {
    logout() {
      localStorage.removeItem('login');
      this.$router.push('/login');
    }
  }
};
</script>
