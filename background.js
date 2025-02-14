// background.js

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "downloadAllEpisodes") {
      // Query per ottenere la scheda attiva
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs.length === 0) {
          sendResponse({ success: false, error: "Nessuna scheda attiva trovata" });
          return;
        }
        
        const activeTabId = tabs[0].id;
        
        // Inietta uno script nella pagina attiva per raccogliere gli href
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
                  alert("Episodes not found");
                }
              } else {
                alert("Episodes not found");
              }
            } else {
              alert("Episodes not found");
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
              sendResponse({ success: false, error: "Nessun episodio trovato" });
              return;
            }
            
            // Avvia i download in sequenza per mantenere l'ordine
            let downloadCount = 0;
            let index = 0;
            const downloadNext = () => {
              if (index >= hrefs.length) {
                // Tutti i download sono stati avviati
                sendResponse({ success: true, count: downloadCount });
                return;
              }
              chrome.downloads.download({
                url: hrefs[index],
                filename: "ep" + (index + 1) + ".mp4"
              }, (downloadId) => {
                if (chrome.runtime.lastError) {
                  console.error("Errore download ep" + (index + 1) + ": " + chrome.runtime.lastError.message);
                } else {
                  console.log("Download avviato per ep" + (index + 1) + ", ID: " + downloadId);
                  downloadCount++;
                }
                index++;
                downloadNext();
              });
            };
            downloadNext();
          }
        });
      });
      // Indichiamo che invieremo la risposta in modo asincrono
      return true;
    }
  });
  