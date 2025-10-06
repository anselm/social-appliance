export async function postJSON<T>(url: string, body: unknown): Promise<T> {
  const baseURL = import.meta.env.VITE_API_BASE_URL || '';
  const fullURL = baseURL + url;
  
  const r = await fetch(fullURL, {
    method: "POST",
    headers: { 
      "content-type": "application/json",
      ...(localStorage.getItem('authToken') ? {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      } : {})
    },
    credentials: "include",
    body: JSON.stringify(body),
  });
  
  if (!r.ok) {
    const errorText = await r.text();
    throw new Error(`${url} => ${r.status}: ${errorText}`);
  }
  
  return r.json();
}

export async function getJSON<T>(url: string): Promise<T> {
  const baseURL = import.meta.env.VITE_API_BASE_URL || '';
  const fullURL = baseURL + url;
  
  const r = await fetch(fullURL, {
    method: "GET",
    headers: {
      ...(localStorage.getItem('authToken') ? {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      } : {})
    },
    credentials: "include",
  });
  
  if (!r.ok) {
    const errorText = await r.text();
    throw new Error(`${url} => ${r.status}: ${errorText}`);
  }
  
  return r.json();
}
