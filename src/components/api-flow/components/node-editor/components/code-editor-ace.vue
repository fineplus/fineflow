<template>
  <v-ace-editor
      v-model:value="codeValue"
      :lang="(lang=='vue'?'html':lang)||'html'"
      theme="dracula"
      :placeholder="placeholder"
      :style="{ height: '100%' ,minHeight:'20rem'}"
  />
</template>

<script lang="ts" setup>
import { VAceEditor } from './ace-editor';
import {computed, defineComponent, onBeforeMount, ref, shallowRef, watch} from 'vue'

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

const props = defineProps<{ lang: 'css' | 'javascript' | 'vue' | "python", placeholder?: string,default?:string, modelValue: string }>()
// Codemirror EditorView instance ref
const view = shallowRef()
const handleReady = (payload) => {
  view.value = payload.view
}


const emit = defineEmits(['update:modelValue', 'change'])

const codeValue = computed({
  get() {
    if (!props.modelValue) {
      emit("update:modelValue", props.default||defaultCode[props.lang]);
      return props.default||defaultCode[props.lang]
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
<style>
.ace_scroller.ace_scroll-left:after{
  box-shadow: none !important;
}
.ace_print-margin{
  background: none!important;
}
</style>