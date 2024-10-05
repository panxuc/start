import { ApiError } from "thu-learn-lib";

import helper from "./Helper";
import { storeCredential } from "./Storage";

export async function login(username: string, password: string, save: boolean) {
  const timeout = new Promise((_, reject) => {
    setTimeout(() => {
      reject({ reason: 'TIMEOUT' });
    }, 5000);
  });

  try {
    await Promise.race([helper.login(username, password), timeout]);
  } catch (e) {
    const error = e as ApiError;
    alert(`登录失败: ${error?.reason ?? error.toString() ?? `未知错误`}`);
    return Promise.reject(`login failed: ${error}`);
  }

  if (save) {
    storeCredential(username, password);
  }

  return Promise.resolve();
}
