export const THEME_KEY = 'cartnova.theme.v1';
export function readTheme(getStorage = () => globalThis.localStorage, prefersDark = false) {
  try {
    const saved = getStorage().getItem(THEME_KEY);
    return saved === 'dark' || saved === 'light' ? saved : prefersDark ? 'dark' : 'light';
  } catch { return prefersDark ? 'dark' : 'light'; }
}
export function initTheme() {
  const control = document.querySelector('#theme-toggle');
  const preference = matchMedia('(prefers-color-scheme: dark)');
  let theme = readTheme(undefined, preference.matches);
  function apply() {
    document.documentElement.dataset.theme = theme;
    control.setAttribute('aria-pressed', String(theme === 'dark'));
    control.setAttribute('aria-label', `Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`);
  }
  apply();
  control.addEventListener('click', () => {
    theme = theme === 'light' ? 'dark' : 'light';
    apply();
    try { localStorage.setItem(THEME_KEY, theme); } catch { /* The preference still works for this tab. */ }
  });
}
