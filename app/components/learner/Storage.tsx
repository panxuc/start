import { cipher, decipher, STORAGE_SALT } from './Crypto';

export function storeCredential(username: string, password: string) {
  const cipherImpl = cipher(STORAGE_SALT);
  localStorage.setItem("username", cipherImpl(username));
  localStorage.setItem("password", cipherImpl(password));
}

export function getStoredCredential() {
  const decipherImpl = decipher(STORAGE_SALT);
  const username = localStorage.getItem("username");
  const password = localStorage.getItem("password");
  return {
    username: username ? decipherImpl(username) : "",
    password: password ? decipherImpl(password) : "",
  };
}

export function removeStoredCredential() {
  localStorage.removeItem("username");
  localStorage.removeItem("password");
}
