import Vue from 'vue'
import VueRouter from 'vue-router'
import Reserve from '../views/Reserve.vue'
import Manage from '../views/Manage.vue'
import Login from '../views/Login.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'Reserve',
    component: Reserve
  },
  {
    path: '/manage',
    name: 'Manage',
    component: Manage
  },
  {
    path: '/login',
    name: 'Login',
    component: Login
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
