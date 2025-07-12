document.addEventListener('DOMContentLoaded', () => {
  const skipInput = document.getElementById('skip-timer');
  const pauseInput = document.getElementById('pause-timer');
  const speedBoostInput = document.getElementById('speed-booster');
  const autoPauseCheckbox = document.getElementById('auto-pause-enabled');
  const saveBtn = document.getElementById('save-settings');
  const statusText = document.getElementById('status-text');
  
  // Функция для показа статуса
  function showStatus(message, type = 'info', duration = 3000) {
    statusText.textContent = message;
    statusText.className = `status-text ${type}`;
    
    if (duration > 0) {
      setTimeout(() => {
        statusText.textContent = '';
        statusText.className = 'status-text';
      }, duration);
    }
  }
  
  // Загрузка сохраненных настроек
  chrome.storage.sync.get(['skipTimer', 'pauseTimer', 'autoPauseEnabled', 'speedBoost'], (data) => {
    skipInput.value = data.skipTimer || 10;
    pauseInput.value = data.pauseTimer || 30;
    speedBoostInput.value = data.speedBoost || 2.0;
    
    // Показываем текущее состояние таймера
    if (data.autoPauseEnabled) {
      autoPauseCheckbox.checked = true;
      showStatus('Таймер автопаузы активен', 'success', 0);
    } else {
      autoPauseCheckbox.checked = false;
    }
  });
  
  // Сохранение настроек
  saveBtn.addEventListener('click', () => {
    const skipValue = parseInt(skipInput.value);
    const pauseValue = parseInt(pauseInput.value);
    
    // Валидация значений
    if (isNaN(skipValue) || skipValue < 1 || skipValue > 60) {
      showStatus('Время скипа должно быть от 1 до 60 секунд', 'warning');
      return;
    }
    
    if (isNaN(pauseValue) || pauseValue < 1 || pauseValue > 180) {
      showStatus('Время автопаузы должно быть от 1 до 180 минут', 'warning');
      return;
    }
    

    const speedBoostValue = parseFloat(speedBoostInput.value);
    const validatedSpeedBoost = Math.min(Math.max(speedBoostValue, 1), 10);

  
    chrome.storage.sync.set({
      skipTimer: skipValue,
      pauseTimer: pauseValue,
      autoPauseEnabled: autoPauseCheckbox.checked,
      speedBoost: validatedSpeedBoost
    }, () => {
      if (autoPauseCheckbox.checked) {
        showStatus('Настройки сохранены, таймер автопаузы запущен', 'success');
      } else {
        showStatus('Настройки сохранены', 'success');
      }
    });
  });
  
  // Обработчик изменения чекбокса
  autoPauseCheckbox.addEventListener('change', () => {
    if (autoPauseCheckbox.checked) {
      showStatus('Таймер будет запущен после сохранения', 'info', 2000);
    } else {
      showStatus('Таймер будет отключен после сохранения', 'info', 2000);
    }
  });
});