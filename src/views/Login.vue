<template>
<v-row justify="center" class="mt-10">
  <v-card color="grey lighten-4" width="350px" flat>
    <v-toolbar color="green" dark>
      <v-toolbar-title>ログイン</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn icon @click="newReserve = false">
        <v-icon>mdi-close</v-icon>
      </v-btn>
    </v-toolbar>
    <v-card-text>
      <span>管理者ID</span>
      <v-text-field v-model="id"></v-text-field>
    </v-card-text>
    <v-card-text>
      <span>パスワード</span>
      <v-text-field v-model="pass"></v-text-field>
    </v-card-text>
    <v-card-actions>
      <v-btn color="green" dark class="ml-3 mb-3" @click="login">
        ログイン
      </v-btn>
    </v-card-actions>
  </v-card>
</v-row>
</template>

<script>
export default {
  data() {
    return {
      id: "",
      pass: ""
    }
  },
  methods: {
    login() {
      if (this.id === "test" && this.pass === "test") {
        localStorage.setItem('login', this.id);
        this.$router.push('/manage');
      } else {
        alert('IDまたはパスワードが間違っています。')
      }
    }
  }
}
</script>