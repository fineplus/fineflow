import type { FlowModelType } from "@/api/database/db/flow";
import { CrudApi } from "../../tcrudApi";

interface FlowServerModelType {
  name: string;
  key: string;
  href: string;
  enable: boolean;
}

export type { FlowServerModelType };
export { FlowServerModel };

class FlowServerModel {
  model: CrudApi;
  constructor() {
    this.model = new CrudApi("/fineflow/flow/server", "key");
  }

  async add(data: FlowServerModelType) {
    const { key, name, href, enable } = data;
    if (!(key && name && href)) {
      return { msg: "字段为空", state: 0, data: null };
    }
    const res = await this.model.add({ key, name, href, enable });
    return { msg: "", state: 1, data: res.data };
  }

  async update(data: FlowServerModelType) {
    if (!data.key) {
      return { msg: "字段为空", state: 0 };
    }
    await this.model.update(data);
    return { msg: "更新成功", state: 1 };
  }

  async delete(key: string) {
    const res = await this.model.delete(key);
    return { msg: "删除成功", state: 1 };
  }

  async all() {
    const res = await this.model.all();
    console.log(res)
    res.data.items.forEach(item => item.enable=JSON.parse(item.enable))
    return { state: 1, data: res.data.items, msg: "" };
  }

  async get(key: string) {
    const res = await this.model.get(key);
    return { state: 1, data: res.data, msg: "" };
  }
}
