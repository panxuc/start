import { STORAGE_KEY_PASSWORD, STORAGE_KEY_USERNAME, STORAGE_SALT } from '../constants';
import { cipher, decipher } from './crypto';

export async function storeCredential(username: string, password: string) {
  const cipherImpl = cipher(STORAGE_SALT);
  localStorage.setItem(STORAGE_KEY_USERNAME, cipherImpl(username));
  localStorage.setItem(STORAGE_KEY_PASSWORD, cipherImpl(password));
}

export async function getStoredCredential() {
  const username = localStorage.getItem(STORAGE_KEY_USERNAME);
  const password = localStorage.getItem(STORAGE_KEY_PASSWORD);
  if (username && password) {
    const decipherImpl = decipher(STORAGE_SALT);
    return {
      username: decipherImpl(username),
      password: decipherImpl(password),
    };
  }
  return undefined;
}

export async function removeStoredCredential() {
  localStorage.removeItem(STORAGE_KEY_USERNAME);
  localStorage.removeItem(STORAGE_KEY_PASSWORD);
}
