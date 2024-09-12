<template>
  <codemirror style="height: 100%" v-model="codeValue" :placeholder="placeholder"
    :style="{ height: '100%', minHeight: '20rem' }" :autofocus="true" :indent-with-tab="true" :tab-size="2"
    :extensions="extensions" @ready="handleReady" />
</template>

<script lang="ts" setup>
import { computed, defineComponent, onBeforeMount, ref, shallowRef, watch } from 'vue'
import { Codemirror } from 'vue-codemirror'
import { javascript } from '@codemirror/lang-javascript'
import { python } from '@codemirror/lang-python'
import { vue } from '@codemirror/lang-vue'
import { css } from '@codemirror/lang-css'
import { oneDark } from '@codemirror/theme-one-dark'


const JsExtensions = [javascript(), oneDark]
const pyExtensions = [python(), oneDark]
const vueExtensions = [vue(), oneDark]
const cssExtensions = [css(), oneDark]
const extensionsMap = {
  css: cssExtensions,
  javascript: JsExtensions,
  vue: vueExtensions,
  python: pyExtensions,
}
const defaultCode = {
  javascript: `{
  props:["inputs","outputs"],
  emits:["update:input"],
  data(){
    return {msg:'hello'}
  },
  mounted(){
  }
}
  `,
  vue: "<div></div>",
  python: "",
  css: `.class-name{
  color:white;
}`,
}
const extensions = computed(() => {
  return extensionsMap[props.lang]
})
const props = defineProps<{ lang: 'css' | 'javascript' | 'vue' | "python", placeholder?: string, default?: string, modelValue?: string }>()
// Codemirror EditorView instance ref
const view = shallowRef()
const handleReady = (payload) => {
  view.value = payload.view
}

// Status is available at all times via Codemirror EditorView
const getCodemirrorStates = () => {
  const state = view.value.state
  const ranges = state.selection.ranges
  const selected = ranges.reduce((r, range) => r + range.to - range.from, 0)
  const cursor = ranges[0].anchor
  const length = state.doc.length
  const lines = state.doc.lines
  // more state info ...
  // return ...
}
const emit = defineEmits(['update:modelValue', 'change'])

const codeValue = computed({
  get() {
    if (!props.modelValue) {
      emit("update:modelValue", props.default || defaultCode[props.lang]);
      return props.default || defaultCode[props.lang]
    }

    return props.modelValue;
  },
  set(newVal) {
    emit("update:modelValue", newVal);
    emit("change", newVal);
  }
});


onBeforeMount(() => {

})
const log = console.log
</script>