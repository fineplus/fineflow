<template>
  <div class="flex flex-col h-full">
    <div class="flex-1">
      <el-form :model="systemConfigStore.value" label-position="top" label-width="auto" style="max-width: 600px">
        <el-form-item label="自定义系统python服务地址">
          <el-input size="small" v-model="systemConfigStore.value.customPyFuncHref"
                    placeholder="http://127.0.0.1:8083/py/func"/>
        </el-form-item>
      </el-form>
    </div>
    <div class="flex">
      <el-button @click="updateSystemConfig" size="small" class="ml-auto" type="primary">
        保存
      </el-button>
    </div>
  </div>

</template>
<script setup lang="ts">
import {onMounted, ref} from "vue";
import type {SystemConfig} from "@/components/api-flow/engine/types";
import {api} from "@/api/api";
import {getSystemConfig, systemConfigStore,updateSystemConfig} from "@/components/api-flow/engine/store";
import {ElMessage} from "element-plus";
import {allDb} from "@/utils/loadDb";




onMounted( () => {
  getSystemConfig()
})
</script>
<style scoped lang="scss">

</style>