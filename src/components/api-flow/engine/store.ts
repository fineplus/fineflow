import {reactive} from "vue";
import type {FlowServerModelType} from "@/api/database/db/server";
import type {SystemConfig} from "@/components/api-flow/engine/types";
import {allDb, loadDb} from "@/utils/loadDb";
import {ElMessage} from "element-plus";

export const flowServerStore = reactive<{ value: { [key: string]: FlowServerModelType } }>({value: {}})
export const systemConfigStore = reactive<{ value: SystemConfig }>({value: {customPyFuncHref: null}})
export const cdnStore = {libs: {}, loaded: {}}

interface ConfigStore {
    useCenterRouter?: boolean
}

export const configStore = reactive<{ value: ConfigStore }>({value: {}})

function safeParse<T extends any>(jsonStr: string, defaultValue?: T) {
    try {
        const res = JSON.parse(jsonStr)
        return res ? res : defaultValue
    } catch (e) {
        return defaultValue
    }
}

function initConfigStore() {
    configStore.value = safeParse<ConfigStore>(localStorage.getItem('configStore'), {useCenterRouter: false})
}


export function updateSystemConfig() {
    // api.post("/fineflow/config/update", systemConfigStore.value).then(res => {
    //   systemConfigStore.value = res.data
    //   ElMessage.success('保存成功')
    // }).catch(e => {
    //   console.warn(e)
    // })

    allDb.db.execute('UPDATE config SET value = $1 WHERE key = $2;', [JSON.stringify(systemConfigStore.value), 'system_config']).then((res) => {
        console.log(res)
        ElMessage.success('保存成功')
    })
}


export async function getSystemConfig() {
    await loadDb()
    let config = {}
    const res = await allDb.db.select('select * from config where key=$1;', ['system_config'])
    if (res.length == 0) {
        await allDb.db.execute('insert into config (key,value) VALUES($1,$2);', ['system_config', JSON.stringify({})])
    } else {
        console.log(res, 'rrr')
        config = JSON.parse(res[0]['value'])
    }

    systemConfigStore.value = config

    // api.post("/fineflow/config/get", {}).then(res => {
    //   systemConfigStore.value = res.data
    // }).catch(e => {
    //   console.warn(e)
    // })
}

initConfigStore()