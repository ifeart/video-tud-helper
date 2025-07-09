chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.set({ 
    skipTimer: 10, 
    pauseTimer: 30,
    autoPauseEnabled: false 
  });
});