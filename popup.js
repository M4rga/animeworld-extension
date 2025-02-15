document.getElementById("downbtn").addEventListener("click", () => {
  chrome.runtime.sendMessage({ action: "getEpisodeHrefs" }, (response) => {
    if (response && response.success) {
      const hrefs = response.hrefs;
      if (hrefs.length > 0) {
        (async function() {
          const alternativeLinks = [];
          for (let i = 0; i < hrefs.length; i++) {
            try {
              const res = await fetch(hrefs[i]);
              if (res.ok) {
                const html = await res.text();
                const parser = new DOMParser();
                const doc = parser.parseFromString(html, "text/html");
                const altElem = doc.getElementById("alternativeDownloadLink");
                if (altElem) {
                  alternativeLinks.push(altElem.getAttribute("href"));
                } else {
                  alternativeLinks.push(null);
                }
              } else {
                alternativeLinks.push(null);
              }
            } catch (error) {
              alternativeLinks.push(null);
            }
          }
          
          chrome.runtime.sendMessage({ action: "storeAlternativeDownloadLinks", alternativeDownloadLinks: alternativeLinks }, () => {
            downloadVideosSequentially(alternativeLinks);
          });
        })();
      } else {
        alert("Error no episode found.");
      }
    } else {
      alert("Error: " + (response && response.error ? response.error : "anspecified error"));
    }
  });
});

function downloadVideo(url, filename) {
  return new Promise((resolve, reject) => {
    if (!url) {
      resolve();
      return;
    }
    chrome.downloads.download({
      url: url,
      filename: filename
    }, (downloadId) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError.message);
      } else {
        resolve(downloadId);
      }
    });
  });
}

async function downloadVideosSequentially(links) {
  for (let i = 0; i < links.length; i++) {
    try {
      await downloadVideo(links[i], "ep" + (i + 1) + ".mp4");
    } catch (error) {
      alert("Error on episode" + (i + 1) + ": " + error);
    }
  }
}
