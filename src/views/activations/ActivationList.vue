<script setup lang="ts">
import { ref } from 'vue'
import { addActivation } from '@/api/activations'

const loading = ref(false)

/** form state */
const form = ref({
  title: '',
  category: '',
  excerpt: '',
  content: '',
  cover_image: '',
  gallery: [''],
  location: '',
  start_date: '',
  end_date: '',
})

/** gallery handlers */
const addGallery = () => {
  form.value.gallery.push('')
}

const removeGallery = (index: number) => {
  form.value.gallery.splice(index, 1)
}

/** submit */
const submitActivation = async () => {
  try {
    loading.value = true

    const payload = {
      ...form.value,
      gallery: form.value.gallery.filter(Boolean),
    }

    await addActivation(payload as any)

    alert('Activation berhasil dibuat')

    // reset form
    form.value = {
      title: '',
      category: '',
      excerpt: '',
      content: '',
      cover_image: '',
      gallery: [''],
      location: '',
      start_date: '',
      end_date: '',
    }
  } catch (err) {
    console.error(err)
    alert('Gagal menyimpan activation')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <main class="max-w-4xl mx-auto px-4 py-8 space-y-6">
    <div>
      <h1 class="text-3xl font-light text-white">Manage Activations</h1>
      <p class="text-gray-300">Activations Dewa United Indonesia</p>

      <div class="bg-zinc-900 rounded-lg p-4 mt-4 border border-white/30">
        <p class="text-neutral-400 font-bold">Form Activations</p>

        <form class="rounded-lg bg-zinc-800 p-4 space-y-4 mt-4" @submit.prevent="submitActivation">
          <!-- title + category -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="form-label">Title</label>
              <input v-model="form.title" class="form-input" placeholder="Nama Activations" />
            </div>

            <div>
              <label class="form-label">Category</label>
              <select v-model="form.category" class="form-input">
                <option value="" disabled>Select Category</option>
                <option value="holding">Holding</option>
                <option value="fc">Football Club</option>
                <option value="esports">Esports</option>
                <option value="bc">Basketball Club</option>
              </select>
            </div>
          </div>

          <!-- excerpt -->
          <div>
            <label class="form-label">Ringkasan (Excerpt)</label>
            <textarea
              v-model="form.excerpt"
              class="form-input h-20"
              placeholder="Ringkasan Activations"
            />
          </div>

          <!-- content -->
          <div>
            <label class="form-label">Content</label>
            <textarea
              v-model="form.content"
              class="form-input h-52"
              placeholder="Content Activations"
            />
          </div>

          <!-- cover image -->
          <div>
            <label class="form-label">Cover Image URL</label>
            <input
              v-model="form.cover_image"
              class="form-input"
              placeholder="masukan URL image cover"
            />

            <img
              v-if="form.cover_image"
              :src="form.cover_image"
              class="mt-3 w-full h-56 object-cover rounded-lg border border-white/10"
            />
          </div>

          <!-- gallery -->
          <div>
            <label class="form-label">Gallery Images</label>

            <div v-for="(img, i) in form.gallery" :key="i" class="space-y-2 mb-4">
              <div class="flex gap-2">
                <input
                  v-model="form.gallery[i]"
                  class="form-input flex-1"
                  placeholder="masukan URL Gallery Foto"
                />
                <button
                  type="button"
                  class="px-3 rounded-lg bg-red-500/20 text-red-400"
                  @click="removeGallery(i)"
                  v-if="form.gallery.length > 1"
                >
                  ✕
                </button>
              </div>

              <img
                v-if="img"
                :src="img"
                class="w-full h-40 object-cover rounded-lg border border-white/10"
              />
            </div>

            <button
              type="button"
              @click="addGallery"
              class="px-4 py-2 rounded-lg bg-white/10 text-white text-sm"
            >
              + Add Image
            </button>
          </div>

          <!-- date + location -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label class="form-label">Start Date</label>
              <input type="date" v-model="form.start_date" class="form-input" />
            </div>

            <div>
              <label class="form-label">End Date</label>
              <input type="date" v-model="form.end_date" class="form-input" />
            </div>

            <div>
              <label class="form-label">Location</label>
              <input v-model="form.location" class="form-input" />
            </div>
          </div>

          <!-- submit -->
          <button
            type="submit"
            :disabled="loading"
            class="w-full mt-6 py-3 rounded-lg bg-gold text-black font-semibold disabled:opacity-50 cursor-pointer hover:bg-goldDark"
          >
            {{ loading ? 'Saving...' : 'Create Activation' }}
          </button>
        </form>
      </div>
    </div>
  </main>
</template>
