import {ElMessage} from "element-plus";
import {api} from "./api";
import {allDb} from "@/utils/loadDb";

type QueryExpress =
    | "="
    | ">"
    | "<"
    | "<="
    | ">="
    | "like"
    | "in"
    | "range"
    | "find_in_set";

interface QueryParam {
    name: string;
    type: QueryExpress;
    model?: "and" | "or";
    value: any;
}

export interface OrderParam {
    [key: string]: "asc" | "desc" | null;
}

interface Query {
    params?: QueryParam[];
    order?: OrderParam;
    relation_use_id?: boolean;
    page: number;
    page_size: number;
}

class CrudApi {
    baseUrl: string;
    idKey: string;

    constructor(baseUrl: string, idKey = "id") {
        this.baseUrl = baseUrl;
        this.idKey = idKey;
        this.table = this.baseUrl.split('/').slice(-1)[0];
        console.log(this.table)
    }


    async get(itemId: any) {
        try {
            const data = await allDb.db.select(`select * from ${this.table} where ${this.idKey}=${typeof itemId =='string'?`"${itemId}"`:itemId}`);
            if (data.length > 0) {
                return {data: data[0]};
            }
        } catch (e) {
            ElMessage.warning(e);
            throw e;
        }
    }

    async all() {
        try {
            console.log(allDb.db, `select * from ${this.table}`)
            return {data: {items: await allDb.db.select(`select * from ${this.table}`)}};
        } catch (e) {
            ElMessage.warning(e);
            throw e;
        }
    }

    async add(newData: any) {
        try {
            console.log(newData, 'newData')
            const data = await allDb.db.execute(
                `INSERT into ${this.table}  (${Object.keys(newData).join(',')}) VALUES (${ Object.keys(newData).map((_,i)=>'$'+(i+1)).join(',')})`,
                Object.keys(newData).map(key => newData[key]),
            );
            return {data: newData}
        } catch (e) {
            ElMessage.warning(e);
            throw e;
        }
    }

    async update(newData) {
        try {
            // 获取newData的键值对，排除id（假设用于WHERE条件）
            const keys = Object.keys(newData).filter(key => key !== this.idKey);

            // 生成 SET 子句
            const setClause = keys.map((key, i) => `${key} = $${i + 1}`).join(', ');

            // 执行更新操作
            const data = await allDb.db.execute(
                `UPDATE ${this.table} SET ${setClause} WHERE ${this.idKey} = $${keys.length + 1}`,
                [...keys.map(key => newData[key]), newData[this.idKey]],  // 添加更新的数据和id到参数列表
            );
            return {data}
        } catch (e) {
            ElMessage.warning(e);
            throw e;
        }
    }


    async delete(itemId) {
        try {
            // 执行删除操作，假设 `idKey` 是用来匹配的字段名，如 "id"
            return allDb.db.execute(
                `DELETE FROM ${this.table} WHERE ${this.idKey} = $1`,
                [itemId]  // 将itemId传入参数
            );
        } catch (e) {
            ElMessage.warning(e);
            throw e;
        }
    }


    async queryCommon(query: Query) {
        try {
            return await api.post<any, any>(this.baseUrl + "/query", query);
        } catch (e) {
            if (e.response?.data?.detail) {
                ElMessage.warning(e.response?.data?.detail);
            }
            throw e;
        }
    }
}

export {CrudApi};
export type {Query, QueryParam, QueryExpress};
