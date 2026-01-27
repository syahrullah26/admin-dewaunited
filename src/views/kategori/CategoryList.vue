<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { Category } from '@/api/category'
import { getCategory, saveCategory } from '@/api/category'

const category = ref<Category[]>([])
const loading = ref(false)
const submitting = ref(false)
const toast = ref<{ message: string; type: 'success' | 'error' } | null>(null)

const showToast = (message: string, type: 'success' | 'error') => {
  toast.value = { message, type }
  setTimeout(() => (toast.value = null), 3000)
}

// FORM STATE
const categoryName = ref('')

//Submit Form

const submitCategory = async () => {
  submitting.value = true
  try {
    await saveCategory({
      name: categoryName.value,
    })
    categoryName.value = ''
    showToast('Berhasil Membuat Kategori', 'success')
    loadData()
  } catch {
    showToast('Gagal Membuat Kategori', 'error')
  } finally {
    submitting.value = false
  }
}

//load Data
const loadData = async () => {
  loading.value = true
  try {
    const response = await getCategory()
    category.value = response
  } catch {
    showToast('Gagal memuat data kategori', 'error')
  } finally {
    loading.value = false
  }
}
onMounted(loadData)
</script>
<template>
  <main class="max-w-4xl mx-auto px-4 py-8 space-y-6">
    <!-- Header -->
    <div>
      <h1 class="text-3xl font-light text-white">Manage Category</h1>
      <p class="text-gray-300">Upload image atau video ke storage</p>
    </div>

    <div
      class="flex flex-col justify-center rounded-xl border border-white/30 space-y-4 py-4 hover:border-white/50 transition-transform duration-300 hover:scale-105 hover:shadow-xl hover:-translate-y-1"
    >
      <div class="form-group ml-4 mr-4 mt-4">
        <label for="" class="form-label">Nama Kategori</label>
        <input
          v-model="categoryName"
          type="text"
          class="form-input"
          placeholder="Masukan Nama Kategori Produk"
          required
        />
      </div>
      <button
        @click="submitCategory"
        :disabled="submitting"
        class="cursor-pointer bg-gradient-to-r from-[#aa8320] to-[#7b5902] hover:from-[#cfa73a] hover:to-[#7b5902] text-white py-3 px-5 ml-4 mr-4 rounded-lg font-semibold transition disabled:opacity-50"
      >
        {{ submitting ? 'Saving...' : 'Submit' }}
      </button>
    </div>

    <section data-aos="fade-up" data-aos-duration ="1000">
      <div class="bg-zinc-900 rounded-xl shadow-lg border border-white/30 space-y-4 py-4">
        <div class="flex justify-center">
          <h1 class="text-white text-xl font-bold">Category List</h1>
        </div>
        <div class="flex flex-col justify-center w-full">
          <div v-if="loading" class="text-zinc-400 animate-pulse text-lg flex justify-center py-4">
            Loading...
          </div>
          <div
            class="bg-zinc-900/60 backdrop-blur-md border border-white/10 rounded-xl p-4 shadow-lg overflow-x-auto mt-4 ml-2 mr-2"
          >
            <table class="min-w-full border-collapse">
              <thead>
                <tr class="bg-zinc-800/70 border-b border-white/10">
                  <th class="px-4 py-3 text-left text-white text-sm font-semibold">No</th>
                  <th class="px-4 py-3 text-center text-white text-sm font-semibold">
                    Jenis Category
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="(data, index) in category"
                  :key="data.id"
                  class="border-b border-white/5 hover:bg-zinc-800/50 transition"
                >
                  <td class="px-4 py-3 text-zinc-300 text-sm">
                    {{ index + 1 }}
                  </td>
                  <td class="px-4 py-3 text-white text-center text-sm font-medium">
                    {{ data.name }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
    <div
      v-if="toast"
      class="fixed bottom-6 right-6 px-4 py-3 rounded-lg shadow-lg text-white"
      :class="toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'"
    >
      {{ toast.message }}
    </div>
  </main>
</template>
