document.getElementById("downbtn").addEventListener("click", () => {
  chrome.runtime.sendMessage({ action: "downloadAllEpisodes" }, (response) => {
    if (response && response.success) {
      alert("Download avviato per " + response.count + " episodi.");
    } else {
      alert("Errore: " + (response && response.error ? response.error : "risposta non valida"));
    }
  });
});
