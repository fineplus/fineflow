import * as apiDb from "./db/index"

let dbUse = apiDb

const db = {
    nodeModel: new dbUse.NodeModel(),
    modNameModel: new dbUse.ModNameModel(),
    categoryNameModel: new dbUse.CategoryNameModel(),
    flowServerModel: new dbUse.FlowServerModel(),
    flowModel: new dbUse.FlowModel(),
    categoryNameFlowModel: new dbUse.CategoryNameFlowModel(),
    modNameFlowModel: new dbUse.ModNameFlowModel(),
}
export { db }