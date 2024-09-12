import createClient from "openapi-fetch";
import { paths } from "./schema";
// import {formatToken, getToken} from "@/utils/auth";
// import {useUserStoreHook} from "@/store/modules/user";
import { FilterKeys, PathsWithMethod } from "openapi-typescript-helpers";
import { FetchOptions } from "openapi-fetch/src";

let timeoutPromise = (timeout: number) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      reject("服务器地址不可用");
    }, timeout);
  });
};

function createSmebizClient<Paths extends {}>(
  clientOptions: Parameters<typeof createClient>[0] = {},
  timeout?: number
) {
  const baseClient = createClient<Paths>(clientOptions);
  return {
    ...baseClient,
    async post<P extends PathsWithMethod<Paths, "post">>(
      url: P,
      body?: FetchOptions<FilterKeys<Paths[P], "post">>["body"],
      init?: FetchOptions<FilterKeys<Paths[P], "post">>
    ) {
      if (!init) init = {} as FetchOptions<FilterKeys<Paths[P], "post">>;
      if (body) init.body = body;
      if (!init.headers) init.headers = {};
      // const userData = getToken();
      // if (userData) {
      //   const now = new Date().getTime();
      //   const expired = parseInt(userData.expires) - now <= 0;
      //   if (expired) {
      //     useUserStoreHook().logOut();
      //   } else {
      //     init.headers["Authorization"] = formatToken(userData.accessToken);
      //   }
      // }
      if (timeout) {
        let controller = new AbortController();
        init.signal = controller.signal;
        setTimeout(() => {
          // 当时间到达之后运行 abort
          controller.abort();
        }, timeout);
      }

      return await baseClient.POST(url, init);
    },
  };
}

export const sapi = createSmebizClient<paths>({ baseUrl: "" }, 10000);

//
// export const sApi = new Proxy(baseClient, {
//   get(_, key: keyof typeof baseClient) {
//     const headers = {}
//     const data = getToken();
//     if (data) {
//       const now = new Date().getTime();
//       const expired = parseInt(data.expires) - now <= 0;
//       if (expired) {
//         useUserStoreHook().logOut();
//       } else {
//         headers["Authorization"] = formatToken(data.accessToken);
//       }
//     }
//     const newClient = createClient<paths>({
//       headers: headers,
//       baseUrl: "",
//     });
//     return newClient[key];
//   },
// });
// sPost('/file-receive/rate/rate_serve/get')
