
<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import ArticleForm from '@/components/articles/ArticleForm.vue'
import { articleApi } from '@/api/article.api'
import type { ArticleFormData, ValidationErrors } from '@/types/article'

const router = useRouter()
const submitting = ref(false)
const errors = ref<ValidationErrors>({})

const createArticle = async (formData: ArticleFormData) => {
  submitting.value = true
  errors.value = {}

  try {
    await articleApi.createArticle(formData)
    alert('Article created successfully!')
    router.push('/articles')
  } catch (err: any) {
    console.error('Error creating article:', err)
    
    if (err.response?.data?.errors) {
      errors.value = err.response.data.errors
    } else {
      alert(err.response?.data?.message || 'Failed to create article')
    }
  } finally {
    submitting.value = false
  }
}

const goBack = () => {
  router.push('/articles')
}
</script>
<template>
  <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div class="flex justify-between items-center mb-8">
      <h1 class="text-3xl font-bold text-zinc-50">Create New Article</h1>
      <router-link
        to="/articles"
        class="px-4 py-2 border border-red-500 bg-zinc-800 hover:bg-red-500 text-red-500 hover:text-zinc-50 font-medium rounded-lg transition-colors"
      >
        Back to List
      </router-link>
    </div>

    <div class="bg-zinc-900 rounded-lg shadow p-6">
      <ArticleForm
        :submitting="submitting"
        :errors="errors"
        @submit="createArticle"
        @cancel="goBack"
      />
    </div>
  </div>
</template>