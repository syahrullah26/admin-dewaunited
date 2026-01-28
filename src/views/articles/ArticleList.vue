

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { articleApi } from '@/api/article.api'
import type { Article, PaginatedResponse, ArticleFilters } from '@/types/article'

const loading = ref(false)
const error = ref<string | null>(null)
const articles = ref<PaginatedResponse<Article>>({
  data: [],
  current_page: 1,
  last_page: 1,
  per_page: 15,
  total: 0,
  prev_page_url: null,
  next_page_url: null
})

const filters = reactive<ArticleFilters>({
  search: '',
  status: '',
  sort_by: 'created_at',
  sort_order: 'desc',
  page: 1,
  per_page: 15
})

const showDeleteModal = ref(false)
const articleToDelete = ref<Article | null>(null)
const deleting = ref(false)

let searchTimeout: ReturnType<typeof setTimeout> | null = null

const fetchArticles = async () => {
  loading.value = true
  error.value = null

  try {
    const params: ArticleFilters = {
      search: filters.search || undefined,
      status: filters.status || undefined,
      sort_by: filters.sort_by,
      sort_order: filters.sort_order,
      page: filters.page,
      per_page: filters.per_page
    }

    articles.value = await articleApi.getArticles(params)
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Failed to load articles'
    console.error('Error fetching articles:', err)
  } finally {
    loading.value = false
  }
}

const debounceSearch = () => {
  if (searchTimeout) clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    filters.page = 1
    fetchArticles()
  }, 500)
}

const changePage = (page: number) => {
  filters.page = page
  fetchArticles()
}

const confirmDelete = (article: Article) => {
  articleToDelete.value = article
  showDeleteModal.value = true
}

const deleteArticle = async () => {
  if (!articleToDelete.value) return

  deleting.value = true

  try {
    await articleApi.deleteArticle(articleToDelete.value.id)
    showDeleteModal.value = false
    articleToDelete.value = null
    await fetchArticles()
    alert('Article deleted successfully')
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Failed to delete article'
    console.error('Error deleting article:', err)
  } finally {
    deleting.value = false
  }
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

onMounted(() => {
  fetchArticles()
})
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- Header -->
    <div class="flex justify-between items-center mb-8">
      <h1 class="text-3xl font-bold text-gray-900">Manage Articles</h1>
      <router-link
        to="/articles/create"
        class="inline-flex items-center px-4 py-2 bg-gold hover:bg-goldDark text-white font-medium rounded-lg transition-colors"
      >
        <span class="text-xl mr-2">+</span>
        Create New Article
      </router-link>
    </div>

    <!-- Filters -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <input
        v-model="filters.search"
        type="text"
        placeholder="Search articles..."
        @input="debounceSearch"
        class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
      />

      <select
        v-model="filters.status"
        @change="fetchArticles"
        class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
      >
        <option value="">All Status</option>
        <option value="draft">Draft</option>
        <option value="published">Published</option>
        <option value="archived">Archived</option>
      </select>

      <select
        v-model="filters.sort_by"
        @change="fetchArticles"
        class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
      >
        <option value="created_at">Created Date</option>
        <option value="title">Title</option>
        <option value="published_at">Published Date</option>
        <option value="view_count">Views</option>
      </select>

      <select
        v-model="filters.sort_order"
        @change="fetchArticles"
        class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
      >
        <option value="desc">Descending</option>
        <option value="asc">Ascending</option>
      </select>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-12 bg-zinc-900 rounded-lg shadow">
      <p class="text-gray-600">Loading articles...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="text-center py-12 bg-zinc-900 rounded-lg shadow">
      <p class="text-red-600">{{ error }}</p>
    </div>

    <!-- Articles Table -->
    <div v-else class="bg-white rounded-lg shadow overflow-hidden">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-zinc-50 uppercase tracking-wider">Banner</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-zinc-50 uppercase tracking-wider">Title</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-zinc-50 uppercase tracking-wider">Status</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-zinc-50 uppercase tracking-wider">Views</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-zinc-50 uppercase tracking-wider">Published At</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-zinc-50 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="article in articles.data" :key="article.id" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap">
                <img
                  v-if="article.banner_image"
                  :src="article.banner_image"
                  :alt="article.title"
                  class="w-20 h-12 object-cover rounded"
                />
                <div v-else class="w-20 h-12 bg-gray-200 rounded flex items-center justify-center text-xs text-zinc-50">
                  No Image
                </div>
              </td>
              <td class="px-6 py-4">
                <div class="flex flex-col">
                  <span class="text-sm font-medium text-gray-900">{{ article.title }}</span>
                  <span class="text-xs text-zinc-50">{{ article.slug }}</span>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  :class="[
                    'inline-flex px-3 py-1 text-xs font-semibold rounded-full',
                    article.status === 'draft' && 'bg-yellow-100 text-yellow-800',
                    article.status === 'published' && 'bg-green-100 text-green-800',
                    article.status === 'archived' && 'bg-gray-100 text-gray-800'
                  ]"
                >
                  {{ article.status }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ article.view_count }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                <span v-if="article.published_at">{{ formatDate(article.published_at) }}</span>
                <span v-else class="text-gray-400">-</span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm">
                <div class="flex space-x-2">
                  <router-link
                    :to="`/articles/${article.id}/edit`"
                    class="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
                  >
                    Edit
                  </router-link>
                  <button
                    @click="confirmDelete(article)"
                    class="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Empty State -->
        <div v-if="articles.data && articles.data.length === 0" class="text-center py-12">
          <p class="text-gray-600 mb-4">No articles found.</p>
          <router-link
            to="/articles/create"
            class="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors"
          >
            Create Your First Article
          </router-link>
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="articles.data && articles.data.length > 0" class="flex justify-center items-center space-x-4 mt-6">
      <button
        @click="changePage(articles.current_page - 1)"
        :disabled="!articles.prev_page_url"
        class="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        Previous
      </button>
      <span class="text-sm text-gray-700">Page {{ articles.current_page }} of {{ articles.last_page }}</span>
      <button
        @click="changePage(articles.current_page + 1)"
        :disabled="!articles.next_page_url"
        class="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        Next
      </button>
    </div>

    <!-- Delete Modal -->
    <div
      v-if="showDeleteModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      @click="showDeleteModal = false"
    >
      <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4" @click.stop>
        <h3 class="text-lg font-semibold text-gray-900 mb-2">Confirm Delete</h3>
        <p class="text-gray-600 mb-1">
          Are you sure you want to delete "<strong>{{ articleToDelete?.title }}</strong>"?
        </p>
        <p class="text-sm text-red-600 mb-6">This action cannot be undone.</p>
        <div class="flex justify-end space-x-3">
          <button
            @click="showDeleteModal = false"
            class="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            @click="deleteArticle"
            :disabled="deleting"
            class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg disabled:opacity-50 transition-colors"
          >
            {{ deleting ? 'Deleting...' : 'Delete' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>