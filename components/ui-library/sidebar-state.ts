/**
 * Persists the desktop sidebar without making /ui dynamic. `sidebarScript` runs inline in
 * app/ui/layout.tsx before the shell is parsed and restores `data-sidebar` on <html>; CSS
 * hides `.docs-sidebar` when it is "closed". LibraryShell mirrors it for aria-pressed.
 */
export const SIDEBAR_KEY = "rockui-sidebar";
export const sidebarScript = `try{if(localStorage.getItem("${SIDEBAR_KEY}")==="closed")document.documentElement.dataset.sidebar="closed"}catch{}`;
