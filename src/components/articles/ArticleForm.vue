<script setup lang="ts">
import { ref, watch } from 'vue'
import type { ArticleFormData, ValidationErrors } from '@/types/article'

interface Props {
  initialData?: Partial<ArticleFormData>
  isEdit?: boolean
  submitting?: boolean
  errors?: ValidationErrors
}

interface Emits {
  (e: 'submit', data: ArticleFormData): void
  (e: 'cancel'): void
}

const props = withDefaults(defineProps<Props>(), {
  initialData: () => ({}),
  isEdit: false,
  submitting: false,
  errors: () => ({})
})

const emit = defineEmits<Emits>()

const formData = ref<ArticleFormData>({
  title: '',
  slug: '',
  excerpt: '',
  content: '',
  banner_image: '',
  status: 'draft',
  published_at: '',
  meta_title: '',
  meta_description: '',
  meta_keywords: [],
  ...props.initialData
})

const keywordsInput = ref(
  props.initialData.meta_keywords ? props.initialData.meta_keywords.join(', ') : ''
)

const slugManuallyEdited = ref(false)

const stringToSlug = (str: string): string => {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') 
    .replace(/[\s_-]+/g, '-')  
    .replace(/^-+|-+$/g, '')  
}

 
const onTitleChange = () => {
  if (!slugManuallyEdited.value && !props.isEdit) {
    formData.value.slug = stringToSlug(formData.value.title)
  }
}

 
const regenerateSlug = () => {
  formData.value.slug = stringToSlug(formData.value.title)
  slugManuallyEdited.value = false
}

 
watch(() => formData.value.slug, (newSlug, oldSlug) => {
  if (oldSlug !== undefined && newSlug !== stringToSlug(formData.value.title)) {
    slugManuallyEdited.value = true
  }
})

watch(() => props.initialData, (newData) => {
  if (newData && Object.keys(newData).length > 0) {
    formData.value = {
      ...formData.value,
      ...newData
    }
    keywordsInput.value = newData.meta_keywords ? newData.meta_keywords.join(', ') : ''
  }
}, { deep: true })

const updateKeywords = () => {
  if (keywordsInput.value) {
    formData.value.meta_keywords = keywordsInput.value
      .split(',')
      .map(k => k.trim())
      .filter(k => k.length > 0)
  } else {
    formData.value.meta_keywords = []
  }
}

const removeKeyword = (index: number) => {
  formData.value.meta_keywords?.splice(index, 1)
  keywordsInput.value = formData.value.meta_keywords?.join(', ') || ''
}

const handleImageError = (event: Event) => {
  const target = event.target as HTMLImageElement
  target.src = 'https://via.placeholder.com/800x400?text=Invalid+Image+URL'
}

const handleSubmit = () => {
  updateKeywords()
  emit('submit', formData.value)
}
</script>

<template>
  <form @submit.prevent="handleSubmit" class="max-w-4xl">
    <!-- Title -->
    <div class="mb-6">
      <label for="title" class="block text-sm font-semibold text-zinc-50 mb-2">
        Title <span class="text-red-600">*</span>
      </label>
      <input
        id="title"
        v-model="formData.title"
        type="text"
        placeholder="Enter article title"
        required
        @input="onTitleChange"
        class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-goldDark outline-none"
      />
      <span v-if="errors.title" class="block mt-1 text-sm text-red-600">{{ errors.title[0] }}</span>
    </div>

    <!-- Slug -->
    <div class="mb-6">
      <label for="slug" class="block text-sm font-semibold text-zinc-50 mb-2">
        Slug
      </label>
      <div class="relative">
        <input
          id="slug"
          v-model="formData.slug"
          type="text"
          placeholder="article-slug"
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-goldDark outline-none"
          :class="{'bg-gray-50': !slugManuallyEdited && !props.isEdit}"
        />
        <button
          v-if="formData.title && !props.isEdit"
          type="button"
          @click="regenerateSlug"
          class="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 text-xs bg-gold text-white hover:bg-goldDark rounded transition-colors"
        >
          Regenerate
        </button>
      </div>
      <small class="block mt-1 text-xs text-zinc-50">
        {{ slugManuallyEdited ? 'Custom slug (manually edited)' : 'Biarin kosong aja, nanti otomatis input dari title' }}
      </small>
      <span v-if="errors.slug" class="block mt-1 text-sm text-red-600">{{ errors.slug[0] }}</span>
    </div>

    <!-- Banner Image -->
    <div class="mb-6">
      <label for="banner_image" class="block text-sm font-semibold text-zinc-50 mb-2">
        Banner Image URL
      </label>
      <input
        id="banner_image"
        v-model="formData.banner_image"
        type="url"
        placeholder="https://example.com/image.webp"
        class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-goldDark outline-none"
      />
      <span v-if="errors.banner_image" class="block mt-1 text-sm text-red-600">{{ errors.banner_image[0] }}</span>
      
      <!-- Image Preview -->
      <div v-if="formData.banner_image" class="mt-4 max-w-md border border-gray-200 rounded-lg overflow-hidden">
        <img :src="formData.banner_image" alt="Banner preview" class="w-full h-auto" @error="handleImageError" />
      </div>
    </div>

    <!-- Excerpt -->
    <div class="mb-6">
      <label for="excerpt" class="block text-sm font-semibold text-zinc-50 mb-2">
        Excerpt (Summary)
      </label>
      <textarea
        id="excerpt"
        v-model="formData.excerpt"
        rows="3"
        placeholder="summary pendek (150-300 karakter)"
        maxlength="500"
        class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-goldDark outline-none resize-y"
      ></textarea>
      <small class="block mt-1 text-xs text-zinc-50">{{ formData.excerpt?.length || 0 }} / 500 karakter</small>
      <span v-if="errors.excerpt" class="block mt-1 text-sm text-red-600">{{ errors.excerpt[0] }}</span>
    </div>

    <!-- Content -->
    <div class="mb-6">
      <label for="content" class="block text-sm font-semibold text-zinc-50 mb-2">
        Content <span class="text-red-600">*</span>
      </label>
      <textarea
        id="content"
        v-model="formData.content"
        rows="15"
        placeholder="Tulis full konten disini..."
        required
        class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-goldDark outline-none resize-y"
      ></textarea>
      <small class="block mt-1 text-xs text-zinc-50">Supports HTML formatting</small>
      <span v-if="errors.content" class="block mt-1 text-sm text-red-600">{{ errors.content[0] }}</span>
    </div>

    <!-- Status & Published At -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
      <div>
        <label for="status" class="block text-sm font-semibold text-zinc-50 mb-2">
          Status <span class="text-red-600">*</span>
        </label>
        <select
          id="status"
          v-model="formData.status"
          required
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-goldDark outline-none"
        >
          <option value="draft">Draft</option>
          <option value="published">Published</option>
          <option value="archived">Archived</option>
        </select>
        <span v-if="errors.status" class="block mt-1 text-sm text-red-600">{{ errors.status[0] }}</span>
      </div>

      <div>
        <label for="published_at" class="block text-sm font-semibold text-zinc-50 mb-2">
          Published At
        </label>
        <input
          id="published_at"
          v-model="formData.published_at"
          type="datetime-local"
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-goldDark outline-none"
        />
        <small class="block mt-1 text-xs text-zinc-50">Biarin kosong aja, nanti otomatis input</small>
        <span v-if="errors.published_at" class="block mt-1 text-sm text-red-600">{{ errors.published_at[0] }}</span>
      </div>
    </div>

    <!-- SEO Meta Section -->
    <div class="bg-zinc-900 border border-gray-200 rounded-lg p-6 mb-6">
      <h3 class="text-lg font-semibold text-zinc-50 mb-4">SEO Meta Data (Optional)</h3>
      
      <!-- Meta Title -->
      <div class="mb-4">
        <label for="meta_title" class="block text-sm font-semibold text-zinc-50 mb-2">
          Meta Title
        </label>
        <input
          id="meta_title"
          v-model="formData.meta_title"
          type="text"
          placeholder="SEO-friendly title (60-70 karakter)"
          maxlength="255"
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-goldDark outline-none"
        />
        <small class="block mt-1 text-xs text-zinc-50">
          {{ formData.meta_title?.length || 0 }} / 70 karakter (rekomendasi)
        </small>
      </div>

      <!-- Meta Description -->
      <div class="mb-4">
        <label for="meta_description" class="block text-sm font-semibold text-zinc-50 mb-2">
          Meta Description
        </label>
        <textarea
          id="meta_description"
          v-model="formData.meta_description"
          rows="3"
          placeholder="SEO description (150-160 karakter)"
          maxlength="500"
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-goldDark outline-none resize-y"
        ></textarea>
        <small class="block mt-1 text-xs text-zinc-50">
          {{ formData.meta_description?.length || 0 }} / 160 karakter (rekomendasi)
        </small>
      </div>

      <!-- Meta Keywords -->
      <div>
        <label for="meta_keywords" class="block text-sm font-semibold text-zinc-50 mb-2">
          Meta Keywords
        </label>
        <input
          id="meta_keywords"
          v-model="keywordsInput"
          type="text"
          placeholder="key1, key2"
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-goldDark outline-none"
          @blur="updateKeywords"
        />
        <small class="block mt-1 text-xs text-zinc-50">Pisahin antar keyword pake koma</small>
        
        <!-- Keywords Tags -->
        <div v-if="formData.meta_keywords && formData.meta_keywords.length > 0" class="flex flex-wrap gap-2 mt-3">
          <span
            v-for="(keyword, index) in formData.meta_keywords"
            :key="index"
            class="inline-flex items-center gap-2 px-3 py-1 bg-gold text-zinc-50 rounded-full text-sm"
          >
            {{ keyword }}
            <button type="button" @click="removeKeyword(index)" class="text-zinc-50 hover:text-zinc-200 text-lg leading-none">
              ×
            </button>
          </span>
        </div>
      </div>
    </div>

    <!-- Form Actions -->
    <div class="flex gap-4 pt-6 border-t border-gray-200">
      <button
        type="button"
        @click="$emit('cancel')"
        :disabled="submitting"
        class="px-6 py-2 border border-red-500 bg-zinc-800 hover:bg-red-500 text-red-500 hover:text-zinc-50 font-medium rounded-lg disabled:opacity-50 transition-colors"
      >
        Cancel
      </button>
      <button
        type="submit"
        :disabled="submitting"
        class="px-6 py-2 bg-gold hover:bg-goldDark text-white font-medium rounded-lg disabled:opacity-50 transition-colors"
      >
        {{ submitting ? 'Saving...' : (isEdit ? 'Update Article' : 'Create Article') }}
      </button>
    </div>
  </form>
</template>