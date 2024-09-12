export type ParamTypeName =
    "string"
    | "text"
    | "datetime"
    | "date"
    | "integer"
    | "double"
    | "float"
    | "boolean"
    | "enum"
    | "set"
    | "list"
    | "json" | "option" | 'any' | 'custom'

interface ParamConfigBase {
    component?: {
        //使用自定义组件
        inputParam?: ParamComponent;//编辑字段组件
    }
    config?: any
    type: ParamTypeName;
}

interface Param {
    //参数的描述
    des?: string
    name: string
    config: ParamConfig
}


interface StringParamConfig extends ParamConfigBase {
    type: "string"
    config?: {
        len?: number | { max?: number, min?: number }
        re?: string,
        type?: 'text' | 'textarea'
    }
}

interface TextParamConfig extends ParamConfigBase {
    type: "text"
    config?: {
        len?: { max?: number, min?: number }
    }
}

interface DatetimeParamConfig extends ParamConfigBase {
    type: "datetime"
}

interface DateParamConfig extends ParamConfigBase {
    type: "date"
}

interface IntegerParamConfig extends ParamConfigBase {
    type: "integer"
    config?: {
        max?: number
        min?: number
    }
}

interface OptionParamConfig extends ParamConfigBase {
    type: "option"
    config?: {
        valueType: 'string' | 'integer' | 'float'
    }
}

interface DoubleParamConfig extends ParamConfigBase {
    type: "double"
    config?: {
        max?: number
        min?: number
    }
}

interface FloatParamConfig extends ParamConfigBase {
    type: "float"
    config?: {
        max?: number
        min?: number
    }
}

interface BooleanParamConfig extends ParamConfigBase {
    type: "boolean"
}

interface EnumParamConfig extends ParamConfigBase {
    type: "enum"
    config: {
        options: any[] | { name: string, value: any }[]
    }
}

interface SetParamConfig extends ParamConfigBase {
    type: "set",
    config: {
        options: any[] | { name: string, value: any }[]
    }
}

interface ListParamConfig extends ParamConfigBase {
    type: "list"
    config: {
        options: any[] | { name: string, value: any }[]
    }
}

interface JsonParamConfig extends ParamConfigBase {
    type: "json"
    config: {
        schema: JsonTableModel
    }
}

interface AnyParamConfig extends ParamConfigBase {
    type: "any"
}

interface CustomParamConfig extends ParamConfigBase {
    type: "custom"
    config: {
        name: string
    }
}


type ParamConfig =
    StringParamConfig
    | TextParamConfig
    | DateParamConfig
    | DoubleParamConfig
    | DatetimeParamConfig
    | ListParamConfig
    | SetParamConfig
    | FloatParamConfig
    | IntegerParamConfig
    | JsonParamConfig
    | BooleanParamConfig
    | EnumParamConfig
    | OptionParamConfig
    | AnyParamConfig
    | CustomParamConfig

interface ParamComponent {
    component: any;
    props?: any;
}

interface JsonTableModel {
    params: Param[]
    props?: {
        //在表格中隐藏的字段
        hiddenParams?: string[]
    }
}


export type {
    Param,
    TextParamConfig,
    DateParamConfig,
    DoubleParamConfig,
    DatetimeParamConfig,
    ListParamConfig,
    SetParamConfig,
    FloatParamConfig,
    IntegerParamConfig,
    JsonParamConfig,
    BooleanParamConfig,
    EnumParamConfig,
    StringParamConfig,
    OptionParamConfig
}

