chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "readwidth-adjust",
    title: "ReadWidth – Adjust line length",
    contexts: ["all"]
  });

  chrome.contextMenus.create({
    id: "readwidth-reset",
    title: "ReadWidth – Reset this element",
    contexts: ["all"]
  });

  chrome.contextMenus.create({
    id: "readwidth-reset-all",
    title: "ReadWidth – Reset all on page",
    contexts: ["all"]
  });
});

chrome.contextMenus.onClicked.addListener((o_info, o_tab) => {
  if (!o_tab?.id) return;

  if (o_info.menuItemId === "readwidth-adjust") {
    chrome.tabs.sendMessage(o_tab.id, { action: "showSlider" });
  } else if (o_info.menuItemId === "readwidth-reset") {
    chrome.tabs.sendMessage(o_tab.id, { action: "resetElement" });
  } else if (o_info.menuItemId === "readwidth-reset-all") {
    chrome.tabs.sendMessage(o_tab.id, { action: "resetAll" });
  }
});
