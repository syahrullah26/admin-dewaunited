<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { lookbookApi, type Product, type LookbookFormData } from '@/api/lookbook.api';

const router = useRouter();
const route = useRoute();

const isEdit = computed(() => route.name === 'lookbooks-edit');
const lookbookId = computed(() => Number(route.params.id));

const loading = ref(false);
const loadingProducts = ref(false);
const submitting = ref(false);
const imageError = ref(false);
const searchQuery = ref('');

const products = ref<Product[]>([]);
const selectedProducts = ref<number[]>([]); 

const form = ref<LookbookFormData>({
  name: '',
  slug: '',
  hero_image: '',
  products: []
});

const filteredProducts = computed(() => {
  if (!searchQuery.value) return products.value;
  
  const query = searchQuery.value.toLowerCase();
  return products.value.filter(product =>
    product.name.toLowerCase().includes(query) ||
    product.slug.toLowerCase().includes(query)
  );
});

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('id-ID').format(price);
};

const fetchProducts = async () => {
  loadingProducts.value = true;
  try {
    products.value = await lookbookApi.getProducts();
  } catch (error) {
    console.error('Error fetching products:', error);
    alert('Failed to fetch products');
  } finally {
    loadingProducts.value = false;
  }
};

const fetchLookbook = async () => {
  if (!isEdit.value) return;

  loading.value = true;
  try {
    const lookbook = await lookbookApi.getById(lookbookId.value);
    form.value = {
      name: lookbook.name,
      slug: lookbook.slug,
      hero_image: lookbook.hero_image || '',
      products: lookbook.products?.map(p => p.id) || []
    };
    selectedProducts.value = lookbook.products?.map(p => p.id) || [];
  } catch (error) {
    console.error('Error fetching lookbook:', error);
    alert('Failed to fetch lookbook');
    router.back();
  } finally {
    loading.value = false;
  }
};

const handleSubmit = async () => {
  submitting.value = true;
  try {
    const payload: LookbookFormData = {
      name: form.value.name,
      slug: form.value.slug || undefined,
      hero_image: form.value.hero_image || undefined,
      products: selectedProducts.value 
    };

    if (isEdit.value) {
      await lookbookApi.update(lookbookId.value, payload);
      alert('Lookbook updated successfully!');
    } else {
      await lookbookApi.create(payload);
      alert('Lookbook created successfully!');
    }

    router.push('/lookbooks');
  } catch (error: any) {
    console.error('Error saving lookbook:', error);
    alert(error.response?.data?.message || 'Failed to save lookbook');
  } finally {
    submitting.value = false;
  }
};

onMounted(() => {
  fetchProducts();
  if (isEdit.value) {
    fetchLookbook();
  }
});
</script>
<template>
  <div class="p-6 max-w-4xl mx-auto">
    <div class="mb-6">
      <div class="flex items-center gap-2 mb-2">
        <button
          @click="router.back()"
          class="text-white"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 class="text-2xl font-bold text-white">
          {{ isEdit ? 'Edit Lookbook' : 'Create Lookbook' }}
        </h1>
      </div>
    </div>

    <div v-if="loading" class="text-center py-16">
      <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-red"></div>
      <p class="mt-4 text-white">Loading...</p>
    </div>

    <form v-else @submit.prevent="handleSubmit" class="bg-zinc-800 rounded-lg shadow-sm p-6">
      <div class="mb-6">
        <label class="block text-sm font-medium textwhite mb-2">
          Name <span class="text-red-500">*</span>
        </label>
        <input
          v-model="form.name"
          type="text"
          required
          placeholder="Enter lookbook name"
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent outline-none transition"
        />
      </div>

      <div class="mb-6">
        <label class="block text-sm font-medium text-white mb-2">
          Slug
        </label>
        <input
          v-model="form.slug"
          type="text"
          placeholder="auto-generated from name"
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent outline-none transition"
        />
        <p class="text-xs text-gray-500 mt-1">Kosongin aja biar auto generate dari Name</p>
      </div>

      <div class="mb-6">
        <label class="block text-sm font-medium text-white mb-2">
          Hero Image URL
        </label>
        <input
          v-model="form.hero_image"
          type="url"
          placeholder="https://example.com/image.jpg"
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent outline-none transition"
        />
        
        <div v-if="form.hero_image" class="mt-3">
          <img
            :src="form.hero_image"
            alt="Preview"
            class="w-full max-w-md h-48 object-cover rounded-lg border border-gray-200"
            @error="imageError = true"
          />
          <p v-if="imageError" class="text-red-500 text-sm mt-1">
            Failed to load image
          </p>
        </div>
      </div>

      <div class="mb-6">
        <label class="block text-sm font-medium text-white mb-2">
          Products
        </label>
        
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search products..."
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent outline-none transition mb-3"
        />

        <div class="border border-gray-300 rounded-lg max-h-80 overflow-y-auto">
          <div v-if="loadingProducts" class="text-center py-8 text-white">
            Loading products...
          </div>
          
          <div v-else-if="filteredProducts.length === 0" class="text-center py-8 text-white">
            No products found
          </div>

          <div v-else class="divide-y divide-gray-200">
            <label
              v-for="product in filteredProducts"
              :key="product.id"
              class="flex items-center gap-3 p-3 hover:bg-zinc-600 cursor-pointer transition"
            >
              <input
                type="checkbox"
                :value="product.id"
                v-model="selectedProducts"
                class="w-4 h-4 text-white border-gray-300 rounded focus:ring-gold cursor-pointer"
              />
              <div class="flex-1 flex items-center gap-3">
                <img
                  v-if="product.images?.[0]"
                  :src="product.images[0]"
                  :alt="product.name"
                  class="w-12 h-12 object-cover rounded"
                />
                <div class="flex-1">
                  <p class="text-sm font-medium text-white">{{ product.name }}</p>
                  <p class="text-xs text-white">Rp {{ formatPrice(product.price) }}</p>
                </div>
              </div>
            </label>
          </div>
        </div>

        <p class="text-sm text-white mt-2">
          Selected: <strong>{{ selectedProducts.length }}</strong> products
        </p>
      </div>

      <div class="flex justify-end gap-3 pt-4 border-t border-gray-200">
        <button
          type="button"
          @click="router.back()"
          class="px-5 py-2 bg-gray-100 hover:bg-gray-200 text-black rounded-lg font-medium transition duration-200"
        >
          Cancel
        </button>
        <button
          type="submit"
          :disabled="submitting"
          class="px-5 py-2 bg-linear-to-r from-[#aa8320] to-[#7b5902] hover:from-[#cfa73a] hover:to-[#7b5902] text-white rounded-lg font-medium transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ submitting ? 'Saving...' : (isEdit ? 'Update' : 'Create') }}
        </button>
      </div>
    </form>
  </div>
</template>