/****************************************
 AI Toolbox — BACKGROUND.JS
*****************************************/

console.log("✅ AI Toolbox background loaded");


/* ================================
   CREATE CONTEXT MENUS
================================= */
function createMenus() {

  // Remove previous menus to avoid duplicate-id errors
  chrome.contextMenus.removeAll(() => {

    // Parent
    chrome.contextMenus.create({
      id: "aiToolbox",
      title: "Ask with AI",
      contexts: ["selection"]
    });

    // Sub-items
    chrome.contextMenus.create({
      id: "askChatGPT",
      title: "Ask with ChatGPT",
      parentId: "aiToolbox",
      contexts: ["selection"]
    });

    chrome.contextMenus.create({
      id: "askClaude",
      title: "Ask with Claude",
      parentId: "aiToolbox",
      contexts: ["selection"]
    });

    chrome.contextMenus.create({
      id: "askGemini",
      title: "Ask with Gemini",
      parentId: "aiToolbox",
      contexts: ["selection"]
    });

    chrome.contextMenus.create({
      id: "askPerplexity",
      title: "Ask with Perplexity",
      parentId: "aiToolbox",
      contexts: ["selection"]
    });

    console.log("✅ Context menus created");
  });

}


/* ================================
   RUN MENU SETUP
================================= */

// On install (first time + update)
chrome.runtime.onInstalled.addListener(() => {
  createMenus();
});

// On browser startup (ensures menus persist)
chrome.runtime.onStartup.addListener(() => {
  createMenus();
});


/* ================================
   CONTEXT MENU CLICK LOGIC
================================= */

chrome.contextMenus.onClicked.addListener((info) => {
  if (!info.selectionText) return;

  const query = encodeURIComponent(info.selectionText);
  let url = "";

  switch (info.menuItemId) {

    case "askChatGPT":
      url = "https://chat.openai.com/";
      break;

    case "askClaude":
      url = "https://claude.ai/";
      break;

    case "askGemini":
      url = "https://gemini.google.com/app";
      break;

    case "askPerplexity":
      url = "https://www.perplexity.ai/search?q=" + query;
      break;

    default:
      break;
  }

  if (url) chrome.tabs.create({ url });
});



/* ================================
   CLICK TOOLBOX ICON → OPEN HOME
================================= */

chrome.action.onClicked.addListener(() => {
  chrome.tabs.create({
    url: chrome.runtime.getURL("home.html")
  });
});
