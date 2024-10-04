import React from "react";

import { login } from "./Actions";

export default function LoginDialog() {
  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [save, setSave] = React.useState(false);
  return (
    <div className="flex flex-col items-center">
      <h1 className="text-4xl font-bold">登录</h1>
      <input
        className="border border-gray-300 rounded-lg p-2 m-2"
        type="text"
        placeholder="用户名"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <input
        className="border border-gray-300 rounded-lg p-2 m-2"
        type="password"
        placeholder="密码"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <label className="flex items-center m-2">
        <input
          type="checkbox"
          checked={save}
          onChange={(e) => setSave(e.target.checked)}
        />
        <span className="ml-2">保存凭据以自动登录</span>
      </label>
      <button
        type="button"
        className="bg-blue-500 text-white rounded-lg p-2 m-2"
        onClick={() => login(username, password, save)}
      >
        登录
      </button>
    </div>
  )
}
