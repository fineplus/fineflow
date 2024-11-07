import {generateID} from "@/components/api-flow/common-utils";
import {ModelApi} from "./utils";
import {locales} from "@/locale";

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


interface FlowServerModelType {
    name: string;
    key: string;
    href: string;
    enable: boolean;
}

class ModNameModel {
    model: ModelApi;
    constructor() {
        this.model = new ModelApi("mod_name");
    }
    async add(name: string) {
        const res = await this.model.add({ name ,id:generateID() });
        return { msg: "", state: 1, data: res.data };
    }

    async update(id: number, name: string) {
        await this.model.update({ id, name });
        return { msg: locales.t("words.update_success"), state: 1 };
    }

    async delete(id: number) {
        const res = await this.model.delete(id);
        return { msg: locales.t("words.delete_success"), state: 1 };
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
    model: ModelApi;
    constructor() {
        this.model = new ModelApi("category_name");
    }

    async add(name: string, modNameId: number) {
        if (!(name && modNameId)) {
            return { msg: locales.t("words.empty_field"), state: 0 };
        }
        const res = await this.model.add({ name, modNameId ,id:generateID() });
        return { msg: "", state: 1, data: res.data };
    }

    async update(id: number, name: string) {
        if (!(id && name)) {
            return { msg: locales.t("words.empty_field"), state: 0 };
        }
        const res = await this.model.update({ id, name });
        return { msg: locales.t("words.update_success"), state: 1 };
    }

    async delete(id: number) {
        const res = await this.model.delete(id);
        return { msg: locales.t("words.delete_success"), state: 1 };
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
    model: ModelApi;
    constructor() {
        this.model = new ModelApi("node", "key");
    }
    async add(
        key: string,
        name: string,
        categoryNameId: number,
        content: string
    ) {
        if (!(key && name && categoryNameId)) {
            return { msg: locales.t("words.empty_field"), state: 0, data: null };
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
        console.log(locales.t,'locales.t')
        if (!node.key) {
            return { msg: locales.t("words.empty_field"), state: 0 };
        }
        await this.model.update(node);
        return { msg: locales.t("words.update_success"), state: 1 };
    }

    async delete(key: string) {
        await this.model.delete(key);
        return { msg: locales.t("words.delete_success"), state: 1 };
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


class ModNameFlowModel {
    model: ModelApi;
    constructor() {
        this.model = new ModelApi("flow_mod_name");
    }

    async add(name: string) {
        const res = await this.model.add({ name,id:generateID() });
        return { msg: "", state: 1, data: res.data };
    }

    async update(id: number, name: string) {
        await this.model.update({ id, name });
        return { msg: locales.t("words.update_success"), state: 1 };
    }

    async delete(id: number) {
        const res = await this.model.delete(id);
        return { msg: locales.t("words.delete_success"), state: 1 };
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
    model: ModelApi;
    constructor() {
        this.model = new ModelApi("flow_category_name");
    }

    async add(name: string, modNameFlowId: number) {
        if (!(name && modNameFlowId)) {
            return { msg: locales.t("words.empty_field"), state: 0 };
        }
        const res = await this.model.add({ name, modNameFlowId,id:generateID()  });
        return { msg: "", state: 1, data: res.data };
    }

    async update(id: number, name: string) {
        if (!(id && name)) {
            return { msg: locales.t("words.empty_field"), state: 0 };
        }
        const res = await this.model.update({ id, name });
        return { msg: locales.t("words.update_success"), state: 1 };
    }

    async delete(id: number) {
        const res = await this.model.delete(id);
        return { msg: locales.t("words.delete_success"), state: 1 };
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
    model: ModelApi;
    constructor() {
        this.model = new ModelApi("flow", "key");
    }

    async add(
        key: string,
        name: string,
        categoryNameFlowId: number,
        content: string
    ) {
        if (!(key && name && categoryNameFlowId)) {
            return { msg: locales.t("words.empty_field"), state: 0, data: null };
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
            return { msg: locales.t("words.empty_field"), state: 0 };
        }
        await this.model.update(flow);
        return { msg: locales.t("words.update_success"), state: 1 };
    }

    async delete(key: string) {
        await this.model.delete(key);
        return { msg: locales.t("words.delete_success"), state: 1 };
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


class FlowServerModel {
    model: ModelApi;
    constructor() {
        this.model = new ModelApi("server", "key");
    }

    async add(data: FlowServerModelType) {
        const { key, name, href, enable } = data;
        if (!(key && name && href)) {
            return { msg: locales.t("words.empty_field"), state: 0, data: null };
        }
        const res = await this.model.add({ key, name, href, enable });
        return { msg: "", state: 1, data: res.data };
    }

    async update(data: FlowServerModelType) {
        if (!data.key) {
            return { msg: locales.t("words.empty_field"), state: 0 };
        }
        await this.model.update(data);
        return { msg: locales.t("words.update_success"), state: 1 };
    }

    async delete(key: string) {
        const res = await this.model.delete(key);
        return { msg: locales.t("words.delete_success"), state: 1 };
    }

    async all() {
        const res = await this.model.all();
        res.data.items.forEach(item => item.enable=JSON.parse(item.enable))
        return { state: 1, data: res.data.items, msg: "" };
    }

    async get(key: string) {
        const res = await this.model.get(key);
        return { state: 1, data: res.data, msg: "" };
    }
}
const db = {
    nodeModel: new NodeModel(),
    modNameModel: new ModNameModel(),
    categoryNameModel: new CategoryNameModel(),
    flowServerModel: new FlowServerModel(),
    flowModel: new FlowModel(),
    categoryNameFlowModel: new CategoryNameFlowModel(),
    modNameFlowModel: new ModNameFlowModel(),
}
export { db }
export type {ModNameFlow, CategoryNameFlow, FlowModelType, ModName, CategoryName, NodeModelType, FlowServerModelType};

