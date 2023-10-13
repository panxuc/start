import React from "react";

interface LoginData {
  username: string;
  password: string;
  save: boolean;
}

export default function LoginDialog() {
  const [loginData, setLoginData] = React.useState<LoginData>({ username: '', password: '', save: false });
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/learner/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginData),
      });
      const result = await response.json();
      setLoading(false);
      if (response.ok) {
        alert('Login Successful');
      } else {
        setError(result.message);
      }
    } catch (er) {
      setLoading(false);
      setError('Login Failed')
    }
  }

  return (
    <form
      className="flex flex-col items-center"
      onSubmit={handleSubmit}
    >
      <input
        className="border border-gray-300 rounded-lg p-2 m-2"
        type="text"
        placeholder="用户名"
        value={loginData.username}
        onChange={(e) => setLoginData({ ...loginData, username: e.target.value })}
      />
      <input
        className="border border-gray-300 rounded-lg p-2 m-2"
        type="password"
        placeholder="密码"
        value={loginData.password}
        onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
      />
      <label className="flex items-center m-2">
        <input
          type="checkbox"
          checked={loginData.save}
          onChange={(e) => setLoginData({ ...loginData, save: e.target.checked })}
        />
        <span className="ml-2">保存凭据以自动登录</span>
      </label>
      <button
        className="bg-blue-500 text-white rounded-lg p-2 m-2"
        type="submit"
        disabled={loading}
      >
        {loading ? '登录中……' : '登录'}
      </button>
      {error && <p className="text-red-500">{error}</p>}
    </form>
  )
}
