import { createRouter, createWebHistory } from 'vue-router'

// Layouts
import AdminLayout from '@/layouts/AdminLayout.vue'
import AuthLayout from '@/layouts/AuthLayout.vue'

// Views
import Dashboard from '@/views/dashboard/Index.vue'
import TeamList from '@/views/teams/TeamList.vue'
import MatchList from '@/views/matches/MatchList.vue'
import PlayerList from '@/views/players/PlayerList.vue'
import ProductList from '@/views/product/ProductList.vue'
import ProductForm from '@/views/product/ProductForm.vue'
import MediaList from '@/views/media/MediaList.vue'
import CategoryList from '@/views/kategori/CategoryList.vue'
import LoginView from '@/views/auth/Login.vue'
import LookbookForm from '@/views/lookbook/LookbookForm.vue'
import LookbookList from '@/views/lookbook/LookbookList.vue'
import ArticleList from '@/views/articles/ArticleList.vue'
import ArticleCreate from '@/views/articles/ArticleCreate.vue'
import ArticleEdit from '@/views/articles/ArticleEdit.vue'

import { useAuthStore } from '@/stores/auth'
import ActivationList from '@/views/activations/ActivationList.vue'

const router = createRouter({
  history: createWebHistory(),

  routes: [
    {
      path: '/login',
      component: AuthLayout,
      meta: { guest: true },
      children: [
        {
          path: '',
          name: 'login',
          component: LoginView,
        },
      ],
    },
    {
      path: '/',
      component: AdminLayout,
      meta: {
        requiresAuth: true,
        requiresAdmin: true,
      },
      children: [
        {
          path: '',
          name: 'dashboard',
          component: Dashboard,
        },

        {
          path: 'teams',
          name: 'teams',
          component: TeamList,
        },

        {
          path: 'matches',
          name: 'matches',
          component: MatchList,
        },

        {
          path: 'matches/:id',
          name: 'match-details',
          component: () => import('@/views/matches/MatchDetails.vue'),
        },

        {
          path: 'players',
          name: 'players',
          component: PlayerList,
        },

        {
          path: 'products',
          name: 'products',
          component: ProductList,
        },

        {
          path: 'products/create',
          name: 'products-create',
          component: ProductForm,
        },

        {
          path: 'products/:id/edit',
          name: 'products-edit',
          component: ProductForm,
        },

        {
          path: 'media',
          name: 'media',
          component: MediaList,
        },

        {
          path: 'category',
          name: 'category',
          component: CategoryList,
        },

        {
          path: 'lookbooks',
          name: 'lookbooks',
          component: LookbookList,
        },

        {
          path: 'lookbooks/create',
          name: 'lookbooks-create',
          component: LookbookForm,
        },

        {
          path: 'lookbooks/edit/:id',
          name: 'lookbooks-edit',
          component: LookbookForm,
        },
        {
          path: 'activations',
          name: 'activations',
          component: ActivationList,
        },
        {
          path: '/articles',
          name: 'ArticleList',
          component: ArticleList,
          meta: { requiresAuth: true}
        },
        {
          path: '/articles/create',
          name: 'ArticleCreate',
          component: ArticleCreate,
          meta: { requiresAuth: true}
        },
        {
          path: '/articles/:id/edit',
          name: 'ArticleEdit',
          component: ArticleEdit,
          meta: { requiresAuth: true}
        },
      ],
    },

    {
      path: '/:pathMatch(.*)*',
      redirect: '/',
    },
  ],
})

router.beforeEach((to, _, next) => {
  const auth = useAuthStore()

  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return next({ name: 'login' })
  }
  if (to.meta.requiresAdmin && !auth.isAdmin) {
    return next({ name: 'login' })
  }
  if (to.meta.guest && auth.isAuthenticated) {
    return next({ name: 'dashboard' })
  }

  next()
})

export default router
