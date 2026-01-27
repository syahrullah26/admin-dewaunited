<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import api from '@/api/axios'; 
import FormImage from '@/components/forms/FormImage.vue';
import type {
  Product,
  ProductColor,
  ShippingTier,
  TrustBadge,
  SizeGuide,
  DetailImage
} from '@/types/product';
import type { Category } from '@/api/category'
import { getCategory } from '@/api/category'

const router = useRouter();
const route = useRoute();
const loading = ref(false);
const saving = ref(false);

const isEdit = computed(() => !!route.params.id);

const form = ref({
  name: '',
  category: '',
  price: 0,
  original_price: null as number | null,
  video_url: '',
  images: [] as string[],
  colors: [] as ProductColor[],
  sizes: [] as string[],
  stocks: [] as Array<{
    size: string
    stock: number
  }>,

  badges: [] as Array<{ icon: string; text: string }>,
  description: '',
  size_guide_desc: '',
  shipping_info: [] as ShippingTier[],
  trust_badges: [] as TrustBadge[],
  size_guide: [] as SizeGuide[],
  description_video_url: '',
  detail_product: '',
  detail_images: [] as DetailImage[],
  lifestyle_images: [] as string[],
  related_products: [] as number[],
  is_active: true,
});


const availableSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

const fetchProduct = async () => {
  if (!isEdit.value) return;

  try {
    loading.value = true;
    const { data } = await api.get<{ data: Product }>(`/products/${route.params.id}`);
    const product = data.data;

    form.value = {
      name: product.name,
      category: product.category,
      price: Number(product.price),
      original_price: product.original_price,
      video_url: product.video_url || '',
      images: product.images,
      colors: product.colors,

      sizes: product.stocks.map(s => s.size),
      stocks: product.stocks.map(s => ({
        size: s.size,
        stock: s.stock,
      })),

      badges: product.badges,
      description: product.description,
      size_guide_desc: product.size_guide_desc,
      shipping_info: product.shipping_info,
      trust_badges: product.trust_badges,
      size_guide: product.size_guide,
      description_video_url: product.description_video_url || '',
      detail_product: product.detail_product || '',
      detail_images: product.detail_images || [],
      lifestyle_images: product.lifestyle_images || [],
      related_products: product.related_products?.map(p => p.id) || [],
      is_active: product.is_active,
    };


  } catch (error) {
    console.error('Failed to fetch product:', error);
    alert('Failed to load product');
    router.push('/products');
  } finally {
    loading.value = false;
  }
};

const addColor = () => {
  form.value.colors.push({ name: '', hex: '#000000', images: [] });
};

const removeColor = (index: number) => {
  form.value.colors.splice(index, 1);
};

const toggleSize = (size: string) => {
  const index = form.value.sizes.indexOf(size);
  if (index > -1) {
    form.value.sizes.splice(index, 1);
    form.value.stocks = form.value.stocks.filter(s => s.size !== size)
  } else {
    form.value.sizes.push(size);
    form.value.stocks.push({ size, stock:0 })
  }
};

const addBadge = () => {
  form.value.badges.push({ icon: '✓', text: '' });
};

const removeBadge = (index: number) => {
  form.value.badges.splice(index, 1);
};

const addShippingTier = () => {
  form.value.shipping_info.push({ tier: '', price: 0, days: '' });
};

const removeShippingTier = (index: number) => {
  form.value.shipping_info.splice(index, 1);
};

const addTrustBadge = () => {
  form.value.trust_badges.push({ icon: '🔒', text: '' });
};

const removeTrustBadge = (index: number) => {
  form.value.trust_badges.splice(index, 1);
};

const addSizeGuide = () => {
  form.value.size_guide.push({ size: '', chest: '', waist: '' });
};

const removeSizeGuide = (index: number) => {
  form.value.size_guide.splice(index, 1);
};

const handleSubmit = async () => {
  if (!form.value.name || !form.value.category || form.value.price <= 0) {
    alert('Please fill in all required fields');
    return;
  }

  if (form.value.images.length === 0) {
    alert('Please add at least one product image');
    return;
  }

  if (form.value.colors.length === 0) {
    alert('Please add at least one color');
    return;
  }

  if (form.value.sizes.length === 0) {
    alert('Please select at least one size');
    return;
  }
  if (form.value.stocks.every(s => s.stock === 0)) {
    alert('At least one size must have stock');
    return;
  }


  try {
    saving.value = true;

    console.log('Submitting form data:', form.value); 

    if (isEdit.value) {
      const response = await api.put(`/products/${route.params.id}`, form.value);
      console.log('Update response:', response.data); 
      alert('Product updated successfully');
    } else {
      const response = await api.post('/products', form.value);
      console.log('Create response:', response.data); 
      alert('Product created successfully');
    }

    router.push('/products');
  } catch (error: any) {
    console.error('Failed to save product:', error);
    console.error('Error response:', error.response); 
    
    if (error.response?.data?.errors) {
      const errors = Object.values(error.response.data.errors).flat();
      alert('Validation errors:\n' + errors.join('\n'));
    } else if (error.response?.data?.message) {
      alert('Error: ' + error.response.data.message);
    } else {
      alert('Failed to save product. Check console for details.');
    }
  } finally {
    saving.value = false;
  }
};

const categories = ref<Category[]>([])
const categoryLoading = ref(false)

const fetchCategories = async () => {
  categoryLoading.value = true
  try {
    const response = await getCategory()
    categories.value = response
  } catch (error) {
    console.error('Failed to load categories', error)
    alert('Failed to load categories')
  } finally {
    categoryLoading.value = false
  }
}

onMounted(() => {
  fetchProduct();
  fetchCategories();
});
</script>

<template>
  <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div v-if="loading" class="flex items-center justify-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
    </div>

    <form v-else @submit.prevent="handleSubmit" class="space-y-8">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-light text-white">
            {{ isEdit ? 'Edit Product' : 'Create Product' }}
          </h1>
          <p class="text-white mt-1">Fill in the product details</p>
        </div>
        <div class="flex gap-3">
          <button
            type="button"
            @click="router.push('/products')"
            class="px-6 py-3 text-sm font-medium text-white bg-zinc-900 border border-gray-300 rounded-lg hover:bg-zinc-800"
          >
            Cancel
          </button>
          <button
            type="submit"
            :disabled="saving"
            class="px-6 py-3 bg-linear-to-r from-[#aa8320] to-[#7b5902] hover:from-[#cfa73a] hover:to-[#7b5902] text-white text-sm font-medium rounded-lg disabled:opacity-50"
          >
            {{ saving ? 'Saving...' : (isEdit ? 'Update Product' : 'Create Product') }}
          </button>
        </div>
      </div>

      <!-- Basic Info -->
      <div class="bg-zinc-900 rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
        <h2 class="text-xl font-medium text-white">Basic Information</h2>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label class="block text-sm font-medium text-white mb-2">Product Name *</label>
            <input
              v-model="form.name"
              type="text"
              required
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-white mb-2">Price *</label>
            <input
              v-model.number="form.price"
              type="number"
              step="0.01"
              min="0"
              required
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
            />
          </div>
                
          <div class="md:col-span-2">
            <label class="block text-sm font-medium text-white mb-2">Category *</label>
            <select
              v-model="form.category"
              required
              class="w-full px-4 py-2 border border-gray300 rounded-lg  text-white focus:ring-2 focus:ring-black"
            >
              <option value="" disabled>
                {{  categoryLoading ? 'Loading categories...' : 'Select Category' }}
              </option>

              <option
                v-for:="cat in categories"
                :key="cat.id"
                :value="cat.name"
              >
                {{ cat.name }}
              </option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-white mb-2">Original Price</label>
            <input
              v-model.number="form.original_price"
              type="number"
              step="0.01"
              min="0"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-white mb-2">Video URL</label>
            <input
              v-model="form.video_url"
              type="url"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
            />
          </div>
        </div>

      <!-- Images -->
      <div class="bg-zinc-900 rounded-lg shadow-sm border border-gray-200 p-6">
        <FormImage
          v-model="form.images"
          title="Product Images *"
          :columns="4"
        />
      </div>

      <!-- Colors -->
      <div class="bg-zinc-900 rounded-lg shadow-sm border border-gray-200 p-6 space-y-4">
        <div class="flex items-center justify-between">
          <h2 class="text-xl font-medium text-white">Colors *</h2>
          <button
            type="button"
            @click="addColor"
            class="px-4 py-2 text-sm bg-zinc-900 border border-gray-300 rounded-lg hover:bg-zinc-800"
          >
            + Add Color
          </button>
        </div>
        <div class="space-y-4">
          <div
            v-for="(color, idx) in form.colors"
            :key="idx"
            class="p-4 border border-gray-200 rounded-lg space-y-3"
          >
            <div class="flex items-start gap-4">
              <input
                v-model="color.name"
                type="text"
                placeholder="Color name"
                required
                class="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
              />
              <input
                v-model="color.hex"
                type="color"
                required
                class="w-16 h-10 border border-gray-300 rounded-lg"
              />
              <button
                type="button"
                @click="removeColor(idx)"
                class="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg"
              >
                Remove
              </button>
            </div>
            
            <!-- Color Images using FormImage -->
            <FormImage
              v-model="color.images"
              title="Color Images"
              :columns="4"
            />
          </div>
        </div>
      </div>

      <!-- Sizes -->
      <div class="bg-zinc-900 rounded-lg shadow-sm border border-gray-200 p-6 space-y-4">
        <h2 class="text-xl font-medium text-white">Sizes *</h2>
        <div class="grid grid-cols-6 gap-3">
          <button
            v-for="size in availableSizes"
            :key="size"
            type="button"
            @click="toggleSize(size)"
            :class="[
              'py-3 rounded-lg border-2 text-sm font-medium transition-all',
              form.sizes.includes(size)
                ? 'border-[#7b5902] bg-zinc-900 text-white'
                : 'border-gray-300 hover:border-[#cfa73a]'
            ]"
          >
            {{ size }}
          </button>
        </div>
      </div>

      <!-- Stock Per Size -->
    <div
      v-if="form.stocks.length"
      class="bg-zinc-900 rounded-lg shadow-sm border border-gray-200 p-6 space-y-4"
    >
      <h2 class="text-xl font-medium text-white">Stock per Size *</h2>

      <div
        v-for="stock in form.stocks"
        :key="stock.size"
        class="flex items-center gap-4"
      >
        <div class="w-20 text-white font-medium">
          {{ stock.size }}
        </div>

        <input
          v-model.number="stock.stock"
          type="number"
          min="0"
          class="w-32 px-4 py-2 border border-gray-300 rounded-lg"
        />
      </div>
    </div>


      <!-- Badges -->
      <div class="bg-zinc-900 rounded-lg shadow-sm border border-gray-200 p-6 space-y-4">
        <div class="flex items-center justify-between">
          <h2 class="text-xl font-medium text-white">Feature Badges *</h2>
          <button
            type="button"
            @click="addBadge"
            class="px-4 py-2 text-sm bg-zinc-900 border border-gray-300 rounded-lg hover:bg-zinc-800"
          >
            + Add Badge
          </button>
        </div>
        <div class="space-y-3">
          <div
            v-for="(badge, idx) in form.badges"
            :key="idx"
            class="flex gap-3"
          >
            <input
              v-model="badge.icon"
              type="text"
              placeholder="Icon (emoji)"
              required
              class="w-20 px-4 py-2 border border-gray-300 rounded-lg"
            />
            <input
              v-model="badge.text"
              type="text"
              placeholder="Badge text"
              required
              class="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
            />
            <button
              type="button"
              @click="removeBadge(idx)"
              class="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg"
            >
              Remove
            </button>
          </div>
        </div>
      </div>

      <!-- Description & Details -->
      <div class="bg-zinc-900 rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
        <h2 class="text-xl font-medium text-white">Description & Details</h2>
        
        <div>
          <label class="block text-sm font-medium text-white mb-2">Description * (300 words)</label>
          <textarea
            v-model="form.description"
            rows="6"
            required
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-white mb-2">Description Video URL</label>
          <input
            v-model="form.description_video_url"
            type="url"
            placeholder="https://example.com"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg"
          />
        </div>
      </div>

      <!-- Shipping & Trust -->
      <div class="bg-zinc-900 rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
        <h2 class="text-xl font-medium text-white">Shipping & Trust Badges</h2>
        
        <div>
          <div class="flex items-center justify-between mb-3">
            <label class="text-sm font-medium text-white">Shipping Tiers *</label>
            <button
              type="button"
              @click="addShippingTier"
              class="text-sm text-white underline"
            >
              + Add Tier
            </button>
          </div>
          <div class="space-y-2">
            <div
              v-for="(tier, idx) in form.shipping_info"
              :key="idx"
              class="flex gap-3"
            >
              <input
                v-model="tier.tier"
                type="text"
                placeholder="Tier name"
                required
                class="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
              />
              <input
                v-model.number="tier.price"
                type="number"
                step="0.01"
                placeholder="Price"
                required
                class="w-24 px-4 py-2 border border-gray-300 rounded-lg"
              />
              <input
                v-model="tier.days"
                type="text"
                placeholder="3-5"
                required
                class="w-24 px-4 py-2 border border-gray-300 rounded-lg"
              />
              <button
                type="button"
                @click="removeShippingTier(idx)"
                class="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg"
              >
                Remove
              </button>
            </div>
          </div>
        </div>

        <!-- Trust Badges -->
        <div>
          <div class="flex items-center justify-between mb-3">
            <label class="text-sm font-medium text-white">Trust Badges *</label>
            <button
              type="button"
              @click="addTrustBadge"
              class="text-sm text-white underline"
            >
              + Add Badge
            </button>
          </div>
          <div class="space-y-2">
            <div
              v-for="(badge, idx) in form.trust_badges"
              :key="idx"
              class="flex gap-3"
            >
              <input
                v-model="badge.icon"
                type="text"
                placeholder="Icon"
                required
                class="w-20 px-4 py-2 border border-gray-300 rounded-lg"
              />
              <input
                v-model="badge.text"
                type="text"
                placeholder="Badge text"
                required
                class="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
              />
              <button
                type="button"
                @click="removeTrustBadge(idx)"
                class="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Size Guide -->
      <div class="bg-zinc-900 rounded-lg shadow-sm border border-gray-200 p-6 space-y-4">
        <div class="flex items-center justify-between">
          <h2 class="text-xl font-medium text-white">Size Guide *</h2>
          <button
            type="button"
            @click="addSizeGuide"
            class="px-4 py-2 text-sm bg-zinc-900 border border-gray-300 rounded-lg hover:bg-zinc-800"
          >
            + Add Size
          </button>
        </div>
        <div class="space-y-2">
          <div
            v-for="(guide, idx) in form.size_guide"
            :key="idx"
            class="flex gap-3"
          >
            <input
              v-model="guide.size"
              type="text"
              placeholder="Size"
              required
              class="w-24 px-4 py-2 border border-gray-300 rounded-lg"
            />
            <input
              v-model="guide.chest"
              type="text"
              placeholder="Chest"
              required
              class="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
            />
            <input
              v-model="guide.waist"
              type="text"
              placeholder="Waist"
              required
              class="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
            />
            <button
              type="button"
              @click="removeSizeGuide(idx)"
              class="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg"
            >
              Remove
            </button>
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-white mb-2">Size Guide Description *</label>
          <textarea
            v-model="form.size_guide_desc"
            rows="3"
            required
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
          />
        </div>
      </div>

      <!-- Detail Product -->
      <div class="bg-zinc-900 rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
        <h2 class="text-xl font-medium text-white">Detail Product</h2>
        <div>
          <label class="block text-sm font-medium text-white mb-2">Detail Product</label>
          <textarea
            v-model="form.detail_product"
            rows="4"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg"
          />
        </div>
      </div>

      <!-- Detail Images -->
      <div class="bg-zinc-900 rounded-lg shadow-sm border border-gray-200 p-6">
        <FormImage
          v-model="form.detail_images"
          title="Detail Images"
          :columns="3"
          :withCaption="true"
        />
      </div>

      <!-- Lifestyle Images -->
      <div class="bg-zinc-900 rounded-lg shadow-sm border border-gray-200 p-6">
        <FormImage
          v-model="form.lifestyle_images"
          title="Lifestyle Gallery"
          :columns="6"
        />
      </div>
      <div>
          <label class="flex items-center gap-2">
            <input
              v-model="form.is_active"
              type="checkbox"
              class="rounded border-gray-300 text-black focus:ring-black"
            />
            <span class="text-sm font-medium text-white">Active (visible to customers)</span>
          </label>
        </div>
      </div>

      <!-- Submit Buttons -->
      <div class="flex justify-end gap-3">
        <button
          type="button"
          @click="router.push('/products')"
          class="px-6 py-3 text-sm font-medium text-white bg-zinc-900 border border-gray-300 rounded-lg hover:bg-zinc-800"
        >
          Cancel
        </button>
        <button
          type="submit"
          :disabled="saving"
          class="px-6 py-3 bg-linear-to-r from-[#aa8320] to-[#7b5902] hover:from-[#cfa73a] hover:to-[#7b5902] text-white text-sm font-medium rounded-lg disabled:opacity-50"
        >
          {{ saving ? 'Saving...' : (isEdit ? 'Update Product' : 'Create Product') }}
        </button>
      </div>
    </form>
  </div>
</template>