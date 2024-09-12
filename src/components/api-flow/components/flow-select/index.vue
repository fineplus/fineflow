<template>
  <div class="flow-select-box flex flex-col" ref="flowSelectRef" @contextmenu.prevent>
    <div class="title-text">{{$t('nodeFlowSelect.flows')}}</div>
    <div class="flow-search-box " style="--el-border-color: rgba(0,0,0,0);--el-fill-color-blank: #333340">
      <el-input :prefix-icon="Search as any" v-model="searchWord" style="height: 26px;width: auto" clearable
        :placeholder="$t('nodeFlowSelect.search_flow')"></el-input>
    </div>
    <div class="flow-tree flex-1 overflow-y-auto custom-scrollbar">
      <div v-for="mod in flowTreeFilter">
        <div>
          <div class="mod-item__name" @click="() => clickMod(mod.id)"
            @contextmenu.prevent="(e) => { onModRightClick(e, mod.id!) }">
            <span>{{ mod.name }}</span>
            <el-icon class="ml-auto mr-2">
              <ArrowDown v-if="openModIdList.includes(mod.id)"></ArrowDown>
              <ArrowRight v-else></ArrowRight>
            </el-icon>
          </div>
          <div class="category-items" v-if="openModIdList.includes(mod.id)">
            <div v-if="mod.child.length" class="pt-[1px] px-[1px] flex flex-col gap-[1px] ">
              <div v-for="category in mod.child">
                <div class="category-item__name" @click="() => clickCategory(category.id)"
                  @contextmenu.prevent="(e) => { onCategoryRightClick(e, category.id!) }">
                  <div class=" w-1 mr-2" style="background: rgb(118 125 137)">&nbsp;</div>
                  <span>{{ category.name }}</span>
                  <el-icon class="ml-auto mr-2" style="font-size: 0.8rem;">
                    <ArrowDown v-if="openCategoryIdList.includes(category.id)"></ArrowDown>
                    <ArrowRight v-else></ArrowRight>
                  </el-icon>
                </div>
                <div v-if="openCategoryIdList.includes(category.id)" style="background: rgb(42,42,50)">
                  <div v-if="category.child?.length" class="w-full flex flex-col gap-1  pt-1 pb-0.5 pl-1.5 pr-0.5 ">
                    <div class="flow-item__name flex items-center" :draggable="true"
                      @dragend="(e) => { onFlowDragEnd(e, flowItem.key!) }"
                      @dragstart="(e) => { onFlowDragStart(e, flowItem.key!) }"
                      @contextmenu.prevent="(e) => { onFlowRightClick(e, flowItem.key!) }"
                      v-for="flowItem in category.child">
                      <div class="w-1 mr-3 my-0.5 ml-1.5" style="background: rgb(183,183,183)">&nbsp;</div>
                      <span class="py-0.5 flex-1">{{ flowItem.name }}</span>
                      <el-icon class="ml-auto mr-2">
                        <Expand />
                      </el-icon>
                    </div>
                  </div>
                  <div v-else class="flex-c p-1"
                    style="font-size: 0.8rem;opacity: 0.8;background: #1e1f24;color: rgba(137,137,137,0.7)">
                    <div class="w-full h-[1px] border-[1px] opacity-20"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
    <div class="flex-c py-4 opacity-80">
      <el-button :color="'#31303f'" size="small" @click="showFlowAdd">{{$t('nodeFlowSelect.add_flow')}}</el-button>
    </div>
    <el-dialog v-model="flowAddDialogVisible" :title="$t('nodeFlowSelect.add_flow')" style="width: 28rem">
      <div class="ml-10">
        <el-form>
          <el-form-item :label="$t('nodeFlowSelect.belong_mod')">
            <el-select size="small" v-model="flowAddTemp.modNameFlowId" :placeholder="$t('nodeFlowSelect.please_select')"
              @change="() => flowAddTemp.categoryNameFlowId = null">
              <el-option v-for="item in modOptions" :key="item.id" :label="item.name" :value="item.id"></el-option>
            </el-select>
            <el-button size="small" class="ml-4" @click="showModAdd">{{$t('words.add')}}</el-button>
          </el-form-item>
          <el-form-item :label="$t('nodeFlowSelect.belong_category')">
            <el-select size="small" :placeholder="$t('nodeFlowSelect.please_select')" v-model="flowAddTemp.categoryNameFlowId">
              <el-option v-for="item in categoryOptions" :key="item.id" :label="item.name" :value="item.id"></el-option>
            </el-select>
            <el-button size="small" class="ml-4" @click="showCategoryAdd">{{$t('words.add')}}</el-button>
          </el-form-item>
          <el-form-item :label="$t('nodeFlowSelect.flow_name')">
            <el-input v-model="flowAddTemp.name" size="small" :placeholder="$t('nodeFlowSelect.please_input')" style="width: 10.75rem"></el-input>
          </el-form-item>
        </el-form>

      </div>
      <template #footer>
        <div>
          <el-button size="small" @click="flowAddDialogVisible = false">{{$t('words.cancel')}}</el-button>
          <el-button size="small" type="primary" @click="gotoFlowEdit">{{$t('words.confirm')}}</el-button>
        </div>
      </template>
    </el-dialog>
    <el-dialog v-model="newEditFlowAddDialogVisible" :title="$t('nodeFlowSelect.add_flow')" style="width: 28rem">
      <div class="ml-10">
        <el-form>
          <el-form-item :label="$t('nodeFlowSelect.belong_mod')">
            <el-select size="small" v-model="flowAddTemp.modNameFlowId" :placeholder="$t('nodeFlowSelect.please_select')"
              @change="() => flowAddTemp.categoryNameFlowId = null">
              <el-option v-for="item in modOptions" :key="item.id" :label="item.name" :value="item.id"></el-option>
            </el-select>
            <el-button size="small" class="ml-4" @click="showModAdd">{{$t('words.add')}}</el-button>
          </el-form-item>
          <el-form-item :label="$t('nodeFlowSelect.belong_category')">
            <el-select size="small" :placeholder="$t('nodeFlowSelect.please_select')" v-model="flowAddTemp.categoryNameFlowId">
              <el-option v-for="item in categoryOptions" :key="item.id" :label="item.name" :value="item.id"></el-option>
            </el-select>
            <el-button size="small" class="ml-4" @click="showCategoryAdd">{{$t('words.add')}}</el-button>
          </el-form-item>
          <el-form-item :label="$t('nodeFlowSelect.flow_name')">
            <el-input v-model="flowAddTemp.name" size="small" :placeholder="$t('nodeFlowSelect.please_input')" style="width: 10.75rem"></el-input>
          </el-form-item>
        </el-form>

      </div>
      <template #footer>
        <div>
          <el-button size="small" @click="newEditFlowAddDialogVisible = false">{{$t('words.cancel')}}</el-button>
          <el-button size="small" type="primary" @click="newEditFlowAddSave">{{$t('words.confirm')}}</el-button>
        </div>
      </template>
    </el-dialog>
    <el-dialog v-model="categoryAddVisible" :title="$t('nodeFlowSelect.add_category')" style="width: 28rem">
      <div class="ml-10">
        <el-form>
          <el-form-item :label="$t('nodeFlowSelect.belong_mod')">
            <el-select size="small" :placeholder="$t('nodeFlowSelect.please_select')" v-model="categoryAddTemp.modNameFlowId">
              <el-option v-for="item in modOptions" :key="item.id" :label="item.name" :value="item.id"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item :label="$t('nodeFlowSelect.category_name')">
            <el-input size="small" v-model.trim="categoryAddTemp.name" :placeholder="$t('nodeFlowSelect.please_input')"
              style="width: 10.75rem"></el-input>
          </el-form-item>
        </el-form>

      </div>
      <template #footer>
        <div>
          <el-button size="small" @click="categoryAddVisible = false">{{$t('words.cancel')}}</el-button>
          <el-button size="small" type="primary" @click="saveCategoryAdd">{{$t('words.confirm')}}</el-button>
        </div>
      </template>
    </el-dialog>
    <el-dialog v-model="categoryEditVisible" :title="$t('nodeFlowSelect.category_edit')" style="width: 28rem">
      <div class="ml-10">
        <el-form>
          <!--          <el-form-item label="所属模块">-->
          <!--            <el-select size="small" placeholder="请选择" v-model="categoryAddTemp.modNameFlowId">-->
          <!--              <el-option v-for="item in modOptions" :key="item.id" :label="item.name" :value="item.id"></el-option>-->
          <!--            </el-select>-->
          <!--          </el-form-item>-->
          <el-form-item :label="$t('nodeFlowSelect.category_name')">
            <el-input size="small" v-model.trim="categoryEditTemp.name" :placeholder="$t('nodeFlowSelect.please_input')"
              style="width: 10.75rem"></el-input>
          </el-form-item>
        </el-form>

      </div>
      <template #footer>
        <div>
          <el-button size="small" @click="categoryEditVisible = false">{{$t('words.cancel')}}</el-button>
          <el-button size="small" type="primary" @click="saveCategoryEdit">{{$t('words.confirm')}}</el-button>
        </div>
      </template>
    </el-dialog>
    <el-dialog v-model="modEditVisible" :title="$t('nodeFlowSelect.edit_mod')" style="width: 28rem">
      <div class="ml-10">
        <el-form>
          <el-form-item :label="$t('nodeFlowSelect.mod_name')">
            <el-input size="small" v-model.trim="modEditTemp.name" :placeholder="$t('nodeFlowSelect.please_input')" style="width: 10.75rem"></el-input>
          </el-form-item>
        </el-form>

      </div>
      <template #footer>
        <div>
          <el-button size="small" @click="modEditVisible = false">{{$t('words.cancel')}}</el-button>
          <el-button size="small" type="primary" @click="saveModEdit">{{$t('words.confirm')}}</el-button>
        </div>
      </template>
    </el-dialog>
    <el-dialog v-model="modAddDialogVisible" :title="$t('nodeFlowSelect.add_mod')" style="width: 28rem">
      <div class="ml-10">
        <el-form>
          <el-form-item :label="$t('nodeFlowSelect.mod_name')">
            <el-input size="small" v-model.trim="modAddNameTemp" :placeholder="$t('nodeFlowSelect.please_input')" style="width: 10.75rem"></el-input>
          </el-form-item>
        </el-form>
      </div>
      <template #footer>
        <div>
          <el-button size="small" @click="modAddDialogVisible = false">{{$t('words.cancel')}}</el-button>
          <el-button size="small" @click="saveModAdd" type="primary">{{$t('words.confirm')}}</el-button>
        </div>
      </template>
    </el-dialog>

    <div class="fixed rounded overflow-hidden shadow-xl float-menu" @mouseleave="() => floatMenu.visible = false"
      v-if="floatMenu.visible" :style="{ top: floatMenu.top, left: floatMenu.left }">
      <div v-if="floatMenu.type === 'flowConfig'">
        <div>
          {{$t('nodeFlowSelect.flow_menu')}}
        </div>
        <!--        <div class="float-menu-item float-menu-item-border"-->
        <!--             @click="showFlowEdit">编辑-->
        <!--        </div>-->
        <div @click="openFlow">{{$t('words.open')}}
        </div>
        <div @click="showFlowDelete">{{$t('words.delete')}}
        </div>
        <div @click="floatMenu.visible = false">{{$t('words.cancel')}}
        </div>
      </div>
      <div v-if="floatMenu.type === 'categoryConfig'">
        <div>
          {{$t('nodeFlowSelect.category_menu')}}
        </div>
        <div @click="showCategoryEdit">{{$t('words.edit')}}
        </div>
        <div @click="showCategoryDelete">{{$t('words.delete')}}
        </div>
        <div @click="floatMenu.visible = false">{{$t('words.cancel')}}
        </div>
      </div>
      <div v-if="floatMenu.type === 'modConfig'">
        <div>
          {{$t('nodeFlowSelect.mod_menu')}}
        </div>
        <div @click="showModEdit">{{$t('words.edit')}}
        </div>
        <div @click="showModDelete">{{$t('words.delete')}}
        </div>
        <div @click="floatMenu.visible = false">{{$t('words.cancel')}}
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from "vue";
import type { CategoryNameFlow, ModNameFlow, FlowModelType } from "@/api/database/db/flow";
import { ArrowDown, ArrowRight, Expand, Right, Search } from "@element-plus/icons-vue";
// import { categoryNameFlowModel, modNameFlowModel, flowModel } from "@/api/database/db/flow";
import { ElMessage, ElMessageBox } from "element-plus";
import { generateID } from "@/components/api-flow/common-utils";
import { makeDefaultFlow, makeDefaultNode } from "@/components/api-flow/engine/utils";
import type { Flow as ContentFlow } from '@/components/api-flow/engine/types'
import type { Node as ContentNode } from "@/components/api-flow/engine/types";
import { db } from "@/api/database";
import {useI18n} from  'vue-i18n'
const t=useI18n().t
const { categoryNameFlowModel, modNameFlowModel, flowModel } = db
interface ModItem {
  id: number
  name: string
  child: {
    id: number
    name: string
    child: FlowModelType[]
  }[]
}

const emit = defineEmits<{
  flowDragEnd: [value: { flow: ContentFlow, e: MouseEvent }],
  openFlow: [value: { flow: ContentFlow }],
  'update:flow': [value: { name: string, key: string, categoryNameFlowId: number }]
}>()
const flowDragInfo = ref({
  startX: 0,
  key: ''
})

const newEditFlowAddDialogVisible = ref(false)
// const newEditFlowAddTemp = ref<{
//   key: string,
//   name: string,
//   categoryNameFlowId: number | null,
//   modNameFlowId: number | null
// }>({name: '', key: '', categoryNameFlowId: null, modNameFlowId: null})
const flowSelectRef = ref()
const searchWord = ref("")
const flowAddDialogVisible = ref(false)
const modAddDialogVisible = ref(false)
const categoryAddVisible = ref(false)
const categoryEditVisible = ref(false)
const modEditVisible = ref(false)
const modAddNameTemp = ref('')
const categoryAddTemp = ref<{ name: string, modNameFlowId: number | null }>({ name: '', modNameFlowId: null })
const categoryEditTemp = ref<{ name: string, id: number | null }>({ name: '', id: null })
const modEditTemp = ref<{ name: string, id: number | null }>({ name: '', id: null })
const onFilterOpenModIdList = ref<number[]>([])
const onFilterOpenCategoryIdList = ref<number[]>([])
const noFilterOpenModIdList = ref<number[]>([])
const noFilterOpenCategoryIdList = ref<number[]>([])
const openModIdList = computed(() => searchWord.value ? onFilterOpenModIdList.value : noFilterOpenModIdList.value)
const openCategoryIdList = computed(() => searchWord.value ? onFilterOpenCategoryIdList.value : noFilterOpenCategoryIdList.value)

const flowEditVisible = ref(false)
const tempEditorEditFlow = ref<{
  key: string,
  name: string,
  contentFlow: ContentFlow,
  categoryNameFlowId: null | number,
}>({
  key: "",
  name: "",
  contentFlow: makeDefaultFlow(),
  categoryNameFlowId: null
})

const tempEditFlow = ref<{
  key: string,
  name: string,
  contentFlow: ContentFlow,
  modNameFlowId: number | null
  categoryNameFlowId: null | number,
}>({
  key: "",
  name: "",
  contentFlow: makeDefaultFlow(),
  categoryNameFlowId: null,
  modNameFlowId: null
})
const flowAddTemp = ref<{
  key: string,
  name: string,
  categoryNameFlowId: number | null,
  modNameFlowId: number | null,
  contentFlow?: any
}>({ name: '', key: '', categoryNameFlowId: null, modNameFlowId: null })

const floatMenu = ref({
  type: 'flowConfig' as 'flowConfig' | 'categoryConfig' | 'modConfig',
  key: '',
  top: '0px',
  left: '0px',
  visible: false,
  categoryId: null as number | null,
  modId: null as number | null,
})
const modOptions = computed(() => {
  return flowTree.value.map(item => {
    return { id: item.id, name: item.name }
  })
})

const categoryOptions = computed(() => {
  if (flowAddTemp.value.modNameFlowId) {
    const modFind = flowTree.value.find(item => item.id == flowAddTemp.value.modNameFlowId)
    if (!modFind) {
      return []
    } else {
      return modFind.child.map(category => {
        return { id: category.id, name: category.name }
      })
    }
  } else {
    return []
  }
})

watch(() => searchWord.value, (nVal, oldVal) => {
  if (nVal !== '') {
    onFilterOpenModIdList.value = flowTreeFilter.value.map(item => item.id)
    const categoryIds = []
    flowTreeFilter.value.forEach(item => item.child.forEach(childItem => categoryIds.push(childItem.id)))
    onFilterOpenCategoryIdList.value = categoryIds
  }
})

const flowTreeFilter = computed(() => {
  return (!!searchWord.value) ? flowTree.value.map(
    mod => ({
      ...mod, child: mod.child.map(
        category => ({ ...category, child: category.child.filter(node => node.name.includes(searchWord.value)) })).
        filter(category => category.child.length)
    })
  ).filter(mod => mod.child.length) : flowTree.value
})

function clickMod(modId: number) {
  let openModIdList = searchWord.value ? onFilterOpenModIdList : noFilterOpenModIdList
  const index = openModIdList.value.indexOf(modId)
  if (index !== -1) {
    openModIdList.value.splice(index, 1)
    flowTree.value.find(item => item.id == modId)?.child.forEach(category => {
      const index = openCategoryIdList.value.indexOf(category.id)
      if (index !== -1) {
        openCategoryIdList.value.splice(index, 1)
      }
    })
  } else {
    openModIdList.value.push(modId)
  }
}

function clickCategory(categoryId: number) {
  let openCategoryIdList = searchWord.value ? onFilterOpenCategoryIdList : noFilterOpenCategoryIdList
  const index = openCategoryIdList.value.indexOf(categoryId)
  if (index !== -1) {
    openCategoryIdList.value.splice(index, 1)
  } else {
    openCategoryIdList.value.push(categoryId)
  }
}

function showModAdd() {
  modAddNameTemp.value = ''
  modAddDialogVisible.value = true
}


async function showFlowEdit() {

}

function onFlowRightClick(e: MouseEvent, flowKey: string) {
  floatMenu.value.key = flowKey
  floatMenu.value.type = 'flowConfig'
  floatMenu.value.left = e.pageX + 'px'
  floatMenu.value.top = e.pageY + 'px'
  floatMenu.value.visible = true
}

function onCategoryRightClick(e: MouseEvent, id: number) {
  floatMenu.value.categoryId = id
  floatMenu.value.type = 'categoryConfig'
  floatMenu.value.left = e.x + 'px'
  floatMenu.value.top = e.y + 'px'
  floatMenu.value.visible = true
}

function onModRightClick(e: MouseEvent, id: number) {
  floatMenu.value.modId = id
  floatMenu.value.type = 'modConfig'
  floatMenu.value.left = e.x + 'px'
  floatMenu.value.top = e.y + 'px'
  floatMenu.value.visible = true
}

function showFlowDelete() {
  ElMessageBox.confirm(
    t('nodeFlowSelect.confirm_delete_flow'),
      t('words.tip'),
    {
      confirmButtonText:  t('words.confirm'),
      cancelButtonText:  t('words.cancel'),
      type: 'warning',
    }
  )
    .then(async () => {
      const res = await flowModel.delete(floatMenu.value.key!)
      if (res.state == 0) {
        ElMessage.warning(res.msg)
      } else {
        ElMessage({
          type: 'success',
          message: t('nodeFlowSelect.delete_success'),
        })
        await getFlowTree()
      }
    })
}

function showCategoryDelete() {
  ElMessageBox.confirm(
      t('nodeFlowSelect.confirm_delete_category'),
      t('words.tip'),
    {
      confirmButtonText:  t('words.confirm'),
      cancelButtonText:  t('words.cancel'),
      type: 'error',
    }
  )
    .then(async () => {
      const res = await categoryNameFlowModel.delete(floatMenu.value.categoryId!)
      if (res.state == 0) {
        ElMessage.warning(res.msg)
      } else {
        ElMessage({
          type: 'success',
          message: t('nodeFlowSelect.delete_success'),
        })
        await getFlowTree()
      }
    })
}

function showModDelete() {
  ElMessageBox.confirm(
      t('nodeFlowSelect.confirm_delete_mod'),
      t('words.tip'),
    {
      confirmButtonText:  t('words.confirm'),
      cancelButtonText: t('words.cancel'),
      type: 'error',
    }
  )
    .then(async () => {
      const res = await modNameFlowModel.delete(floatMenu.value.modId!)
      if (res.state == 0) {
        ElMessage.warning(res.msg)
      } else {
        ElMessage({
          type: 'success',
          message: t('nodeFlowSelect.delete_success'),
        })
        await getFlowTree()
      }
    })
}


async function saveFlowAdd(): Promise<any> {
  const { name, categoryNameFlowId, modNameFlowId, key } = flowAddTemp.value
  let contentFlow = flowAddTemp.value.contentFlow
  if (!(name && categoryNameFlowId && modNameFlowId && key)) {
    return ElMessage.warning(t('nodeFlowSelect.pls_complete_info'))
  }
  if (!contentFlow) {
    contentFlow = makeDefaultFlow()
  }
  contentFlow.key = key
  contentFlow.name = name
  delete contentFlow['id']
  const content = JSON.stringify(contentFlow)
  const res = await flowModel.add(key, name, categoryNameFlowId, content)
  let newItem
  if (res.state == 0) {
    ElMessage.warning(res.msg)
  } else {
    newItem = res.data
    ElMessage.success(t('nodeFlowSelect.add_success'))
  }
  await getFlowTree()
  return { newItem, contentFlow }
}


function showNewEditFlowAdd(contentFlow) {
  flowAddTemp.value = { modNameFlowId: null, categoryNameFlowId: null, name: '', key: generateID(), contentFlow: contentFlow }
  newEditFlowAddDialogVisible.value = true
}

//直接在流程图里面新拖拽生成的流程的保持
async function newEditFlowAddSave() {
  const { newItem, contentFlow } = await saveFlowAdd()
  if (flowAddTemp.value.contentFlow) {
    delete flowAddTemp.value.contentFlow
  }
  const { name, key, categoryNameFlowId } = newItem
  ElMessage.success(t('nodeFlowSelect.save_success'))
  newEditFlowAddDialogVisible.value = false
  emit('update:flow', { name, key, categoryNameFlowId })
}

async function gotoFlowEdit() {
  flowAddDialogVisible.value = false
  const { newItem, contentFlow } = await saveFlowAdd()
  const { name, key, categoryNameFlowId } = newItem
  tempEditorEditFlow.value = { name, key, contentFlow, categoryNameFlowId }
  flowEditVisible.value = true

}

async function flowUpdate(contentFlow: ContentFlow) {
  const name = contentFlow.name!
  const key = contentFlow.key!
  const categoryNameFlowId = contentFlow.categoryNameFlowId!
  if (!name) {
    return ElMessage.warning(t('nodeFlowSelect.flow_name_cant_null'))
  }
  if (!key) {
    return ElMessage.warning(t('nodeFlowSelect.flow_key_cant_null'))
  }
  let content
  if (contentFlow) {
    try {
      delete contentFlow['id']
      content = JSON.stringify(contentFlow)
    } catch (e) {
      console.log(e)
      console.log(t('nodeFlowSelect.flow_content_parse_fail'), content)
    }
  } else {
    const flowContentDefault = makeDefaultFlow()
    flowContentDefault.key = key
    flowContentDefault.name = name
    delete flowContentDefault['id']
    content = JSON.stringify(flowContentDefault)
  }
  let res
  if (categoryNameFlowId) {
    res = await flowModel.update({ key, name, categoryNameFlowId, content })
  } else {
    res = await flowModel.update({ key, name, content })
  }
  if (res.state == 0) {
    return ElMessage.warning(res.msg)
  } else {
    await getFlowTree()
    return ElMessage.success(t('nodeFlowSelect.save_success'))
  }
}

async function saveModAdd() {
  if (!modAddNameTemp.value) {
    return ElMessage.warning(t('nodeFlowSelect.name_cant_null'))
  }
  const res = await modNameFlowModel.add(modAddNameTemp.value)

  if (res.state == 0) {
    return ElMessage.warning(res.msg)
  }
  ElMessage.success(t('nodeFlowSelect.add_success'))
  modAddDialogVisible.value = false
  await getFlowTree()
}

async function showCategoryAdd() {
  categoryAddTemp.value = { name: '', modNameFlowId: flowAddTemp.value.modNameFlowId || null }
  categoryAddVisible.value = true
}

async function saveCategoryAdd() {
  const { name, modNameFlowId } = categoryAddTemp.value
  if (!name) {
    return ElMessage.warning(t('nodeFlowSelect.pls_input_name'))
  }
  if (!modNameFlowId) {
    return ElMessage.warning(t('nodeFlowSelect.pls_select_category'))
  }
  const res = await categoryNameFlowModel.add(name, modNameFlowId)
  if (res.state == 0) {
    return ElMessage.warning(res.msg)
  }
  ElMessage.success(t('nodeFlowSelect.add_success'))
  categoryAddVisible.value = false
  await getFlowTree()
}

async function showCategoryEdit() {
  if (floatMenu.value.categoryId) {
    const res = await categoryNameFlowModel.get(floatMenu.value.categoryId)
    if (res.state == 0) {
      //@ts-ignore
      return ElMessage.warning(res.msg)
    } else {
      categoryEditTemp.value = { id: res.data?.id!, name: res.data?.name! }
      categoryEditVisible.value = true
    }
  }
}

async function saveCategoryEdit() {
  const { name } = categoryEditTemp.value
  const categoryId = floatMenu.value.categoryId
  if (!name) {
    return ElMessage.warning(t('nodeFlowSelect.pls_input_name'))
  }
  if (!categoryId) {
    return ElMessage.warning(t('nodeFlowSelect.invalid_id'))
  }
  const res = await categoryNameFlowModel.update(categoryId, name)
  if (res.state == 0) {
    return ElMessage.warning(res.msg)
  }
  ElMessage.success(t('nodeFlowSelect.change_success'))
  categoryEditVisible.value = false
  floatMenu.value.categoryId = null
  await getFlowTree()
}

async function showModEdit() {
  if (floatMenu.value.modId) {
    const res = await modNameFlowModel.get(floatMenu.value.modId)
    if (res.state == 0) {
      //@ts-ignore
      return ElMessage.warning(res.msg)
    } else {
      modEditTemp.value = { id: res.data?.id!, name: res.data?.name! }
      modEditVisible.value = true
    }
  }
}

async function saveModEdit() {
  const { name } = modEditTemp.value
  const modId = floatMenu.value.modId
  if (!name) {
    return ElMessage.warning(t('nodeFlowSelect.pls_input_name'))
  }
  if (!modId) {
    return ElMessage.warning(t('nodeFlowSelect.invalid_id'))
  }
  const res = await modNameFlowModel.update(modId, name)
  if (res.state == 0) {
    return ElMessage.warning(res.msg)
  }
  ElMessage.success(t('nodeFlowSelect.change_success'))
  modEditVisible.value = false
  floatMenu.value.modId = null
  await getFlowTree()
}

function showFlowAdd() {
  flowAddTemp.value = { modNameFlowId: null, categoryNameFlowId: null, name: '', key: generateID() }
  flowAddDialogVisible.value = true
}


async function getFlowTree() {
  const flowsRes = await flowModel.all()
  const flows = flowsRes.data.map(item => {
    return { key: item.key, name: item.name, categoryNameFlowId: item.categoryNameFlowId }
  })
  const modNamesRes = await modNameFlowModel.all()
  const categoryNamesRes = await categoryNameFlowModel.all()
  const modNames = modNamesRes.data
  const categoryNames = categoryNamesRes.data
  const categoryItemMap = {}
  categoryNames.forEach(item => {
    categoryItemMap[item.id] = {
      id: item.id,
      name: item.name,
      child: []
    }
  })
  flows.forEach(flow => {
    categoryItemMap[flow.categoryNameFlowId].child.push(flow)
  })
  const modItemMap = {}
  modNames.forEach(item => {
    modItemMap[item.id] = { id: item.id, name: item.name, child: [] }
  })
  categoryNames.forEach(item => {
    const modNameFlowId = item.modNameFlowId
    const categoryItem = categoryItemMap[item.id]
    modItemMap[modNameFlowId].child.push(categoryItem)
  })
  flowTree.value = Object.values(modItemMap)
}

const flowTree = ref<ModItem[]>([
  //     {
  //   id: 1,
  //   name: '图像处理',
  //   child: [
  //     {
  //       id: 2,
  //       name: "色彩处理",
  //       child: [
  //         {key: 'sss', name: "流程"},
  //         {key: 'sss', name: "流程"},
  //         {key: 'sss', name: "流程"},
  //         {key: 'sss', name: "流程"},
  //       ]
  //     }, {
  //       id: 3,
  //       name: "模块2",
  //       child: [
  //         {key: 'sss', name: "流程1"}
  //       ]
  //     }
  //   ]
  // }, {
  //   id: 21,
  //   name: '分类2',
  //   child: [{
  //     id: 31,
  //     name: "模块1",
  //     child: [
  //       {key: 'sss', name: "流程1"}
  //     ]
  //   }]
  // }
]
)

function onFlowDragStart(e: DragEvent, key: string) {
  flowDragInfo.value.key = key
  flowDragInfo.value.startX = e.x
  // console.log(e, key)
}

async function openFlow() {
  const res = await flowModel.get(floatMenu.value.key)
  if (res.state == 0) {
    //@ts-ignore
    return ElMessage.warning(res.msg)
  } else {
    const flow = res.data!
    let contentFlow: any
    if (flow.content) {
      try {
        contentFlow = JSON.parse(flow.content)
      } catch (e) {
        console.log(e)
        console.log(t('nodeFlowSelect.flow_content_parse_fail'), flow.content)
      }
    } else {
      contentFlow = makeDefaultFlow()
      contentFlow.key = floatMenu.value.key
      contentFlow.name = flow.name!
    }
    delete contentFlow['id']
    contentFlow.categoryNameFlowId = flow.categoryNameFlowId
    emit('openFlow', { flow: contentFlow })
  }
}

async function onFlowDragEnd(e: DragEvent, endKey: string) {
  const { key, startX } = flowDragInfo.value
  if (endKey !== key) {
    return
  }
  if ((e.x - startX) > flowSelectRef.value.clientWidth) {
    const res = await flowModel.get(key)
    if (res.state == 0) {
      //@ts-ignore
      return ElMessage.warning(res.msg)
    } else {
      const flow = res.data!
      let contentFlow
      if (flow.content) {
        try {
          contentFlow = JSON.parse(flow.content)
        } catch (e) {
          console.log(e)
          console.log(t('nodeFlowSelect.flow_content_parse_fail'), flow.content)
        }
      } else {
        contentFlow = makeDefaultFlow()
        contentFlow.key = key
        contentFlow.name = flow.name!
      }
      delete contentFlow['id']
      emit('flowDragEnd', { flow: contentFlow, e })

    }
  }
}

onMounted(async () => {
  window.addEventListener("click", e => {
    floatMenu.value.visible = false
  })
  await getFlowTree()
})

defineExpose({ flowUpdate, showNewEditFlowAdd })
</script>
<style scoped lang="scss">
.title-text {
  background: #222228;
  font-weight: bold;
  text-align: center;
  padding: 0.4rem;
  color: #9597a7;
  border-bottom: 1px solid #3f3e3e;
}

.flow-select-box {
  height: 100%;
  width: 13.5rem;
  background: #1e1e24;
  border-right: 1px solid rgba(103, 103, 103, 0.54);
  border-left: 1px solid rgba(59, 57, 57, 0.54);
}

.flow-search-box {
  border-bottom: 1px solid #92929242;
  @apply text-center px-2 py-2
}

.flow-tree {
  user-select: none;
  border-bottom: 1px solid rgba(137, 137, 137, 0.22);
}

.mod-item__name {
  background: #222228;
  color: rgba(222, 222, 222, 0.8);
  //width: 12rem;
  font-size: 0.85rem;
  //font-weight: bold;
  border-bottom: 1px solid rgba(137, 137, 137, 0.22);

  span {
    margin-left: 1rem;
  }

  &:hover {
    color: rgb(201, 213, 252);
    background: #26262f;
  }

  @apply flex items-center py-1.5 cursor-pointer;
}

.category-item__name {
  background: #2b2b35;
  font-size: 0.8rem;
  color: rgba(222, 222, 222, 0.83);

  &:hover {
    color: rgba(192, 205, 240, 1);
    background: #2e2e38;
  }

  @apply py-1 pl-1 flex items-center cursor-pointer;
}

.flow-item__name {
  border: 1px solid #4b516787;
  color: rgba(208, 209, 220, 0.81);
  //font-weight: bold;
  background: #3c3d4c;
  font-size: 0.8rem;
  margin-right: 0.125rem;

  &:hover {
    color: rgba(222, 222, 222, 0.85);
    background: #4c4c62;
  }

  @apply cursor-pointer;
}

.category-items {
  transition: height 0.2s;
}

.float-menu {
  background: #383746;
  border: 2px solid rgb(112 104 104 / 19%);
  //border: 2px solid #6660602e;
  //border: 1px solid rgba(255, 255, 255, 0.44);
  //border-radius: 0.5rem;
  //min-width: 5rem;
  //text-align: center;
  //background: #50606d;
  //overflow: hidden;

}

.float-menu-title {
  font-size: 0.8rem;
  min-width: 8rem;
  background: #272733;
  color: rgb(206 207 222 / 86%);
  @apply px-3 py-1 font-bold select-none;
}

.float-menu-item {
  font-size: 0.8rem;
  color: #c6c6d1;
  opacity: 0.9;
  cursor: pointer;
  @apply px-3 py-1 font-bold;
}

.float-menu-item-border {
  border-bottom: 1px solid rgba(125, 122, 122, 0.36);
}

.float-menu-item:hover {
  background: #4c4b60;
  color: white;
}

.float-menu {
  background: #383746;
  border: 2px solid rgb(112 104 104 / 19%);

  //每个第一级div下的第一个div是标题
  div>div:first-of-type {
    font-size: 0.8rem;
    min-width: 8rem;
    background: #272733;
    color: rgb(206 207 222 / 86%);
    @apply px-3 py-1 font-bold select-none;
  }

  //每个第一级div下的除了第一个div的div是选项
  div>div:not(:first-child) {
    font-size: 0.8rem;
    color: #c6c6d1;
    opacity: 0.9;
    cursor: pointer;
    @apply px-3 py-1 font-bold;

    &:hover {
      background: #4c4b60;
      color: white;
    }
  }

  //每个第一级div下的除了第一个div和最后一个div的div都有下边框
  div>div:not(:first-child):not(:last-child) {
    border-bottom: 1px solid rgba(125, 122, 122, 0.36);
  }
}
</style>