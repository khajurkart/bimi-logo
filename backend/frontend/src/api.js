// frontend/src/api.js
const API_BASE = "https://khajurkart.com/api";  // <-- Replace with your deployed backend URL

export async function login(email, password) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  return res.json();
}

export async function getProducts() {
  const res = await fetch(`${API_BASE}/products`);
  return res.json();
}

export async function getCategories() {
  const res = await fetch(`${API_BASE}/categories`);
  return res.json();
}