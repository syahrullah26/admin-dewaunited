<script setup lang="ts">
import { ref } from 'vue'

type ImageValue = string | { url: string; caption?: string }

const props = defineProps<{
  modelValue: ImageValue[]
  title?: string
  withCaption?: boolean
  columns?: number
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: ImageValue[]): void
}>()

const newUrl = ref('')
const newCaption = ref('')
const preview = ref<string | null>(null)

const addImage = () => {
  if (!newUrl.value) return

  const item = props.withCaption
    ? { url: newUrl.value, caption: newCaption.value }
    : newUrl.value

  emit('update:modelValue', [...props.modelValue, item])

  newUrl.value = ''
  newCaption.value = ''
}

const removeImage = (idx: number) => {
  const copy = [...props.modelValue]
  copy.splice(idx, 1)
  emit('update:modelValue', copy)
}

const getUrl = (img: ImageValue) =>
  typeof img === 'string' ? img : img.url
</script>

<template>
  <div class="space-y-4">
    <h3 v-if="title" class="text-lg font-medium text-white">
      {{ title }}
    </h3>

    <div
      class="grid gap-4"
      :class="`grid-cols-${columns ?? 4}`"
    >
      <div
        v-for="(img, idx) in modelValue"
        :key="idx"
        class="relative aspect-square rounded-lg overflow-hidden border group"
      >
        <img
          :src="getUrl(img)"
          class="w-full h-full object-cover cursor-pointer"
          @click="preview = getUrl(img)"
        />

        <button
          type="button"
          @click="removeImage(idx)"
          class="absolute top-2 right-2 bg-red-600 text-white p-1.5 rounded-full
                 opacity-0 group-hover:opacity-100 transition"
        >
          ✕
        </button>
      </div>
    </div>

    <div class="flex gap-3">
      <input
        v-model="newUrl"
        type="url"
        placeholder="Image URL"
        class="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
      />

      <input
        v-if="withCaption"
        v-model="newCaption"
        type="text"
        placeholder="Caption"
        class="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
      />

      <button
        type="button"
        @click="addImage"
        :disabled="!newUrl"
        class="px-4 py-2 border rounded-lg hover:bg-zinc-800
               disabled:opacity-50"
      >
        Add
      </button>
    </div>

    <div
      v-if="preview"
      class="fixed inset-0 bg-black/70 z-50 flex items-center justify-center"
      @click="preview = null"
    >
      <img
        :src="preview"
        class="max-w-[90%] max-h-[90%] rounded-lg"
      />
    </div>
  </div>
</template>
