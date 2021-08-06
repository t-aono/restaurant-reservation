import Vue from 'vue'
import VueRouter from 'vue-router'
import Reserve from '../views/Reserve.vue'
import Manage from '../views/Manage.vue'

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
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
