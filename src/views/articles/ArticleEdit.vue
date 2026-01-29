
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import ArticleForm from '@/components/articles/ArticleForm.vue'
import { articleApi } from '@/api/article.api'
import type { Article, ArticleFormData, ValidationErrors } from '@/types/article'

const router = useRouter()
const route = useRoute()

const loading = ref(true)
const loadError = ref<string | null>(null)
const submitting = ref(false)
const errors = ref<ValidationErrors>({})
const article = ref<Partial<ArticleFormData>>({})

const articleId = Number(route.params.id)

const loadArticle = async () => {
  loading.value = true
  loadError.value = null

  try {
    const data = await articleApi.getArticle(articleId)

    article.value = {
      title: data.title ?? '',
      slug: data.slug ?? '',
      excerpt: data.excerpt ?? '',
      content: data.content ?? '',
      banner_image: data.banner_image ?? '',
      status: data.status,
      meta_title: data.meta_title ?? '',
      meta_description: data.meta_description ?? '',
      meta_keywords: data.meta_keywords ?? [],
      published_at: data.published_at
        ? new Date(data.published_at).toISOString().slice(0, 16)
        : undefined,
    }
  } catch (err: any) {
    console.error('Error loading article:', err)
    loadError.value = err.response?.data?.message || 'Failed to load article'
  } finally {
    loading.value = false
  }
}


const updateArticle = async (formData: ArticleFormData) => {
  submitting.value = true
  errors.value = {}

  try {
    await articleApi.updateArticle(articleId, formData)
    alert('Article updated successfully!')
    router.push('/articles')
  } catch (err: any) {
    console.error('Error updating article:', err)
    
    if (err.response?.data?.errors) {
      errors.value = err.response.data.errors
    } else {
      alert(err.response?.data?.message || 'Failed to update article')
    }
  } finally {
    submitting.value = false
  }
}

const goBack = () => {
  router.push('/articles')
}

onMounted(() => {
  loadArticle()
})
</script>

<template>
  <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div class="flex justify-between items-center mb-8">
      <h1 class="text-3xl font-bold text-zinc-50">Edit Article</h1>
      <router-link
        to="/articles"
        class="px-4 py-2 border border-red-500 bg-zinc-800 hover:bg-red-500 text-red-500 hover:text-zinc-50 font-medium rounded-lg transition-colors"
      >
         Back to List
      </router-link>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-12 bg-zinc-900 rounded-lg shadow">
      <p class="text-zinc-50">Loading article...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="loadError" class="text-center py-12 bg-zinc-900 rounded-lg shadow">
      <p class="text-red-600 mb-4">{{ loadError }}</p>
      <router-link
        to="/articles"
        class="inline-block px-4 py-2 border border-red-500 bg-zinc-800 hover:bg-red-500 text-red-500 hover:text-zinc-50 font-medium rounded-lg transition-colors"
      >
        Back to List
      </router-link>
    </div>

    <!-- Form -->
    <div v-else class="bg-zinc-900 rounded-lg shadow p-6">
      <ArticleForm
        :initial-data="article"
        :is-edit="true"
        :submitting="submitting"
        :errors="errors"
        @submit="updateArticle"
        @cancel="goBack"
      />
    </div>
  </div>
</template>