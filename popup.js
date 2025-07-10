document.addEventListener('DOMContentLoaded', () => {
  const skipInput = document.getElementById('skip-timer');
  const pauseInput = document.getElementById('pause-timer');
  const speedBoostInput = document.getElementById('speed-booster');
  const autoPauseCheckbox = document.getElementById('auto-pause-enabled');
  const saveBtn = document.getElementById('save-settings');
  const statusText = document.getElementById('status-text');

  
  chrome.storage.sync.get(['skipTimer', 'pauseTimer', 'autoPauseEnabled', 'speedBoost'], (data) => {
    skipInput.value = data.skipTimer || 10;
    pauseInput.value = data.pauseTimer || 30;
    speedBoostInput.value = data.speedBoost || 2.0;
    
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

    const speedBoostValue = parseFloat(speedBoostInput.value);
    const validatedSpeedBoost = Math.min(Math.max(speedBoostValue, 1), 10);

  
    chrome.storage.sync.set({
      skipTimer: parseInt(skipInput.value),
      pauseTimer: parseInt(pauseInput.value),
      autoPauseEnabled: autoPauseCheckbox.checked,
      speedBoost: validatedSpeedBoost
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