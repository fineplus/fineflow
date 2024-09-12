import {reactive} from "vue";
import type {FlowServerModelType} from "@/api/database/db/server";
import type {SystemConfig} from "@/components/api-flow/engine/types";

export const flowServerStore = reactive<{ value: { [key: string]: FlowServerModelType } }>({value: {}})
export const systemConfigStore = reactive<{ value: SystemConfig }>({value: {customPyFuncHref: null}})
export const cdnStore= {libs: {}, loaded: {}}
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

initConfigStore()