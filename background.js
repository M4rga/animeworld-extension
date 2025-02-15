let episodeHrefs = [];
let alternativeDownloadLinks = [];

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "getEpisodeHrefs") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs.length === 0) {
        sendResponse({ success: false, error: "No active tab found " });
        return;
      }
      const activeTabId = tabs[0].id;
      chrome.scripting.executeScript({
        target: { tabId: activeTabId },
        func: () => {
          let hrefs = [];
          const animeDiv = document.getElementById("animeId");
          if (animeDiv) {
            const widgetBody = animeDiv.querySelector(".widget-body");
            if (widgetBody) {
              const episodesUl = widgetBody.querySelector("ul.episodes.range.active");
              if (episodesUl) {
                const liElements = episodesUl.querySelectorAll("li");
                liElements.forEach(li => {
                  const link = li.querySelector("a");
                  if (link) {
                    hrefs.push(link.href);
                  }
                });
              } else {
                alert("Episodes not found make sure you are on 'Animeworld' website");
              }
            } else {
              alert("Episodes not found make sure you are on 'Animeworld' website");
            }
          } else {
            alert("Episodes not found make sure you are on 'Animeworld' website");
          }
          return hrefs;
        }
      }, (injectionResults) => {
        if (chrome.runtime.lastError) {
          sendResponse({ success: false, error: chrome.runtime.lastError.message });
          return;
        }
        if (injectionResults && injectionResults.length > 0) {
          const hrefs = injectionResults[0].result;
          if (!hrefs || hrefs.length === 0) {
            sendResponse({ success: false, error: "No episode found" });
            return;
          }
          episodeHrefs = hrefs;
          sendResponse({ success: true, hrefs: episodeHrefs });
        }
      });
    });
    return true;
  } else if (message.action === "storeAlternativeDownloadLinks") {
    alternativeDownloadLinks = message.alternativeDownloadLinks;
    sendResponse({ success: true });
  }
});
