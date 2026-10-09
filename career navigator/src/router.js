// router.js — Hash-based SPA router

const routes = {};
let currentRoute = null;
let beforeNavHook = null;

export const router = {
  register(path, handler) {
    routes[path] = handler;
  },

  before(hook) {
    beforeNavHook = hook;
  },

  navigate(path, replace = false, force = false) {
    const targetHash = `#${path}`;
    if (window.location.hash === targetHash || force) {
      currentRoute = null;
      this.resolve();
    } else if (replace) {
      history.replaceState(null, '', targetHash);
      currentRoute = null;
      this.resolve();
    } else {
      window.location.hash = path;
    }
  },

  getCurrentPath() {
    const hash = window.location.hash.slice(1) || '/';
    // strip query params for route matching
    return hash.split('?')[0];
  },

  getParams() {
    const hash = window.location.hash.slice(1) || '/';
    const qIdx = hash.indexOf('?');
    if (qIdx === -1) return {};
    const query = hash.slice(qIdx + 1);
    return Object.fromEntries(new URLSearchParams(query));
  },

  async resolve() {
    const path = this.getCurrentPath();
    if (currentRoute === path) return;
    currentRoute = path;

    if (beforeNavHook) {
      const proceed = await beforeNavHook(path);
      if (proceed === false) return;
    }

    // exact match first, then prefix match, then wildcard
    const handler = routes[path] ||
      Object.entries(routes).find(([r]) => path.startsWith(r + '/'))?.[1] ||
      routes['*'];

    if (handler) {
      handler(path, router.getParams());
    }
  },

  init() {
    window.addEventListener('hashchange', () => this.resolve());
    this.resolve();
  }
};
