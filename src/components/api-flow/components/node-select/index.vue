<template>
  <div class="node-select-box flex flex-col" ref="nodeSelectRef" @contextmenu.prevent>
    <!-- <div class="title-text">节点列表</div> -->
    <div class="node-search-box " style="--el-border-color: rgba(0,0,0,0);--el-fill-color-blank: #333340">
      <el-input :prefix-icon="Search as any" v-model="searchWord" style="height: 26px;width: auto" clearable
        placeholder="搜索节点"></el-input>
    </div>
    <div class="node-tree flex-1 overflow-y-auto custom-scrollbar">
      <div v-for="mod in nodeTreeFilter">
        <div class="h-full">
          <div class="mod-item__name flex-1" :style="{ background: modConfigMap[mod.id]?.color }"
            @click="() => clickMod(mod.id)"
            @contextmenu.prevent="(e) => { (!mod.fromServer) && onModRightClick(e, mod.id!) }">

            <span class="ml-4">{{ mod.name }}</span>
            <div class="ml-auto mr-2 flex-c flex-row ">
              <div class="flex-c h-full w-full mx-0.5" v-if="modConfigMap[mod.id]?.icon"
                style="width: 1.125rem;height: 1.125rem">
                <div class="mod-name-icon flex-c" style="width: 1.125rem;height: 1.125rem"
                  v-html="modConfigMap[mod.id]?.icon"></div>
              </div>
              <el-icon>
                <ArrowDown v-if="openModIdList.includes(mod.id)"></ArrowDown>
                <ArrowRight v-else></ArrowRight>
              </el-icon>
            </div>

          </div>
          <div class="category-items" v-if="openModIdList.includes(mod.id)">
            <div v-if="mod.child.length" class="pt-[1px] px-[1px] flex flex-col gap-[1px] ">
              <div v-for="category in mod.child">
                <div class="category-item__name" @click="() => clickCategory(category.id)"
                  @contextmenu.prevent="(e) => { (!mod.fromServer) && onCategoryRightClick(e, category.id!) }">
                  <div class=" w-1 mr-2" style="background: rgb(118 125 137)">&nbsp;</div>
                  <span>{{ category.name }}</span>
                  <el-icon class="ml-auto mr-2" style="font-size: 0.8rem;">
                    <ArrowDown v-if="openCategoryIdList.includes(category.id)"></ArrowDown>
                    <ArrowRight v-else></ArrowRight>
                  </el-icon>
                </div>
                <div v-if="openCategoryIdList.includes(category.id)" style="background: rgb(42,42,50)">
                  <div v-if="category.child?.length" class="w-full flex flex-col gap-1  pt-1 pb-0.5 pl-1.5 pr-0.5 ">
                    <div class="node-item__name flex items-center" :draggable="true"
                      @dragend="(e) => { onNodeDragEnd(e, nodeItem) }"
                      @dragstart="(e) => { onNodeDragStart(e, nodeItem) }"
                      @contextmenu.prevent="(e) => { (!mod.fromServer) && onNodeRightClick(e, nodeItem.key!) }"
                      v-for="nodeItem in category.child">
                      <div class="w-1 mr-3 my-0.5 ml-1.5" style="background: rgb(183,183,183)">&nbsp;</div>
                      <span class="py-0.5 flex-1">{{ nodeItem.name }}</span>
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
    <div class="flex-c py-2 opacity-80">
      <div>
        <el-button :color="'#31303f'" size="small" @click="showNodeAdd">添加节点</el-button>
      </div>
      <div>
        <el-button :color="'#31303f'" class="mt-2" size="small" @click="showSettingManager">系统设置</el-button>
      </div>
      <!--      <div>-->
      <!--        <el-select size="small" v-model="$i18n.locale" class="mt-2" style="width: 70px;">-->
      <!--          <el-option value="zh" label="zh" key="zh"></el-option>-->
      <!--          <el-option value="en" label="en" key="en"></el-option>-->
      <!--        </el-select>-->
      <!--      </div>-->
    </div>
    <el-dialog v-model="nodeAddDialogVisible" title="添加节点" style="width: 28rem">
      <div class="ml-10">
        <el-form>
          <el-form-item label="所属模块">
            <el-select size="small" v-model="nodeAddTemp.modNameId" placeholder="请选择"
              @change="() => nodeAddTemp.categoryNameId = null">
              <el-option v-for="item in modOptions" :key="item.id" :label="item.name" :value="item.id"></el-option>
            </el-select>
            <el-button size="small" class="ml-4" @click="showModAdd">添加</el-button>
          </el-form-item>
          <el-form-item label="所属类别">
            <el-select size="small" placeholder="请选择" v-model="nodeAddTemp.categoryNameId">
              <el-option v-for="item in categoryOptions" :key="item.id" :label="item.name" :value="item.id"></el-option>
            </el-select>
            <el-button size="small" class="ml-4" @click="showCategoryAdd">添加</el-button>
          </el-form-item>
          <el-form-item label="节点名称">
            <el-input v-model="nodeAddTemp.name" size="small" placeholder="请输入" style="width: 10.75rem"></el-input>
          </el-form-item>
        </el-form>

      </div>
      <template #footer>
        <div>
          <el-button size="small" @click="nodeAddDialogVisible = false">取消</el-button>
          <el-button size="small" type="primary" @click="gotoNodeEdit">确定</el-button>
        </div>
      </template>
    </el-dialog>
    <el-dialog v-model="categoryAddVisible" title="添加子类" style="width: 28rem">
      <div class="ml-10">
        <el-form>
          <el-form-item label="所属模块">
            <el-select size="small" placeholder="请选择" v-model="categoryAddTemp.modNameId">
              <el-option v-for="item in modOptions" :key="item.id" :label="item.name" :value="item.id"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="类别名称">
            <el-input size="small" v-model.trim="categoryAddTemp.name" placeholder="请输入"
              style="width: 10.75rem"></el-input>
          </el-form-item>
        </el-form>

      </div>
      <template #footer>
        <div>
          <el-button size="small" @click="categoryAddVisible = false">取消</el-button>
          <el-button size="small" type="primary" @click="saveCategoryAdd">确定</el-button>
        </div>
      </template>
    </el-dialog>
    <el-dialog v-model="categoryEditVisible" title="编辑子类" style="width: 28rem">
      <div class="ml-10">
        <el-form>
          <!--          <el-form-item label="所属模块">-->
          <!--            <el-select size="small" placeholder="请选择" v-model="categoryAddTemp.modNameId">-->
          <!--              <el-option v-for="item in modOptions" :key="item.id" :label="item.name" :value="item.id"></el-option>-->
          <!--            </el-select>-->
          <!--          </el-form-item>-->
          <el-form-item label="类别名称">
            <el-input size="small" v-model.trim="categoryEditTemp.name" placeholder="请输入"
              style="width: 10.75rem"></el-input>
          </el-form-item>
        </el-form>

      </div>
      <template #footer>
        <div>
          <el-button size="small" @click="categoryEditVisible = false">取消</el-button>
          <el-button size="small" type="primary" @click="saveCategoryEdit">确定</el-button>
        </div>
      </template>
    </el-dialog>
    <el-dialog v-model="modEditVisible" title="编辑模块" style="width: 28rem">
      <div class="ml-10">
        <el-form>
          <el-form-item label="模块名称">
            <el-input size="small" v-model.trim="modEditTemp.name" placeholder="请输入" style="width: 10.75rem"></el-input>
          </el-form-item>
        </el-form>

      </div>
      <template #footer>
        <div>
          <el-button size="small" @click="modEditVisible = false">取消</el-button>
          <el-button size="small" type="primary" @click="saveModEdit">确定</el-button>
        </div>
      </template>
    </el-dialog>
    <el-dialog v-model="modAddDialogVisible" title="添加类别" style="width: 28rem">
      <div class="ml-10">
        <el-form>
          <el-form-item label="类别名称">
            <el-input size="small" v-model.trim="modAddNameTemp" placeholder="请输入" style="width: 10.75rem"></el-input>
          </el-form-item>
        </el-form>
      </div>
      <template #footer>
        <div>
          <el-button size="small" @click="modAddDialogVisible = false">取消</el-button>
          <el-button size="small" @click="saveModAdd" type="primary">确定</el-button>
        </div>
      </template>
    </el-dialog>
    <el-dialog :append-to-body="true" class="node-editor-dialog" v-model="nodeEditVisible"
      style="width: 100%;height: 100%;margin: 0;padding: 0">
      <node-editor ref="nodeEditor" :node="tempEditorEditNode.contentNode" @update:node="nodeUpdate"
        @cancel="closeEditor"></node-editor>
    </el-dialog>
    <el-dialog title="节点服务管理" v-model="settingVisible" style="border-radius: 0.75rem" class="setting-dialog">
      <el-tabs v-model="activeConfigTabName">
        <el-tab-pane label="服务管理" name="serverManager">
          <flow-server-manager @change="getNodeTree"></flow-server-manager>
        </el-tab-pane>
        <el-tab-pane label="系统配置" name="systemSetting" style="height: 100%">
          <system-setting style="height: 100%;"></system-setting>
        </el-tab-pane>
<!--        <el-tab-pane label="数据管理" name="dataManage" style="height: 100%">-->
<!--          <data-manage @refresh_nodes="getNodeTree" style="height: 100%;"></data-manage>-->
<!--        </el-tab-pane>-->
      </el-tabs>
    </el-dialog>
    <div class="absolute rounded overflow-hidden shadow-xl float-menu" @mouseleave="() => floatMenu.visible = false"
      v-if="floatMenu.visible" :style="{ top: floatMenu.top, left: floatMenu.left }">
      <div v-if="floatMenu.type === 'nodeConfig'">
        <div>
          节点菜单
        </div>
        <div @click="showNodeEdit">编辑
        </div>
        <div @click="showNodeDelete">删除
        </div>
        <div @click="floatMenu.visible = false">取消
        </div>
      </div>
      <div v-if="floatMenu.type === 'categoryConfig'">
        <div>
          子类菜单
        </div>
        <div @click="showCategoryEdit">编辑
        </div>
        <div @click="showCategoryDelete">删除
        </div>
        <div @click="floatMenu.visible = false">取消
        </div>
      </div>
      <div v-if="floatMenu.type === 'modConfig'">
        <div>
          模块菜单
        </div>
        <div @click="showModEdit">编辑
        </div>
        <div @click="showModDelete">删除
        </div>
        <div @click="floatMenu.visible = false">取消
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from "vue";
import type { CategoryName, ModName, NodeModelType } from "@/api/database/db/node";
import { ArrowDown, ArrowRight, Expand, Right, Search } from "@element-plus/icons-vue";
// import { categoryNameModel, modNameModel, nodeModel } from "@/api/database/db/node";
import { ElMessage, ElMessageBox } from "element-plus";
import { generateID } from "@/components/api-flow/common-utils";
import NodeEditor from "@/components/api-flow/components/node-editor/index.vue";
import { makeDefaultNode } from "@/components/api-flow/engine/utils";
import type { Node as ContentNode } from '@/components/api-flow/engine/types'
import { api } from "@/utils/api";
import FlowServerManager from "@/components/api-flow/components/node-select/flow-server-manager.vue";
// import { FlowServerModel, type FlowServerModelType } from "@/api/database/db/server";
import { flowServerStore } from "@/components/api-flow/engine/store";
import { db } from "@/api/database";
import type { FlowServerModelType } from "@/api/database/db";
import { copy } from "../param-input-bar/input-param/utils";
import SystemSetting from "@/components/api-flow/components/system-setting.vue";
import DataManage from "@/components/api-flow/components/data-manage.vue";
import {loadDb} from "@/utils/loadDb";
const { categoryNameModel, modNameModel, nodeModel, flowServerModel } = db

interface ModItem {
  id: number
  name: string
  fromServer?: boolean
  child: {
    id: number
    name: string
    child: NodeModelType[]
  }[]
}

const emit = defineEmits<{
  nodeDragEnd: [value: { node: ContentNode, e: MouseEvent }],
}>()
const nodeDragInfo = ref({
  startX: 0,
  key: ''
})

const activeConfigTabName = ref('serverManager')
const searchWord = ref("")
const nodeSelectRef = ref()
const nodeAddDialogVisible = ref(false)
const settingVisible = ref(false)
const modAddDialogVisible = ref(false)
const categoryAddVisible = ref(false)
const categoryEditVisible = ref(false)
const modEditVisible = ref(false)
const modAddNameTemp = ref('')
const categoryAddTemp = ref<{ name: string, modNameId: number | null }>({ name: '', modNameId: null })
const categoryEditTemp = ref<{ name: string, id: number | null }>({ name: '', id: null })
const modEditTemp = ref<{ name: string, id: number | null }>({ name: '', id: null })

const onFilterOpenModIdList = ref<number[]>([])
const onFilterOpenCategoryIdList = ref<number[]>([])
const noFilterOpenModIdList = ref<number[]>([])
const noFilterOpenCategoryIdList = ref<number[]>([])
const openModIdList = computed(() => searchWord.value ? onFilterOpenModIdList.value : noFilterOpenModIdList.value)
const openCategoryIdList = computed(() => searchWord.value ? onFilterOpenCategoryIdList.value : noFilterOpenCategoryIdList.value)
const nodeEditVisible = ref(false)
const nodeEditor = ref()
const tempEditorEditNode = ref<{
  key: string,
  name: string,
  contentNode: ContentNode,
  categoryNameId: null | number,
}>({
  key: "",
  name: "",
  contentNode: makeDefaultNode(),
  categoryNameId: null
})
const modConfigMap = ref({})
const tempEditNode = ref<{
  key: string,
  name: string,
  contentNode: ContentNode,
  modNameId: number | null
  categoryNameId: null | number,
}>({
  key: "",
  name: "",
  contentNode: makeDefaultNode(),
  categoryNameId: null,
  modNameId: null
})
const nodeAddTemp = ref<{
  key: string,
  name: string,
  categoryNameId: number | null,
  modNameId: number | null
}>({ name: '', key: '', categoryNameId: null, modNameId: null })
const floatMenu = ref({
  type: 'nodeConfig' as 'nodeConfig' | 'categoryConfig' | 'modConfig',
  key: '',
  top: '0px',
  left: '0px',
  visible: false,
  categoryId: null as number | null,
  modId: null as number | null,
})
const modOptions = computed(() => {
  return nodeTree.value.map(item => {
    return { id: item.id, name: item.name }
  })
})

const categoryOptions = computed(() => {
  if (nodeAddTemp.value.modNameId) {
    const modFind = nodeTree.value.find(item => item.id == nodeAddTemp.value.modNameId)
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
    onFilterOpenModIdList.value = nodeTreeFilter.value.map(item => item.id)
    const categoryIds = []
    nodeTreeFilter.value.forEach(item => item.child.forEach(childItem => categoryIds.push(childItem.id)))
    onFilterOpenCategoryIdList.value = categoryIds
  }
})

const nodeTreeFilter = computed(() => {
  return (!!searchWord.value) ? nodeTree.value.map(
    mod => ({
      ...mod, child: mod.child.map(
        category => ({
          ...category,
          child: category.child.filter(node => node.name.includes(searchWord.value))
        })).filter(category => category.child.length)
    })
  ).filter(mod => mod.child.length) : nodeTree.value
})

function clickMod(modId: number) {
  let openModIdList = searchWord.value ? onFilterOpenModIdList : noFilterOpenModIdList
  const index = openModIdList.value.indexOf(modId)
  if (index !== -1) {
    openModIdList.value.splice(index, 1)
    nodeTree.value.find(item => item.id == modId)?.child.forEach(category => {
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

function closeEditor() {
  nodeEditVisible.value = false
  tempEditorEditNode.value = { key: '', name: '', categoryNameId: null, contentNode: makeDefaultNode() }
}


async function showNodeEdit() {
  floatMenu.value.visible = false
  const key = floatMenu.value.key
  const res = await nodeModel.get(key)
  const nodeItem = res.data
  let { name, categoryNameId, content } = nodeItem
  let contentNode
  if (content) {
    try {
      contentNode = JSON.parse(content)
    } catch (e) {
      console.log(e)
      console.log('节点内容解析错误', content)
    }
  } else {
    contentNode = makeDefaultNode()
    contentNode.key = key
    contentNode.name = name
  }
  delete contentNode['id']
  tempEditorEditNode.value = { name, key, contentNode, categoryNameId }
  nodeEditVisible.value = true
  await nextTick(() => {
    nodeEditor.value?.setNode(tempEditorEditNode.value.contentNode)
  })
}

function onNodeRightClick(e: MouseEvent, nodeKey: string) {
  floatMenu.value.key = nodeKey
  floatMenu.value.type = 'nodeConfig'
  floatMenu.value.left = e.pageX + 'px'
  floatMenu.value.top = e.pageY + 'px'
  floatMenu.value.visible = true
}

function onCategoryRightClick(e: MouseEvent, id: number) {
  floatMenu.value.categoryId = id
  floatMenu.value.type = 'categoryConfig'
  floatMenu.value.left = e.pageX + 'px'
  floatMenu.value.top = e.pageY + 'px'
  floatMenu.value.visible = true
}

function onModRightClick(e: MouseEvent, id: number) {
  floatMenu.value.modId = id
  floatMenu.value.type = 'modConfig'
  floatMenu.value.left = e.pageX + 'px'
  floatMenu.value.top = e.pageY + 'px'
  floatMenu.value.visible = true
}

function showNodeDelete() {
  ElMessageBox.confirm(
    '确定删除该节点?',
    '提示',
    {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'warning',
    }
  )
    .then(async () => {
      const res = await nodeModel.delete(floatMenu.value.key!)
      if (res.state == 0) {
        ElMessage.warning(res.msg)
      } else {
        ElMessage({
          type: 'success',
          message: '删除成功',
        })
        await getNodeTree()
      }
    })
}

function showCategoryDelete() {
  ElMessageBox.confirm(
    '确定删除该子类?',
    '提示',
    {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'error',
    }
  )
    .then(async () => {
      const res = await categoryNameModel.delete(floatMenu.value.categoryId!)
      if (res.state == 0) {
        ElMessage.warning(res.msg)
      } else {
        ElMessage({
          type: 'success',
          message: '删除成功',
        })
        await getNodeTree()
      }
    })
}

function showModDelete() {
  ElMessageBox.confirm(
    '确定删除该模块?',
    '提示',
    {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'error',
    }
  )
    .then(async () => {
      const res = await modNameModel.delete(floatMenu.value.modId!)
      if (res.state == 0) {
        ElMessage.warning(res.msg)
      } else {
        ElMessage({
          type: 'success',
          message: '删除成功',
        })
        await getNodeTree()
      }
    })
}


async function saveNodeAdd(): Promise<any> {
  const { name, categoryNameId, modNameId, key } = nodeAddTemp.value
  if (!(name && categoryNameId && modNameId && key)) {
    ElMessage.warning('请补充完整信息')
    return false
  }
  const contentNode = makeDefaultNode()
  contentNode.key = key
  contentNode.name = name
  delete contentNode['id']
  const content = JSON.stringify(contentNode)
  const res = await nodeModel.add(key, name, categoryNameId, content)
  let newItem
  if (res.state == 0) {
    ElMessage.warning(res.msg)
    return false
  } else {
    newItem = res.data
  }
  await getNodeTree()
  return { newItem, contentNode }
}

async function gotoNodeEdit() {
  const res = await saveNodeAdd()
  if (!res) {
    return
  }
  nodeAddDialogVisible.value = false
  const { newItem, contentNode } = res
  const { name, key, categoryNameId } = newItem
  tempEditorEditNode.value = { name, key, contentNode, categoryNameId }
  nodeEditVisible.value = true
  await nextTick(() => {
    nodeEditor.value?.setNode(tempEditorEditNode.value.contentNode)
  })
}

async function nodeUpdate(contentNode: ContentNode) {
  tempEditorEditNode.value.contentNode = contentNode
  const name = contentNode.name
  tempEditorEditNode.value.name = name
  const { key, categoryNameId } = tempEditorEditNode.value
  if (!name) {
    return ElMessage.warning('节点名称不能为空')
  }
  if (!key) {
    return ElMessage.warning('节点key不能为空')
  }
  let content
  if (contentNode) {
    try {
      delete contentNode['id']
      content = JSON.stringify(contentNode)
    } catch (e) {
      console.log(e)
      console.log('节点内容解析错误', content)
    }
  } else {
    const nodeContentDefault = makeDefaultNode()
    nodeContentDefault.key = key
    nodeContentDefault.name = name
    delete nodeContentDefault['id']
    content = JSON.stringify(nodeContentDefault)
  }
  let res
  if (categoryNameId) {
    res = await nodeModel.update({ key, name, categoryNameId, content })
  } else {
    res = await nodeModel.update({ key, name, content })
  }
  if (res.state == 0) {
    return ElMessage.warning(res.msg)
  } else {
    await getNodeTree()
    return ElMessage.success('保存成功')
  }
}

async function saveModAdd() {
  if (!modAddNameTemp.value) {
    return ElMessage.warning('名称不能为空')
  }
  const res = await modNameModel.add(modAddNameTemp.value)

  if (res.state == 0) {
    return ElMessage.warning(res.msg)
  }
  ElMessage.success('添加成功')
  modAddDialogVisible.value = false
  await getNodeTree()
}

async function showCategoryAdd() {
  categoryAddTemp.value = { name: '', modNameId: nodeAddTemp.value.modNameId || null }
  categoryAddVisible.value = true
}

async function saveCategoryAdd() {
  const { name, modNameId } = categoryAddTemp.value
  if (!name) {
    return ElMessage.warning("请输入名称")
  }
  if (!modNameId) {
    return ElMessage.warning("请选择分类")
  }
  const res = await categoryNameModel.add(name, modNameId)
  if (res.state == 0) {
    return ElMessage.warning(res.msg)
  }
  ElMessage.success('添加成功')
  categoryAddVisible.value = false
  await getNodeTree()
}

async function showCategoryEdit() {
  if (floatMenu.value.categoryId) {
    const res = await categoryNameModel.get(floatMenu.value.categoryId)
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
    return ElMessage.warning("请输入名称")
  }
  if (!categoryId) {
    return ElMessage.warning("无效id")
  }
  const res = await categoryNameModel.update(categoryId, name)
  if (res.state == 0) {
    return ElMessage.warning(res.msg)
  }
  ElMessage.success('修改成功')
  categoryEditVisible.value = false
  floatMenu.value.categoryId = null
  await getNodeTree()
}

async function showModEdit() {
  if (floatMenu.value.modId) {
    const res = await modNameModel.get(floatMenu.value.modId)
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
    return ElMessage.warning("请输入名称")
  }
  if (!modId) {
    return ElMessage.warning("无效id")
  }
  const res = await modNameModel.update(modId, name)
  if (res.state == 0) {
    return ElMessage.warning(res.msg)
  }
  ElMessage.success('修改成功')
  modEditVisible.value = false
  floatMenu.value.modId = null
  await getNodeTree()
}

function showNodeAdd() {
  nodeAddTemp.value = { modNameId: null, categoryNameId: null, name: '', key: generateID() }
  nodeAddDialogVisible.value = true
}


async function getNodeTree() {
  const nodesRes = await nodeModel.all()
  const nodes = nodesRes.data.map(item => {
    return { key: item.key, name: item.name, categoryNameId: item.categoryNameId }
  })
  const modNamesRes = await modNameModel.all()
  const categoryNamesRes = await categoryNameModel.all()
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
  nodes.forEach(node => {
    categoryItemMap[node.categoryNameId].child.push(node)
  })
  const modItemMap = {}
  modNames.forEach(item => {
    modItemMap[item.id] = { id: item.id, name: item.name, child: [] }
  })
  categoryNames.forEach(item => {
    const modNameId = item.modNameId
    const categoryItem = categoryItemMap[item.id]
    modItemMap[modNameId].child.push(categoryItem)
  })
  nodeTree.value = Object.values(modItemMap)
  getAllServerNodes().then()
}

interface ServerNode extends ContentNode {
  category: string
  mod: string
}

const flowServers = ref<FlowServerModelType[]>([])

async function getAllServerNodes() {
  if (!localStorage.getItem('useWebDb')) {
    // getNodeTreeFromServer("", (import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8021') + "/fineflow/plugins")
  }
  flowServerModel.all().then(res => {
    if (res.state) {
      flowServers.value = res.data.filter(item => item.enable)
      const mapTemp = {}
      flowServers.value.forEach(item => mapTemp[item.key] = item)
      flowServerStore.value = mapTemp
      flowServers.value.forEach(item => {
        getNodeTreeFromServer(item.key, item.href)
      })
    }
  })
}


function makeTreeFormNodes(nodes: ServerNode[]) {
  const tree = { id: nodes[0].serverKey, name: nodes[0].mod, child: [], fromServer: true }
  const categoryMap = {}
  for (let node of nodes) {
    if (!categoryMap[node.category]) {
      // console.log(node.category,node.category,'node.category')
      // categoryMap[node.category] = {id: generateID(), name: node.category, child: []}
      categoryMap[node.category] = { id: nodes[0].serverKey + '__' + node.category, name: node.category, child: [] }
    }
    // node.serverKey = nodes[0].key
    categoryMap[node.category].child.push(node)
  }
  tree.child = Object.values(categoryMap)
  return tree
}

async function getNodeTreeFromServer(key: string, href: string) {
  const res = await api.post(href + '/get_nodes', {})
  const data: ServerNode[] = res.data.data
  modConfigMap.value[key] = res.data.config
  const modMap: { [key: string]: ServerNode[] } = {}
  data.forEach(node => {
    if (!modMap[node.serverKey]) {
      modMap[node.serverKey] = []
    }
    modMap[node.serverKey].push(node)
  })
  Object.values(modMap).map(item => makeTreeFormNodes(item)).map(tree => {
    const oldIndex = nodeTree.value.findIndex(item => item.id == tree.id)
    nodeTree.value.push(tree as any)
    if (oldIndex !== -1) {
      nodeTree.value.splice(oldIndex, 1)
    }
  })

}

const nodeTree = ref<ModItem[]>([
  //     {
  //   id: 1,
  //   name: '图像处理',
  //   child: [
  //     {
  //       id: 2,
  //       name: "色彩处理",
  //       child: [
  //         {key: 'sss', name: "节点"},
  //         {key: 'sss', name: "节点"},
  //         {key: 'sss', name: "节点"},
  //         {key: 'sss', name: "节点"},
  //       ]
  //     }, {
  //       id: 3,
  //       name: "模块2",
  //       child: [
  //         {key: 'sss', name: "节点1"}
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
  //       {key: 'sss', name: "节点1"}
  //     ]
  //   }]
  // }
]
)

function onNodeDragStart(e: DragEvent, nodeItem: NodeModelType) {
  const key = nodeItem.key
  if (key) {
    nodeDragInfo.value.key = key
    nodeDragInfo.value.startX = e.x
    // console.log(e, key)
  }
}

async function onNodeDragEnd(e: DragEvent, nodeItem: ContentNode | NodeModelType) {
  const endKey = nodeItem.key
  const { key, startX } = nodeDragInfo.value
  if (endKey !== key) {
    return
  }
  //server端的节点则直接返回
  //@ts-ignore
  if (nodeItem.serverKey) {
    emit('nodeDragEnd', { node: nodeItem as ContentNode, e })
    return
  }
  if ((e.x - startX) > nodeSelectRef.value.clientWidth) {
    const res = await nodeModel.get(key)
    if (res.state == 0) {
      //@ts-ignore
      return ElMessage.warning(res.msg)
    } else {
      const node = res.data!
      let contentNode
      if (node.content) {
        try {
          contentNode = JSON.parse(node.content)
        } catch (e) {
          console.log(e)
          console.log('节点内容解析错误', node.content)
        }
      } else {
        contentNode = makeDefaultNode()
        contentNode.key = key
        contentNode.name = node.name!
      }
      delete contentNode['id']
      emit('nodeDragEnd', { node: contentNode, e })

    }
  }
}


function showSettingManager() {
  settingVisible.value = true
}
function onRefresh(event) {
  // 检查是否按下了 Ctrl、Shift 和 F 键
  if (event.ctrlKey && event.shiftKey && event.key === 'F') {
    // 调用相应的函数
    console.log('Ctrl、Shift 和 F ')
    getNodeTree().then(res => {
      ElMessage.success('节点刷新完成')
    })
  }
}
// window.getNodeTreeFromServer = getNodeTreeFromServer
onMounted(async () => {
  await loadDb()
  window.addEventListener("click", e => {
    floatMenu.value.visible = false
  })
  document.addEventListener('keydown', onRefresh);
  await getNodeTree()
})
onUnmounted(() => {
  document.removeEventListener('keydown', onRefresh);
})
</script>
<style>
.mod-name-icon svg {

  height: 100%;
  width: 100%;
}

.setting-dialog .el-dialog__body {
  padding: 0.5rem 2rem 1rem;
  height: 23.5rem;
}

.setting-dialog .el-tabs--top {
  display: flex;
  /* flex-direction: column; */
  height: 100%;
}

.setting-dialog .el-tabs__content {
  flex: 1;
}
</style>
<style scoped lang="scss">
.title-text {
  background: #222228;
  font-weight: bold;
  text-align: center;
  padding: 0.4rem;
  color: #9597a7;
  border-bottom: 1px solid #3f3e3e;
}

.node-select-box {
  height: 100%;
  width: 13.5rem;
  background: #1e1e24;
  border-right: 1px solid rgba(103, 103, 103, 0.54);
  border-left: 1px solid rgba(59, 57, 57, 0.54);
}

.node-search-box {
  border-bottom: 1px solid #92929242;
  @apply text-center px-2 py-2
}

.node-tree {
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
    padding-top: 0.375rem
      /* 6px */
    ;
    padding-bottom: 0.375rem
      /* 6px */
    ;
  }

  &:hover {
    filter: brightness(1.2);
    color: rgb(201, 213, 252);
    //background: #26262f;
  }

  @apply flex items-center cursor-pointer;
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

.node-item__name {
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

// .float-menu {
//   background: #383746;
//   border: 2px solid rgb(112 104 104 / 19%);
//   //border: 2px solid #6660602e;
//   //border: 1px solid rgba(255, 255, 255, 0.44);
//   //border-radius: 0.5rem;
//   //min-width: 5rem;
//   //text-align: center;
//   //background: #50606d;
//   //overflow: hidden;

// }

// .float-menu-title {
//   font-size: 0.8rem;
//   min-width: 8rem;
//   background: #272733;
//   color: rgb(206 207 222 / 86%);
//   @apply px-3 py-1 font-bold select-none;
// }

// .float-menu-item {
//   font-size: 0.8rem;
//   color: #c6c6d1;
//   opacity: 0.9;
//   cursor: pointer;
//   @apply px-3 py-1 font-bold;
// }

// .float-menu-item-border {
//   border-bottom: 1px solid rgba(125, 122, 122, 0.36);
// }

// .float-menu-item:hover {
//   background: #4c4b60;
//   color: white;
// }

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