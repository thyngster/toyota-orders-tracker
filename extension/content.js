// filepath: /Users/acarrenol-local/Documents/Ander/Toyota/toyota-orders-tracker-main/extension/content.js
var script = document.createElement('script'); 
script.src = chrome.runtime.getURL('injected.js');
(document.head || document.documentElement).appendChild(script);
// Opcional: limpiar la etiqueta script después de inyectar para mantener el DOM limpio
script.onload = function() {
    this.remove();
};