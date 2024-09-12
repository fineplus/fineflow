<template>
  <div class="flex flex-col  h-40">
    <div class="flex-1 overflow-auto">
      <div class="h-full">
        <el-table border style="height: 100%" :data="value">
          <el-table-column align="center" label="名称">
            <template #default="scope">
              <el-input size="small" v-model="scope.row.name"></el-input>
            </template>
          </el-table-column>
          <el-table-column align="center" label="值">
            <template #default="scope">
              <el-input size="small" v-if="valueType == 'string'" v-model="scope.row.value"></el-input>
              <el-input-number :controls="false" precision="0" size="small" v-else-if="valueType == 'integer'"
                v-model="scope.row.value"></el-input-number>
              <el-input-number :controls="false" size="small" v-else v-model="scope.row.value"></el-input-number>
            </template>
          </el-table-column>
          <el-table-column label="操作">
            <template #default="scope">
              <el-button size="small" :icon="Delete" circle
                @click="() => { value.splice(value.indexOf(scope.row), 1); setValue() }" />
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
    <div class="flex justify-center items-center mt-2">
      <el-button size="small" :icon="Plus" circle
        @click="() => { value.push({ name: 'name', value: defaultValue[valueType] }); setValue() }" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { OptionParamConfig } from "../../../engine/param-types";
import { Delete, Edit, Plus } from "@element-plus/icons-vue";

const props = defineProps<{ param: OptionParamConfig; modelValue: any, size?: "small" | "default" | 'large', disabled?: boolean }>();
const emit = defineEmits(["update:modelValue", "change"]);
const defaultValue = { string: '', integer: 0, float: 0 }
const valueType = computed((() => {
  if (props.param.config) {
    return props.param.config.valueType
  }
  return 'string'
}))
const value = computed({
  get() {
    if (!props.modelValue) {
      const et = []
      emit("update:modelValue", et);
      return et
    }
    return props.modelValue;
  },
  set(newVal) {
    emit("update:modelValue", newVal);
    emit("change", newVal);
  }
});

function setValue() {
  const temp = value.value
  value.value = temp
}
</script>
