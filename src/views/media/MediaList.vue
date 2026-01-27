<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { uploadMedia, getMedia } from '@/api/media'
import type { Media } from '@/api/media'

const medias = ref<Media[]>([])

// STATE FORM
const inputMedia = ref<File[]>([])
const previews = ref<{ url: string; type: string }[]>([])

const loading = ref(false)
const submitting = ref(false)
const toast = ref<{ message: string; type: 'success' | 'error' } | null>(null)

const showToast = (message: string, type: 'success' | 'error') => {
  toast.value = { message, type }
  setTimeout(() => (toast.value = null), 3000)
}

const onFileChange = (e: Event) => {
  const target = e.target as HTMLInputElement
  const files = target.files

  if (!files || files.length === 0) return

  inputMedia.value = Array.from(files)

  previews.value = inputMedia.value.map((f) => ({
    url: URL.createObjectURL(f),
    type: f.type.startsWith('image') ? 'image' : 'video',
  }))
}

const removeFile = (index: number) => {
  inputMedia.value.splice(index, 1)
  previews.value.splice(index, 1)
}

const clearInput = () => {
  const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
  if (fileInput) fileInput.value = ''
}

const submitMedia = async () => {
  if (!inputMedia.value.length) {
    showToast('Pilih media terlebih dahulu', 'error')
    return
  }

  submitting.value = true

  try {
    await uploadMedia(inputMedia.value)
    showToast('Media berhasil diupload', 'success')

    inputMedia.value = []
    previews.value = []
    clearInput()
    loadData()
  } catch (error) {
    showToast('Gagal upload media', 'error')
    console.error(error)
  } finally {
    submitting.value = false
  }
}
const loadData = async () => {
  loading.value = true
  try {
    const response = await getMedia()
    medias.value = response
  } catch {
    showToast('Gagal Memuat Media', 'error')
  } finally {
    loading.value = false
  }
}

const getMediaUrl = (path: string) => {
  return `http://localhost:8000/storage/${path}`
}
const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text)
    showToast('File path berhasil dicopy!', 'success')
  } catch (err) {
    console.error(err)
    showToast('Gagal copy file path', 'error')
  }
}

onMounted(loadData)
</script>

<template>
  <main class="max-w-4xl mx-auto px-4 py-8 space-y-6">
    <!-- Header -->
    <div>
      <h1 class="text-3xl font-light text-white">Upload Media</h1>
      <p class="text-gray-300">Upload image atau video ke storage</p>
    </div>

    <!-- Input -->
    <div>
      <label class="form-label">Pilih Media</label>

      <label class="form-image cursor-pointer">
        <input
          type="file"
          accept="image/*,video/*"
          multiple
          class="hidden"
          @change="onFileChange"
        />
        <span>Upload Media</span>
      </label>
    </div>

    <!-- Preview -->
    <div class="bg-zinc-800 rounded-lg p-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
      <div v-if="!previews.length" class="text-gray-400 text-sm">Belum ada media</div>

      <div v-for="(p, index) in previews" :key="index" class="relative group">
        <!-- Image preview -->
        <img v-if="p.type === 'image'" :src="p.url" class="w-full h-28 rounded-lg object-cover" />

        <!-- Video preview -->
        <video v-else :src="p.url" class="w-full h-28 rounded-lg object-cover" controls></video>

        <!-- Remove button -->
        <button
          @click="removeFile(index)"
          class="absolute top-1 right-1 bg-red-600 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition"
        >
          Hapus
        </button>
      </div>
    </div>

    <!-- Submit -->
    <button
      @click="submitMedia"
      :disabled="submitting"
      class="cursor-pointer bg-gradient-to-r from-[#aa8320] to-[#7b5902] hover:from-[#cfa73a] hover:to-[#7b5902] text-white py-3 px-5 rounded-lg font-semibold transition disabled:opacity-50"
    >
      {{ submitting ? 'Uploading...' : 'Submit' }}
    </button>

    <!-- Toast -->
    <div
      v-if="toast"
      class="fixed bottom-6 right-6 px-4 py-3 rounded-lg shadow-lg text-white"
      :class="toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'"
    >
      {{ toast.message }}
    </div>

    <!-- Media Storage List -->
    <section>
      <div class="bg-zinc-900 rounded-2xl shadow-md border border-black/5 space-y-4 py-4">
        <div class="flex justify-center">
          <h1
            class="font-bold text-xl bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent transition-all duration-300 hover:from-gold hover:to-white"
          >
            Media Storage
          </h1>
        </div>
        <hr class="border border-gold" />
        <div v-if="loading" class="flex justify-center gap-2">
          <svg
            class="h-5 w-5 animate-spin text-gold"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              class="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              stroke-width="4"
            />
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
          </svg>
          <h5 class="text-gold font-semibold text-md animate-pulse transition-all">Loading...</h5>
        </div>

        <div class="flex flex-wrap gap-4">
          <div
            v-for="media in medias"
            :key="media.id"
            class="bg-zinc-800 rounded-2xl shadow-md p-2 flex-shrink-0 w-40"
          >
            <!-- Image preview -->
            <img
              v-if="media.type === 'image'"
              :src="getMediaUrl(media.file_path)"
              class="rounded-xl w-full h-32 object-cover"
            />
            <!-- Video preview -->
            <video
              v-else-if="media.type === 'video'"
              :src="getMediaUrl(media.file_path)"
              controls
              class="rounded-xl w-full h-32 object-cover"
            />
            <!-- Unsupported -->
            <div v-else class="text-zinc-400 text-sm text-center">Media type not supported</div>
            <p
              class="text-white font-semibold text-sm mt-2 truncate cursor-pointer hover:text-yellow-400"
              :title="media.file_path"
              @click="copyToClipboard('http://localhost:8000/storage/' + media.file_path)"
            >
              {{ media.file_name }}
            </p>
          </div>
        </div>
      </div>
    </section>
  </main>
</template>
