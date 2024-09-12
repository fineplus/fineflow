import type {Param} from "../../../engine/param-types";

export function copy(obj: any) {
  return obj ? JSON.parse(JSON.stringify(obj)) : obj
}

export function getValueFromPath(path, data) {
  if (path.includes('.')) {
    let pathData = data
    let keys = path.split(".")
    const findKeys = keys.slice(0, -1)
    const getKey = keys[keys.length - 1]
    findKeys.forEach(key => {
      if (!pathData[key]) {
        pathData[key] = {}
      }
      pathData = pathData[key]
    })
    return pathData[getKey]
  } else {
    return data[path]
  }
}

export function setValueFromPath(path, value, data) {
  if (path.includes('.')) {
    let pathData = data
    let keys = path.split(".")
    const findKeys = keys.slice(0, -1)
    const setKey = keys[keys.length - 1]
    findKeys.forEach(key => {
      if (!pathData[key]) {
        pathData[key] = {}
      }
      pathData = pathData[key]
    })
    pathData[setKey] = value
  } else {
    data[path] = value
  }
}

// export function getParamDefaultValue(param: Param) {
//   if (param.default !== undefined) {
//     return copy(param.default)
//   } else if (param.type == 'string') {
//     return ""
//   } else if (param.type == 'integer') {
//     return 0
//   } else if (param.type == 'float') {
//     return 0.0
//   } else if (param.type == 'double') {
//     return 0.0
//   } else if (param.type == 'text') {
//     return ""
//   } else if (param.type == 'enum') {
//     return null
//   } else if (param.type == 'boolean') {
//     return false
//   } else if (param.type == 'set') {
//     return []
//   } else if (param.type == 'list') {
//     return []
//   } else if (param.type == 'date') {
//     return null
//   } else if (param.type == 'datetime') {
//     return null
//   }
// }




