<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { lookbookApi, type Lookbook } from '@/api/lookbook.api';
import { useRouter } from 'vue-router';

const router = useRouter();
const lookbooks = ref<Lookbook[]>([]);
const loading = ref(false);
const showDeleteModal = ref(false);
const selectedLookbook = ref<Lookbook | null>(null);
const deleting = ref(false);

const fetchLookbooks = async () => {
  loading.value = true;
  try {
    lookbooks.value = await lookbookApi.getAll();
  } catch (error) {
    console.error('Error fetching lookbooks:', error);
    alert('Failed to fetch lookbooks');
  } finally {
    loading.value = false;
  }
};

const confirmDelete = (lookbook: Lookbook) => {
  selectedLookbook.value = lookbook;
  showDeleteModal.value = true;
};

const deleteLookbook = async () => {
  if (!selectedLookbook.value) return;

  deleting.value = true;
  try {
    await lookbookApi.delete(selectedLookbook.value.id);
    showDeleteModal.value = false;
    fetchLookbooks();
  } catch (error) {
    console.error('Error deleting lookbook:', error);
    alert('Failed to delete lookbook');
  } finally {
    deleting.value = false;
  }
};

onMounted(() => {
  fetchLookbooks();
});
</script>
<template>
  <div class="p-6">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold text-white">Lookbook Management</h1>
      <router-link
        to="/lookbooks/create"
        class="bg-linear-to-r from-[#aa8320] to-[#7b5902] hover:from-[#cfa73a] hover:to-[#7b5902] text-white px-4 py-2 rounded-lg font-medium transition duration-200"
      >
        + Create Lookbook
      </router-link>
    </div>

    <div v-if="loading" class="text-center py-16">
      <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      <p class="mt-4 text-white">Loading lookbooks...</p>
    </div>

    <div v-else-if="lookbooks.length === 0" class="text-center py-16">
      <svg class="mx-auto h-12 w-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
      <h3 class="mt-4 text-lg font-medium text-white">No lookbooks</h3>
      <p class="mt-2 text-white">Get started by creating a new lookbook.</p>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      <div
        v-for="lookbook in lookbooks"
        :key="lookbook.id"
        class="bg-zinc-800 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden group"
      >
        <div class="relative h-48 bg-gray-100 overflow-hidden">
          <img
            :src="lookbook.hero_image || 'No Image'"
            :alt="lookbook.name"
            class="w-full h-full object-cover group-hover:scale-110 transition duration-300"
          />
          <div class="absolute top-2 right-2">
            <span class="bg-linear-to-r from-[#aa8320] to-[#7b5902] hover:from-[#cfa73a] hover:to-[#7b5902] text-white text-xs px-2 py-1 rounded-full">
              {{ lookbook.products?.length || 0 }} Products
            </span>
          </div>
        </div>

        <div class="p-4">
          <h3 class="text-lg font-semibold text-white mb-1 truncate">
            {{ lookbook.name }}
          </h3>
          <p class="text-sm text-white-500 mb-4 truncate">
            /{{ lookbook.slug }}
          </p>

          <div class="flex gap-2">
            <router-link
              :to="`/lookbooks/edit/${lookbook.id}`"
              class="flex-1 text-center border border-green-700 bg-zinc-800 hover:bg-green-700 text-green-700 hover:text-white py-2 px-3 rounded-lg text-sm font-bold transition duration-200"
            >
              Edit
            </router-link>
            <button
              @click="confirmDelete(lookbook)"
              class="flex-1 border border-red-900 bg-zinc-800 hover:bg-red-900 text-red-400 hover:text-white py-2 px-3 rounded-lg text-sm font-medium transition duration-200"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>

    <div
      v-if="showDeleteModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      @click.self="showDeleteModal = false"
    >
      <div class="bg-zinc-800 rounded-lg max-w-md w-full p-6">
        <h3 class="text-lg font-semibold text-white mb-2">Delete Lookbook</h3>
        <p class="text-white mb-6">
          Are you sure you want to delete "<strong>{{ selectedLookbook?.name }}</strong>"? This action cannot be undone.
        </p>
        <div class="flex justify-end gap-3">
          <button
            @click="showDeleteModal = false"
            class="px-4 py-2 border border-green-700 bg-zinc-800 hover:bg-green-700 text-green-700 hover:text-white rounded-lg font-medium transition duration-200"
          >
            Cancel
          </button>
          <button
            @click="deleteLookbook"
            :disabled="deleting"
            class="px-4 py-2 border border-red-900 bg-zinc-800 hover:bg-red-900 text-red-400 hover:text-white rounded-lg font-medium transition duration-200 disabled:opacity-50"
          >
            {{ deleting ? 'Deleting...' : 'Delete' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>