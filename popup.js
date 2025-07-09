document.addEventListener('DOMContentLoaded', () => {
  const skipInput = document.getElementById('skip-timer');
  const pauseInput = document.getElementById('pause-timer');
  const autoPauseCheckbox = document.getElementById('auto-pause-enabled');
  const saveBtn = document.getElementById('save-settings');
  const statusText = document.getElementById('status-text');
  
  chrome.storage.sync.get(['skipTimer', 'pauseTimer', 'autoPauseEnabled'], (data) => {
    skipInput.value = data.skipTimer || 10;
    pauseInput.value = data.pauseTimer || 30;
    
    if (data.autoPauseEnabled) {
      autoPauseCheckbox.checked = true;
      statusText.textContent = 'Таймер автопаузы активен';
      statusText.style.color = 'green';
    } else {
      autoPauseCheckbox.checked = false;
      statusText.textContent = '';
    }
  });
  
  saveBtn.addEventListener('click', () => {
    chrome.storage.sync.set({
      skipTimer: parseInt(skipInput.value),
      pauseTimer: parseInt(pauseInput.value),
      autoPauseEnabled: autoPauseCheckbox.checked
    }, () => {
      if (autoPauseCheckbox.checked) {
        statusText.textContent = 'Настройки сохранены, таймер автопаузы запущен';
        statusText.style.color = 'green';
      } else {
        statusText.textContent = 'Настройки сохранены';
        statusText.style.color = 'black';
      }
      
      setTimeout(() => {
        statusText.textContent = '';
      }, 3000);
    });
  });
});