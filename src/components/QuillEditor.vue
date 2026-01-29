<script setup lang="ts">
import { QuillEditor } from '@vueup/vue-quill'
import '@vueup/vue-quill/dist/vue-quill.snow.css'

interface Props {
  modelValue: string
}

interface Emits {
  (e: 'update:modelValue', value: string): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const handleUpdate = (content: string) => {
  emit('update:modelValue', content)
}

const toolbarOptions = [
  [{ 'header': [1, 2, 3, false] }],
  ['bold', 'italic', 'underline', 'strike'],
  [{ 'list': 'ordered'}, { 'list': 'bullet' }],
  [{ 'indent': '-1'}, { 'indent': '+1' }],
  ['blockquote', 'code-block'],
  [{ 'color': [] }, { 'background': [] }],
  [{ 'align': [] }],
  ['link', 'image'],
  ['clean']
]
</script>

<template>
  <div class="quill-wrapper">
    <QuillEditor
      :content="modelValue"
      contentType="html"
      theme="snow"
      :toolbar="toolbarOptions"
      @update:content="handleUpdate"
      :style="{ minHeight: '400px' }"
    />
  </div>
</template>

<style>
/* Quill Editor Custom Styles */
.quill-wrapper {
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  overflow: hidden;
}

.ql-toolbar.ql-snow {
  background-color: #27272a;
  border: none;
  border-bottom: 1px solid #3f3f46;
  padding: 12px;
}

.ql-container.ql-snow {
  border: none;
  background-color: #18181b;
  font-size: 16px;
  min-height: 400px;
}

.ql-editor {
  color: #fafafa;
  min-height: 400px;
  padding: 20px;
}

.ql-editor.ql-blank::before {
  color: #71717a;
  font-style: normal;
}

/* Toolbar buttons */
.ql-toolbar.ql-snow .ql-stroke {
  stroke: #fafafa;
}

.ql-toolbar.ql-snow .ql-fill {
  fill: #fafafa;
}

.ql-toolbar.ql-snow .ql-picker-label {
  color: #fafafa;
}

.ql-toolbar.ql-snow button:hover,
.ql-toolbar.ql-snow button:focus {
  background-color: #3f3f46;
  border-radius: 4px;
}

.ql-toolbar.ql-snow button.ql-active {
  background-color: #d4af37;
  border-radius: 4px;
}

.ql-toolbar.ql-snow .ql-picker-label:hover,
.ql-toolbar.ql-snow .ql-picker-label.ql-active {
  color: #d4af37;
}

/* Dropdown */
.ql-snow .ql-picker.ql-expanded .ql-picker-label {
  border-color: #d4af37;
}

.ql-snow .ql-picker-options {
  background-color: #27272a;
  border: 1px solid #3f3f46;
  color: #fafafa;
}

.ql-snow .ql-picker-item:hover {
  background-color: #3f3f46;
  color: #d4af37;
}

/* Content Styles */
.ql-editor h1 {
  font-size: 2em;
  font-weight: bold;
  margin-top: 1em;
  margin-bottom: 0.5em;
  color: #fafafa;
}

.ql-editor h2 {
  font-size: 1.5em;
  font-weight: bold;
  margin-top: 0.8em;
  margin-bottom: 0.4em;
  color: #fafafa;
}

.ql-editor h3 {
  font-size: 1.25em;
  font-weight: 600;
  margin-top: 0.6em;
  margin-bottom: 0.3em;
  color: #fafafa;
}

.ql-editor ul,
.ql-editor ol {
  padding-left: 1.5em;
}

.ql-editor blockquote {
  border-left: 4px solid #d4af37;
  padding-left: 16px;
  margin-left: 0;
  color: #a1a1aa;
  font-style: italic;
}

.ql-editor pre {
  background-color: #09090b;
  color: #fafafa;
  padding: 16px;
  border-radius: 8px;
  overflow-x: auto;
}

.ql-editor code {
  background-color: #27272a;
  padding: 2px 6px;
  border-radius: 4px;
  color: #fafafa;
}

.ql-editor a {
  color: #d4af37;
  text-decoration: underline;
}

.ql-editor img {
  max-width: 100%;
  height: auto;
  border-radius: 8px;
  margin: 1em 0;
}

/* Scrollbar */
.ql-editor::-webkit-scrollbar {
  width: 8px;
}

.ql-editor::-webkit-scrollbar-track {
  background: #27272a;
}

.ql-editor::-webkit-scrollbar-thumb {
  background: #52525b;
  border-radius: 4px;
}

.ql-editor::-webkit-scrollbar-thumb:hover {
  background: #71717a;
}
</style>