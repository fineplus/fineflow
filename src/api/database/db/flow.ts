import { CrudApi } from "../../tcrudApi";
import {generateID} from "@/components/api-flow/common-utils";

interface ModNameFlow {
  id?: number;
  name?: string;
}

interface CategoryNameFlow {
  id?: number;
  name?: string;
  modNameFlowId?: number;
}

interface FlowModelType {
  key?: string;
  name?: string;
  categoryNameFlowId?: number;
  content?: string;
}

class ModNameFlowModel {
  model: CrudApi;
  constructor() {
    this.model = new CrudApi("/fineflow/flow/flow_mod_name");
  }

  async add(name: string) {
    const res = await this.model.add({ name,id:generateID() });
    return { msg: "", state: 1, data: res.data };
  }

  async update(id: number, name: string) {
    await this.model.update({ id, name });
    return { msg: "更新成功", state: 1 };
  }

  async delete(id: number) {
    const res = await this.model.delete(id);
    return { msg: "删除成功", state: 1 };
  }

  async all() {
    const res = await this.model.all();
    return { state: 1, data: res.data.items };
  }

  async get(id: number) {
    const item = await this.model.get(id);
    return { state: 1, data: item.data };
  }
}

class CategoryNameFlowModel {
  model: CrudApi;
  constructor() {
    this.model = new CrudApi("/fineflow/flow/flow_category_name");
  }

  async add(name: string, modNameFlowId: number) {
    if (!(name && modNameFlowId)) {
      return { msg: "字段为空", state: 0 };
    }
    const res = await this.model.add({ name, modNameFlowId,id:generateID()  });
    return { msg: "", state: 1, data: res.data };
  }

  async update(id: number, name: string) {
    if (!(id && name)) {
      return { msg: "字段为空", state: 0 };
    }
    const res = await this.model.update({ id, name });
    return { msg: "更新成功", state: 1 };
  }

  async delete(id: number) {
    const res = await this.model.delete(id);
    return { msg: "删除成功", state: 1 };
  }

  async all() {
    const res = await this.model.all();
    return { state: 1, data: res.data.items };
  }

  async get(id: number) {
    const item = await this.model.get(id);
    return { state: 1, data: item.data };
  }
}

class FlowModel {
  model: CrudApi;
  constructor() {
    this.model = new CrudApi("/fineflow/flow/flow", "key");
  }

  async add(
    key: string,
    name: string,
    categoryNameFlowId: number,
    content: string
  ) {
    if (!(key && name && categoryNameFlowId)) {
      return { msg: "字段为空", state: 0, data: null };
    }
    const res = await this.model.add({
      key,
      name,
      categoryNameFlowId,
      content,
    });
    return {
      msg: "",
      state: 1,
      data: res.data,
    };
  }

  async update(flow: FlowModelType) {
    if (!flow.key) {
      return { msg: "字段为空", state: 0 };
    }
    await this.model.update(flow);
    return { msg: "更新成功", state: 1 };
  }

  async delete(key: string) {
    await this.model.delete(key);
    return { msg: "删除成功", state: 1 };
  }

  async all() {
    const res = await this.model.all();
    return { state: 1, data: res.data.items };
  }

  async get(key: string) {
    const res = await this.model.get(key);
    return { state: 1, data: res.data };
  }
}

// const flowModel = new FlowModel();
// const modNameFlowModel = new ModNameFlowModel();
// const categoryNameFlowModel = new CategoryNameFlowModel();

export { FlowModel, ModNameFlowModel, CategoryNameFlowModel };
export type { FlowModelType, CategoryNameFlow, ModNameFlow };
