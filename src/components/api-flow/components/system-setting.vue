<template>
  <div class="flex flex-col h-full">
    <div class="flex-1">
      <el-form :model="systemConfigStore.value" label-position="top" label-width="auto" style="max-width: 600px">
        <el-form-item :label="$t('words.custom_python_service_address')">
          <el-input size="small" v-model="systemConfigStore.value.customPyFuncHref"
                    placeholder="http://127.0.0.1:8083/py/func"/>
        </el-form-item>
      </el-form>
      <el-form :model="systemConfigStore.value" label-position="top" label-width="auto" style="max-width: 600px">
        <el-form-item label="lang">
          <el-select v-model="$i18n.locale" @change="setLocale"  size="small">
            <el-option v-for="locale in $i18n.availableLocales" :key="`locale-${locale}`" :value="locale">{{ locale }}</el-option>
          </el-select>
        </el-form-item>
      </el-form>
    </div>
    <div class="flex">
      <el-button @click="updateSystemConfig" size="small" class="ml-auto" type="primary">
        {{ $t('words.save') }}
      </el-button>
    </div>
  </div>

</template>
<script setup lang="ts">
import {onMounted, ref} from "vue";
import {getSystemConfig, systemConfigStore,updateSystemConfig} from "@/components/api-flow/engine/store";

function setLocale(val){
  localStorage.setItem('locale',val)
}



onMounted( () => {
  getSystemConfig()
})
</script>
<style scoped lang="scss">

</style>