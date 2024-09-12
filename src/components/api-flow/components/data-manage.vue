<template>
  <div>
    <div>
      <div class="mb-5 my-2">
        <span class="mr-4">节点数据</span>
        <el-button class="icon-button" :icon="uploadIcon" type="primary" size="small" @click="loadNodeJson">导入数据
        </el-button>
        <el-button class="icon-button" :icon="loadIcon" size="small" @click="exportNodes">导出数据</el-button>
      </div>
      <div>
        <span class="mr-4">流程数据</span>
        <el-button @click="loadFlowJson" class="icon-button" :icon="uploadIcon" type="primary" size="small">导入数据
        </el-button>
        <el-button @click="exportFlows" class="icon-button" :icon="loadIcon" size="small">导出数据</el-button>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import loadIcon from "../icons/load-icon.vue"
import uploadIcon from "../icons/upload-icon.vue"
import {api} from "@/api/api";
import {ElMessage} from "element-plus";
import {fileDownload} from "@/components/api-flow/engine/utils";

const emit = defineEmits(['refresh_nodes'])

function exportNodes() {
  fileDownload(window.apiUrl+'/fineflow/export/nodes','nodes.json')
}

function loadNodeJson() {
  const fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.accept = '.json';
  fileInput.addEventListener('change', function (event) {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = function (event) {
      const jsonData = JSON.parse(event.target.result);
      api.post('/fineflow/load/nodes', jsonData).then(res => {
        if (res.data.state == 1) {
          ElMessage.success("节点导入成功")
          emit('refresh_nodes')
        }
      })

    };
    reader.readAsText(file);
  });

  // 隐藏文件输入元素
  fileInput.style.display = 'none';

  // 将文件输入元素添加到文档中
  document.body.appendChild(fileInput);

  // 模拟点击文件输入元素
  fileInput.click();
}

function exportFlows() {
  fileDownload(window.apiUrl+'/fineflow/export/flows','flows.json')
}

function loadFlowJson() {
  const fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.accept = '.json';
  fileInput.addEventListener('change', function (event) {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = function (event) {
      const jsonData = JSON.parse(event.target.result);
      api.post('/fineflow/load/flows', jsonData).then(res => {
        if (res.data.state == 1) {
          ElMessage.success("流程导入成功")
          // emit('refresh_nodes')
        }
      })

    };
    reader.readAsText(file);
  });

  // 隐藏文件输入元素
  fileInput.style.display = 'none';

  // 将文件输入元素添加到文档中
  document.body.appendChild(fileInput);

  // 模拟点击文件输入元素
  fileInput.click();
}
</script>
<style scoped lang="scss">
.icon-button {
  padding-left: 5px !important;
  padding-right: 8px !important;
}
</style>