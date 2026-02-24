const API_BASE = "https://khajurkart.onrender.com/api";

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
