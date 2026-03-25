const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000";

const getToken = () => localStorage.getItem("it-asset-token");

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const token = getToken();
    const res = await fetch(`${API_BASE}${path}`, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...options.headers,
        },
    });
    if (!res.ok) throw new Error(`Request failed: ${res.status}`);
    return res.json();
}

export const api = {
    get: <T>(path: string) => request<T>(path),
    post: <T>(path: string, body: unknown) => request<T>(path, { method: "POST", body: JSON.stringify(body) }),
    put: <T>(path: string, body: unknown) => request<T>(path, { method: "PUT", body: JSON.stringify(body) }),
    delete: <T>(path: string) => request<T>(path, { method: "DELETE" }),
};