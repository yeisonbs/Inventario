export const API_URL = import.meta.env.PUBLIC_API_URL || '';

export async function getInventory() {
  if (!API_URL) return [];
  try {
    const response = await fetch(API_URL);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching inventory:', error);
    throw error;
  }
}

export async function createProduct(productData) {
  if (!API_URL) throw new Error("API_URL is not defined");
  
  const payload = {
    action: "create",
    data: productData
  };

  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "text/plain;charset=utf-8",
    },
    body: JSON.stringify(payload)
  });

  return await response.json();
}

export async function updateProduct(sku, productData) {
  if (!API_URL) throw new Error("API_URL is not defined");

  const payload = {
    action: "update",
    sku,
    data: productData
  };

  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "text/plain;charset=utf-8",
    },
    body: JSON.stringify(payload)
  });

  return await response.json();
}

export async function deleteProduct(sku) {
  if (!API_URL) throw new Error("API_URL is not defined");

  const payload = {
    action: "delete",
    sku
  };

  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "text/plain;charset=utf-8",
    },
    body: JSON.stringify(payload)
  });

  return await response.json();
}
