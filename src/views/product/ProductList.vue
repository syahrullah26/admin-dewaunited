<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/api/axios'
import type { Product } from '@/types/product'

interface PaginatedResponse {
  data: Product[]
  current_page: number
  last_page: number
  per_page: number
  total: number
}

const router = useRouter()

const products = ref<Product[]>([])
const loading = ref(false)
const searchQuery = ref('')
const statusFilter = ref<'all' | 'active' | 'inactive'>('all')

const selectedProducts = ref<number[]>([])

const currentPage = ref(1)
const lastPage = ref(1)
const total = ref(0)

const allSelected = computed(() => {
  return (
    products.value.length > 0 &&
    selectedProducts.value.length === products.value.length
  )
})

const fetchProducts = async () => {
  try {
    loading.value = true

    const params: any = {
      page: currentPage.value,
      per_page: 15,
    }

    if (searchQuery.value) params.search = searchQuery.value
    if (statusFilter.value !== 'all') {
      params.is_active = statusFilter.value === 'active' ? 1 : 0
    }

    const { data } = await api.get<PaginatedResponse>('/products', { params })

    products.value = data.data
    currentPage.value = data.current_page
    lastPage.value = data.last_page
    total.value = data.total
  } catch (err) {
    console.error(err)
    alert('Failed to load products')
  } finally {
    loading.value = false
  }
}

const toggleSelectAll = () => {
  selectedProducts.value = allSelected.value
    ? []
    : products.value.map(p => p.id)
}

const deleteProduct = async (slug: string) => {
  if (!confirm('Are you sure you want to delete this product?')) return

  try {
    await api.delete(`/products/${slug}`)
    fetchProducts()
  } catch (err) {
    console.error(err)
    alert('Failed to delete product')
  }
}

const bulkDelete = async () => {
  if (!selectedProducts.value.length) {
    alert('Please select products to delete')
    return
  }

  if (!confirm(`Delete ${selectedProducts.value.length} products?`)) return

  try {
    await api.post('/products/bulk-delete', {
      ids: selectedProducts.value,
    })
    selectedProducts.value = []
    fetchProducts()
  } catch (err) {
    console.error(err)
    alert('Failed to delete products')
  }
}


const toggleStatus = async (product: Product) => {
  try {
    await api.patch(`/products/${product.slug}/toggle-status`)
    fetchProducts()
  } catch (err) {
    console.error(err)
    alert('Failed to update status')
  }
}

const goToCreate = () => {
  router.push('/products/create')
}

const goToEdit = (slug: string) => {
  router.push(`/products/${slug}/edit`)
}

onMounted(fetchProducts)
</script>
<template>

  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- Header -->
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-3xl font-light text-white">Products</h1>
        <p class="text-white mt-1">Manage your product catalog</p>
      </div>
      <button
        @click="goToCreate"
        class="px-6 py-3 bg-linear-to-r from-[#aa8320] to-[#7b5902] hover:from-[#cfa73a] hover:to-[#7b5902] text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
      >
        + Add Product
      </button>
    </div>

    <!-- Filters -->
    <div class="bg-zinc-900 rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label class="block text-sm font-medium text-white mb-2">Search</label>
          <input
            v-model="searchQuery"
            @input="fetchProducts"
            type="text"
            placeholder="Search products..."
            class="w-full px-4 py-2 border border-gray-300 rounded-lg"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-white mb-2">Status</label>
          <select
            v-model="statusFilter"
            @change="fetchProducts"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
        <div class="flex items-end">
          <button
            v-if="selectedProducts.length > 0"
            @click="bulkDelete"
            class="px-6 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
          >
            Delete Selected ({{ selectedProducts.length }})
          </button>
        </div>
      </div>
    </div>
    
    <!-- Loading -->
    <div v-if="loading" class="flex items-center justify-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
    </div>

    <!-- Products Table -->
    <div v-else class="bg-zinc-900 rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <table class="w-full">
        <thead class="bg-zinc-900 border-b border-gray-200">
          <tr>
            <th class="px-6 py-3 text-left">
              <input
                type="checkbox"
                :checked="allSelected"
                @change="toggleSelectAll"
                class="rounded border-gray-300 text-black focus:ring-black"
              />
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
              Product
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
              Price
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
              Colors
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
              Sizes
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
              Status
            </th>
            <th class="px-6 py-3 text-right text-xs font-medium text-white uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200">
          <tr v-for="product in products" :key="product.id" class="hover:bg-zinc-800">
            <td class="px-6 py-4">
              <input
                type="checkbox"
                :value="product.id"
                v-model="selectedProducts"
                class="rounded border-gray-300 text-black focus:ring-black"
              />
            </td>
            <td class="px-6 py-4">
              <div class="flex items-center gap-4">
                <img
                  :src="product.images[0]"
                  :alt="product.name"
                  class="w-16 h-16 object-cover rounded-lg"
                />
                <div>
                  <p class="text-sm font-medium text-white">{{ product.name }}</p>
                  <p class="text-sm text-white">{{ product.category }}</p>
                </div>
              </div>
            </td>
            <td class="px-6 py-4">
              <div>
                <p class="text-sm font-medium text-white">Rp. {{ product.price }}</p>
                <p v-if="product.original_price" class="text-sm text-gray-400 line-through">
                  Rp. {{ product.original_price }}
                </p>
              </div>
            </td>
            <td class="px-6 py-4">
              <div class="flex gap-1">
                <div
                  v-for="color in product.colors.slice(0, 3)"
                  :key="color.name"
                  :style="{ backgroundColor: color.hex }"
                  class="w-6 h-6 rounded-full border border-gray-300"
                  :title="color.name"
                />
                <span v-if="product.colors.length > 3" class="text-xs text-white flex items-center">
                  +{{ product.colors.length - 3 }}
                </span>
              </div>
            </td>
            <td class="px-6 py-4">
              <p class="text-sm text-white">{{ product.stocks.join(', ') }}</p>
            </td>
            <td class="px-6 py-4">
              <button
                @click="toggleStatus(product)"
                :class="[
                  'px-3 py-1 text-xs font-medium rounded-full',
                  product.is_active
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'
                ]"
              >
                {{ product.is_active ? 'Active' : 'Inactive' }}
              </button>
            </td>
            <td class="px-6 py-4 text-right">
              <div class="flex items-center justify-end gap-2">
                <button
                  @click="goToEdit(product.slug)"
                  class="px-3 py-1.5 text-sm text-white hover:text-white border border-gray-500 rounded-lg hover:border-gray-400 transition-colors"
                >
                  Edit
                </button>
                <button
                  @click="deleteProduct(product.slug)"
                  class="px-3 py-1.5 text-sm text-red-600 hover:text-red-700 border border-red-300 rounded-lg hover:border-red-700 transition-colors"
                >
                  Delete
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Empty State -->
      <div v-if="products.length === 0" class="text-center py-12">
        <p class="text-white">No products found</p>
        <button
          @click="goToCreate"
          class="mt-4 text-sm text-black underline hover:no-underline"
        >
          Create your first product
        </button>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="lastPage > 1" class="flex items-center justify-between mt-6">
      <p class="text-sm text-gray-600">
        Showing {{ products.length }} of {{ total }} products
      </p>
      <div class="flex gap-2">
        <button
          v-for="page in lastPage"
          :key="page"
          @click="currentPage = page; fetchProducts()"
          :class="[
            'px-4 py-2 text-sm rounded-lg border transition-colors',
            currentPage === page
              ? 'bg-black text-white border-black'
              : 'bg-zinc-900 text-white border-gray-300 hover:border-gray-400'
          ]"
        >
          {{ page }}
        </button>
      </div>
    </div>
  </div>
</template>