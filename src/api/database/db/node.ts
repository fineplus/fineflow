import Dexie, { type Table } from "dexie";
import type { CategoryNameFlow, FlowModelType, ModNameFlow } from "@/api/database/db/flow";
import type { FlowServerModelType } from "@/api/database/db/server";
import { CrudApi } from "../../tcrudApi";
import {generateID} from "@/components/api-flow/common-utils";

interface ModName {
  id?: number;
  name?: string;
}

interface CategoryName {
  id?: number;
  name?: string;
  modNameId?: number;
}

interface NodeModelType {
  key?: string;
  name?: string;
  categoryNameId?: number;
  content?: string;
}

class Model {
  constructor(url: string) {}
}

class ModNameModel {
  model: CrudApi;
  constructor() {
    this.model = new CrudApi("/fineflow/flow/mod_name");
  }
  async add(name: string) {
    const res = await this.model.add({ name ,id:generateID() });
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

class CategoryNameModel {
  model: CrudApi;
  constructor() {
    this.model = new CrudApi("/fineflow/flow/category_name");
  }

  async add(name: string, modNameId: number) {
    if (!(name && modNameId)) {
      return { msg: "字段为空", state: 0 };
    }
    const res = await this.model.add({ name, modNameId ,id:generateID() });
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

class NodeModel {
  model: CrudApi;
  constructor() {
    this.model = new CrudApi("/fineflow/flow/node", "key");
  }
  async add(
    key: string,
    name: string,
    categoryNameId: number,
    content: string
  ) {
    if (!(key && name && categoryNameId)) {
      return { msg: "字段为空", state: 0, data: null };
    }
    const res = await this.model.add({
      key,
      name,
      categoryNameId,
      content,
    });
    return {
      msg: "",
      state: 1,
      data: res.data,
    };
  }

  async update(node: NodeModelType) {
    if (!node.key) {
      return { msg: "字段为空", state: 0 };
    }
    await this.model.update(node);
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

// const nodeModel = new NodeModel();
// const modNameModel = new ModNameModel();
// const categoryNameModel = new CategoryNameModel();

export {  ModNameModel,CategoryNameModel,NodeModel };
export type { NodeModelType, CategoryName, ModName };
