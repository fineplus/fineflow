<template>
  <div>
    <div style="height: 16rem">
      <div class="flex h-full">
        <el-table border :data="data" height="100%">
          <el-table-column label="key" prop="key" align="center" width="140"></el-table-column>
          <el-table-column label="name" prop="name" align="center" width="140"></el-table-column>
          <el-table-column label="href" prop="href" align="center" width="auto"></el-table-column>
          <el-table-column label="启用" prop="href" align="center" width="80">
            <template #default="{ row }">
              <el-switch :model-value="row.enable" @change="(val) => updateEnable(row, val)"></el-switch>
            </template>
          </el-table-column>
          <el-table-column label="操作" prop="href" align="center" width="160">
            <template #default="{ row }">
              <div class="flex flex-row flex-c">
                <el-button size="small" type="primary" @click="() => showEdit(row)">编辑</el-button>
                <el-popconfirm cancel-button-text="取消" confirm-button-text="确定" title="确定删除?"
                  @confirm="() => deleteOne(row.key)">
                  <template #reference>
                    <el-button size="small" type="danger">删除</el-button>
                  </template>
                </el-popconfirm>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
    <div class="flex">
      <el-button size="small" type="primary" class="mt-4 ml-auto" @click="showAdd">添加</el-button>
    </div>
    <el-dialog title="添加数据" style="width: 26rem;border-radius: 0.75rem" v-model="addDialogVisible">
      <el-form class="mx-10">
        <el-form-item label="索引" required>
          <el-input style="width: 10rem" size="small" v-model="itemTemp.key"></el-input>
        </el-form-item>
        <el-form-item label="名称" required>
          <el-input style="width: 10rem" size="small" v-model="itemTemp.name"></el-input>
        </el-form-item>
        <el-form-item label="链接" required>
          <el-input style="width: 20rem" size="small" v-model="itemTemp.href"></el-input>
        </el-form-item>
        <el-form-item label="启用" required>
          <el-switch size="small" v-model="itemTemp.enable"></el-switch>
        </el-form-item>
      </el-form>
      <template #footer>
        <div>
          <el-button size="small" @click="addDialogVisible = false">取消</el-button>
          <el-button size="small" type="primary" @click="saveAdd">确定</el-button>
        </div>
      </template>
    </el-dialog>
    <el-dialog v-model="editDialogVisible" title="编辑数据" style="width: 26rem;border-radius: 0.75rem">
      <el-form class="mx-10">
        <el-form-item label="索引">
          {{ itemTemp.key }}
        </el-form-item>
        <el-form-item label="名称" required>
          <el-input v-model="itemTemp.name" size="small" style="width: 10rem"></el-input>
        </el-form-item>
        <el-form-item label="链接" required>
          <el-input v-model="itemTemp.href" size="small" style="width: 20rem"></el-input>
        </el-form-item>
        <el-form-item label="启用" required>
          <el-switch size="small" v-model="itemTemp.enable"></el-switch>
        </el-form-item>
      </el-form>
      <template #footer>
        <div>
          <el-button size="small" @click="editDialogVisible = false">取消</el-button>
          <el-button size="small" type="primary" @click="saveEdit">保存</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>


<script setup lang="ts">
import { onMounted, ref } from "vue";
import type { FlowServerModelType } from "@/api/database/db/server";
import { FlowServerModel } from "@/api/database/db/server";
import { ElMessage } from "element-plus";
import { db } from "@/api/database";

const emit = defineEmits(['change'])
const addDialogVisible = ref(false)
const editDialogVisible = ref(false)
const itemTemp = ref<FlowServerModelType>({ name: '', key: '', href: '', enable: false })
const data = ref<FlowServerModelType[]>([])
const model = db.flowServerModel

function showAdd() {
  itemTemp.value = { name: '', key: '', href: '', enable: false }
  addDialogVisible.value = true
}


async function saveAdd() {
  const res = await model.add(itemTemp.value)
  if (res.state) {
    ElMessage.success('添加成功')
    getData()
    addDialogVisible.value = false
  } else {
    ElMessage.warning(res.msg)
  }
}

function showEdit(row: FlowServerModelType) {
  itemTemp.value = row
  editDialogVisible.value = true
}


function getData() {
  model.all().then(res => {
    if (res.state) {
      console.log(res.data, 'dddd')
      data.value = res.data
    } else {
      ElMessage.warning('错误:' + res.msg)
    }
  })
}

async function saveEdit() {
  const res = await model.update(itemTemp.value)
  if (res.state) {
    ElMessage.success('修改成功')
    emit('change')
    getData()
    editDialogVisible.value = false
  } else {
    ElMessage.warning(res.msg)
  }
}


function deleteOne(key: string) {
  model.delete(key).then(res => {
    if (res.state) {
      ElMessage.success('删除成功')
      emit('change')
      getData()
    } else {
      ElMessage.warning(res.msg)
    }
  })
}

async function updateEnable(row, val) {
  row.enable = val
  const res = await model.update(row)
  if (res.state) {
    ElMessage.success('修改成功')
    emit('change')
    getData()
    editDialogVisible.value = false
  } else {
    ElMessage.warning(res.msg)
  }
}

onMounted(() => {
  getData()
})
</script>


<style scoped lang="scss"></style>