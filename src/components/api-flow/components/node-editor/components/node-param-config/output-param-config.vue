<script setup lang="ts">
import inputParamComp from "@/components/api-flow/components/param-input-bar/input-param/index.vue"
import { Delete, Edit, Plus } from "@element-plus/icons-vue";
import type { Node, Output, Param } from "@/components/api-flow/engine/types";
import { computed, ref } from "vue";
import { generateID } from "@/components/api-flow/common-utils";



const emit = defineEmits(['update:outputs'])
const props = defineProps<{ outputs: Output[] }>()
const addDialogVisible = ref(false)



const editParam = ref<Output>({ key: "", config: { type: 'string' }, name: "" })
const paramConfigMap: { [key: string]: { [key: string]: Param } } = {
  string: {},
  integer: {},
  enum: { options: { name: '选项', config: { type: 'option' } } },
  custom: { name: { name: '自定义类型名称', config: { type: 'string' } } }
}

function showEditDialog(row: Output) {
  editParam.value = row
  addDialogVisible.value = true
}




function addNewParam() {
  props.outputs.push({ key: generateID(), name: "name", config: { type: 'string', config: {} } })
}



function getEditParamConfigValue(key) {
  if (!editParam.value.config.config) {
    editParam.value.config.config = {}
  }
  return editParam.value.config.config![key]
}

function setEditParamConfigValue(key, newValue) {
  if (!editParam.value.config.config) {
    editParam.value.config.config = {}
  }
  editParam.value.config.config![key] = newValue
}

</script>

<template>
  <div class="h-full flex flex-col">
    <div class="flex-1 overflow-auto">
      <el-table :data="outputs"
        style="--el-table-header-bg-color: #32333b9e;height: 100%;--el-table-tr-bg-color:rgba(0,0,0,0)">
        <el-table-column label="键值" align="center" prop="key">
          <template #default="scope">
            <el-input size="small" v-model="scope.row.key" />
          </template>
        </el-table-column>
        <el-table-column label="名称" align="center" prop="name">
          <template #default="scope">
            <el-input size="small" v-model="scope.row.name" />
          </template>
        </el-table-column>
        <el-table-column label="类型" align="center" prop="type">
          <template #default="scope">
            <input-param-comp ctx=""
              :param="{ name: '类型', config: { type: 'enum', config: { options: ['string', 'integer', 'float', 'enum', 'boolean', 'custom', 'any'] } } }"
              @update:model-value="(newVal) => { if (!scope.row.config) { scope.row.config = {} }; scope.row.config.type = newVal }"
              :model-value="scope.row.config?.type" />
          </template>
        </el-table-column>
        <!--      <el-table-column label="默认值" align="center" prop="defaultValue">-->
        <!--        <template #default="scope">-->
        <!--          <input-param-comp ctx="" :param="scope.row"-->
        <!--                            @update:model-value="(newVal)=>{editParam.defaultValue=newVal}"-->
        <!--                            :model-value="editParam.defaultValue"></input-param-comp>-->
        <!--        </template>-->
        <!--      </el-table-column>-->
        <el-table-column label="操作" align="center">
          <template #default="scope">
            <div class="flex justify-center items-center">
              <el-button size="small" :icon="Edit as any" circle @click="() => showEditDialog(scope.row)" />
              <el-popconfirm title="确认删除?" @confirm="() => { props.outputs.splice(props.outputs.indexOf(scope.row), 1) }">
                <template #reference>
                  <el-button size="small" :icon="Delete as any" circle />
                </template>
              </el-popconfirm>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <div class="flex-c p-2">
      <el-button size="small" :icon="Plus as any" @click="addNewParam" />
    </div>
    <el-dialog :append-to-body="true" :title="editParam.name ? (editParam.name + '-参数类型编辑') : '参数类型编辑'"
      v-model="addDialogVisible" style="width: 27rem;border-radius: 0.75rem">

      <el-form class="mx-10 mt-2">
        <el-form-item :label="item.name" v-for="(item, key) in paramConfigMap[editParam.config.type]">
          <input-param-comp ctx="" :param="item" :model-value="getEditParamConfigValue(key)"
            @update:model-value="(newVal) => setEditParamConfigValue(key, newVal)" />
        </el-form-item>
        <el-form-item label="描述">
          <input-param-comp ctx="" :param="{ name: '描述', config: { type: 'string', config: { type: 'textarea' } } }"
            @update:model-value="(newVal) => { editParam.des = newVal }" :model-value="editParam.des"></input-param-comp>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="flex">
          <el-button class="ml-auto" type="primary" size="small" @click="addDialogVisible = false">确定</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped lang="scss"></style>