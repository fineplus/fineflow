<script setup lang="ts">
import CodeEditor from "@/components/api-flow/components/node-editor/components/code-editor.vue";
import { computed, ref } from "vue";
import type { Func, Node } from "@/components/api-flow/engine/types";
const props = defineProps<{ node?: Node, function: Func }>()
const emits = defineEmits(['function:update'])
const value = computed({
  get() {
    return props.function
  }, set(newVal) {
    emits('function:update', newVal)
  }
})

const codeDefaultMap = ref({
  python: `def func(params):
  return params `,
  javascript: `function func(params){
  return params
}`
})

const codeDefault = computed(() => {
  return codeDefaultMap.value[value.value.lang]
})

function makeTemplate() {
  value.value.code = codeDefault.value
}


</script>

<template>
  <div class="flex flex-col h-full">
    <code-editor class="flex-1" :lang="value.lang" v-model="value.code" :default="codeDefault" placeholder="" />
    <div class="mt-2 mx-2">
      <span class="opacity-80" style="font-size: 0.9rem">{{$t('nodeEditor.programming_language')}}:</span>
      <el-select class="mx-2" size="small" :placeholder="$t('nodeEditor.select_language')" v-model="value.lang">
        <el-option v-for="item in ['python', 'javascript']" :label="item" :value="item" :key="item"></el-option>
      </el-select>
      <el-popconfirm :title="$t('nodeEditor.replace_code_confirm')" @confirm="makeTemplate">
        <template #reference>
          <el-button size="small">{{$t('nodeEditor.generate_template_code')}}</el-button>
        </template>
      </el-popconfirm>
    </div>
  </div>
</template>

<style scoped lang="scss"></style>