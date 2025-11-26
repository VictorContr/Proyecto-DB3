// Base client para seleccionar y consumir la API disponible (MySQL primero, luego SQLite)
// Expone una clase con helpers y una función para obtener el base URL.

const MYSQL_PORT_DEFAULT = Number(
  (typeof process !== "undefined" && process.env && process.env.API_MYSQL_PORT) ||
  3300
);
const SQLITE_PORT_DEFAULT = (() => {
  if (typeof process !== "undefined" && process.env && process.env.API_SQLITE_PORT) {
    const n = Number(process.env.API_SQLITE_PORT);
    if (!Number.isNaN(n) && n > 0) return n;
  }
  if (typeof document !== "undefined") {
    const p = new URL(document.location.href).port;
    if (p) {
      const n = Number(p);
      if (!Number.isNaN(n) && n > 0) return n;
    }
  }
  return 3000;
})();
const PROBE_PATH = "/api/usuarios"; // endpoint liviano GET en ambas APIs
const DEFAULT_TIMEOUT_MS = 1500;

function buildUrl(base, path) {
  if (!base) return null;
  if (!path) return base;
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${base}${p}`;
}

async function probe(url, timeoutMs = DEFAULT_TIMEOUT_MS) {
  try {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeoutMs);
    const res = await fetch(url, { method: "GET", signal: controller.signal });
    clearTimeout(id);
    return res.ok;
  } catch (_) {
    return false;
  }
}

class ApiGuide_vc_bb {
  static initialized = false;
  static baseUrl = `http://localhost:${SQLITE_PORT_DEFAULT}`; // fallback por defecto
  static primary = null; // 'mysql' | 'sqlite'
  static fallbackBaseUrl = `http://localhost:${SQLITE_PORT_DEFAULT}`;
  static readyPromise = null;
  static connectionState = 'unknown'; // 'unknown' | 'online' | 'offline' | 'error'
  static notifying = false;

  static async initialize(options = {}) {
    if (this.initialized) return;
    const mysqlPort = Number(options.mysqlPort || MYSQL_PORT_DEFAULT);
    const sqlitePort = Number(options.sqlitePort || SQLITE_PORT_DEFAULT);

    const mysqlBase = `http://localhost:${mysqlPort}`;
    const sqliteBase = `http://localhost:${sqlitePort}`;

    // Probar MySQL primero
    const mysqlOk = await probe(buildUrl(mysqlBase, PROBE_PATH));
    if (mysqlOk) {
      this.baseUrl = mysqlBase;
      this.primary = "mysql";
      this.fallbackBaseUrl = sqliteBase;
      this.initialized = true;
      return;
    }

    // Si MySQL no responde, probar SQLite
    const sqliteOk = await probe(buildUrl(sqliteBase, PROBE_PATH));
    if (sqliteOk) {
      this.baseUrl = sqliteBase;
      this.primary = "sqlite";
      this.fallbackBaseUrl = mysqlBase;
      this.initialized = true;
      return;
    }

    // Si ninguno responde, mantener defaults (SQLite) para no romper UI
    this.primary = "sqlite";
    this.initialized = true;
  }

  static absolute(path) {
    return buildUrl(this.baseUrl, path);
  }

  static async request(method, path, { headers = {}, body = undefined, timeoutMs = DEFAULT_TIMEOUT_MS } = {}) {
    const mysqlBase = `http://localhost:${MYSQL_PORT_DEFAULT}`;
    const sqliteBase = `http://localhost:${SQLITE_PORT_DEFAULT}`;
    const urlMySQL = buildUrl(mysqlBase, path);
    const urlSQLite = buildUrl(sqliteBase, path);
    // Intentar ONLINE (MySQL) primero
    const ctrl1 = new AbortController();
    const t1 = setTimeout(() => ctrl1.abort(), timeoutMs);
    try {
      const res1 = await fetch(urlMySQL, { method, headers, body, signal: ctrl1.signal });
      clearTimeout(t1);
      if (res1.ok) {
        await this.notifyOnline_vc_bb();
        return res1;
      }
      // MySQL respondió pero con error 4xx/5xx: avisar y probar OFFLINE
      const res2 = await fetch(urlSQLite, { method, headers, body });
      if (res2.ok) {
        await this.notifyOffline_vc_bb();
        return res2;
      }
      await this.notifyError_vc_bb();
      return res2;
    } catch (err1) {
      clearTimeout(t1);
      // No se pudo conectar a ONLINE (MySQL): avisar y probar OFFLINE
      const ctrl2 = new AbortController();
      const t2 = setTimeout(() => ctrl2.abort(), timeoutMs);
      try {
        const res2 = await fetch(urlSQLite, { method, headers, body, signal: ctrl2.signal });
        clearTimeout(t2);
        if (res2.ok) {
          await this.notifyOffline_vc_bb();
          return res2;
        }
        await this.notifyError_vc_bb();
        return res2;
      } catch (err2) {
        clearTimeout(t2);
        await this.notifyError_vc_bb();
        throw err2;
      }
    }
  }

  static async notifyOnline_vc_bb() {
    if (this.connectionState === 'online') return;
    this.connectionState = 'online';
    if (typeof globalThis !== 'undefined' && typeof globalThis.modal_vc_bb !== 'undefined') {
      await globalThis.modal_vc_bb.showSuccess_vc_bb('Conexión', 'Estas Online.');
    }
  }

  static async notifyOffline_vc_bb() {
    if (this.connectionState === 'offline') return;
    this.connectionState = 'offline';
    if (typeof globalThis !== 'undefined' && typeof globalThis.modal_vc_bb !== 'undefined') {
      await globalThis.modal_vc_bb.showError_vc_bb('Conexión', 'Error de conexión online... probando offline');
      await globalThis.modal_vc_bb.showSuccess_vc_bb('Conexión', 'Estas Offline.');
    }
  }

  static async notifyError_vc_bb() {
    if (this.connectionState === 'error') return;
    this.connectionState = 'error';
    if (typeof globalThis !== 'undefined' && typeof globalThis.modal_vc_bb !== 'undefined') {
      await globalThis.modal_vc_bb.showError_vc_bb('Conexión', 'Error de conexión en ONLINE Y OFFLINE');
    }
  }

  static async json(method, path, payload = undefined, headers = {}) {
    const finalHeaders = { "Content-Type": "application/json", ...headers };
    const body = payload !== undefined ? JSON.stringify(payload) : undefined;
    const res = await this.request(method, path, { headers: finalHeaders, body });
    let data = null;
    try {
      data = await res.json();
    } catch (_) {
      data = null;
    }
    return { ok: res.ok, status: res.status, data };
  }
}

// Inicialización inmediata; expone en window para consumo simple
(async () => {
  try {
    await ApiGuide_vc_bb.initialize();
  } catch (e) {
    // Mantener valores por defecto si falla la inicialización
    console.warn("ApiGuide: inicialización fallida, usando fallback", e);
  }
  // Exponer
  if (typeof globalThis !== "undefined") {
    globalThis.ApiGuide_vc_bb = ApiGuide_vc_bb;
  }
})();

export function getApiBaseUrl_vc_bb() {
  const guide = (typeof globalThis !== "undefined" && globalThis.ApiGuide_vc_bb) || ApiGuide_vc_bb;
  return guide.baseUrl;
}

export { ApiGuide_vc_bb };

