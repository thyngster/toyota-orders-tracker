var script = document.createElement('script'); 
script.src = chrome.extension.getURL('injected.js');
(document.head||document.documentElement).appendChild(script);