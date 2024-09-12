import { ElMessage } from "element-plus";
import { api } from "./api";

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
  }

  async get(itemId: any) {
    try {
      return await api.post<any, any>(this.baseUrl + "/get", {
        [this.idKey]: itemId,
      });
    } catch (e) {
      if (e.response?.data?.detail) {
        ElMessage.warning(e.response?.data?.detail);
      }
      throw e;
    }
  }
  async all() {
    try {
      return await api.post<any, any>(this.baseUrl + "/all", {});
    } catch (e) {
      if (e.response?.data?.detail) {
        ElMessage.warning(e.response?.data?.detail);
      }
      throw e;
    }
  }

  async add(newData: any) {
    try {
      return await api.post<any, any>(this.baseUrl + "/add", newData);
    } catch (e) {
      if (e.response?.data?.detail) {
        ElMessage.warning(e.response?.data?.detail);
      }
      throw e;
    }
  }

  async update(newData) {
    try {
      return await api.post<any, any>(this.baseUrl + "/update", newData);
    } catch (e) {
      if (e.response?.data?.detail) {
        ElMessage.warning(e.response?.data?.detail);
      }
      throw e;
    }
  }

  async delete(itemId: any) {
    try {
      return await api.post<any, any>(this.baseUrl + "/delete", {
        [this.idKey]: itemId,
      });
    } catch (e) {
      if (e.response?.data?.detail) {
        ElMessage.warning(e.response?.data?.detail);
      }
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

export { CrudApi };
export type { Query, QueryParam, QueryExpress };
