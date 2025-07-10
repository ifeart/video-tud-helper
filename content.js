let videoElement = null;
let pauseTimer = null;
let pressTimer = null;
let originalSpeed = 1.0;
let userSelectedSpeed = 1.0; 
let keyListenersAdded = false;
// Логи для отладки вначале добавил, удалять не буду, так на всякий :)

// console.log('Логи расширения: текущий URL:', window.location.href);

function debugKeyHandler(e) {
  // console.log('Логи расширения: нажата клавиша:', e.key, 'код:', e.code, 'target:', e.target.tagName);
}

document.addEventListener('keydown', debugKeyHandler, true);

function findVideo() {
  const selectors = [
    'video.vjs-tech',
    '#vjs_video_3_html5_api',
    'video[src]',
    'video',
    '.video-js video',
    '[class*="video"] video'
  ];
  
  for (const selector of selectors) {
    const video = document.querySelector(selector);
    if (video) {
      // console.log(`Логи расширения: найден видео элемент с селектором: ${selector}`);
      return video;
    }
  }
  
  // console.log('Логи расширения: видео элемент не найден ни по одному селектору');
  return null;
}

function handleKeyPress(e) {
  if (!videoElement) return;
  
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable) {
    return;
  }
  
  if (!videoElement.duration || isNaN(videoElement.duration)) {
    return;
  }
  
  let handled = false;
  
  if (e.key === 'ArrowLeft' || (e.key === 'a')) {
    handled = true;
    chrome.storage.sync.get('skipTimer', (data) => {
      const skipTime = data.skipTimer || 10;
      videoElement.currentTime = Math.max(0, videoElement.currentTime - skipTime);
      // console.log(`Логи расширения: перемотка назад на ${skipTime} секунд`);
    });
  } else if (e.key === 'ArrowRight' || (e.key === 'd')) {
    handled = true;
    chrome.storage.sync.get('skipTimer', (data) => {
      const skipTime = data.skipTimer || 10;
      videoElement.currentTime = Math.min(
        videoElement.duration, 
        videoElement.currentTime + skipTime
      );
      // console.log(`Логи расширения: перемотка вперед на ${skipTime} секунд`);
    });
  } else if (e.key === ' ' || e.key === 'p') {
    handled = true;
    if (videoElement.paused) {
      videoElement.play();
      // console.log('Логи расширения: воспроизведение');
    } else {
      videoElement.pause();
      // console.log('Логи расширения: пауза');
    }
  }
  
  if (handled) {
    e.preventDefault();
    e.stopPropagation();
  }
}

function setupPauseTimer() {
  chrome.storage.sync.get(['pauseTimer', 'autoPauseEnabled'], (data) => {
    clearTimeout(pauseTimer);
    
    if (data.autoPauseEnabled) {
      const pauseTime = (data.pauseTimer || 30) * 60 * 1000;
      
      pauseTimer = setTimeout(() => {
        if (videoElement && !videoElement.paused) {
          videoElement.pause();
          chrome.storage.sync.set({ autoPauseEnabled: false });
          // console.log('Логи расширения: автопауза сработала, таймер отключен');
        }
      }, pauseTime);
      // console.log(`Логи расширения: таймер автопаузы запущен на ${data.pauseTimer || 30} минут`);
    }
  });
}

function activateSpeedBoost() {
  if (!videoElement) return;

  userSelectedSpeed = videoElement.playbackRate;

  chrome.storage.sync.get(['speedBoost'], (data) => {
    originalSpeed = videoElement.playbackRate;
    const boostSpeed = data.speedBoost || 2.0; // Значение по умолчанию 2.0
    videoElement.playbackRate = boostSpeed;
    videoElement.style.filter = 'brightness(1.1)';
  });
}
function deactivateSpeedBoost() {
  if (!videoElement) return;
  videoElement.playbackRate = userSelectedSpeed;
  videoElement.style.filter = '';
}

function handleVideoMouseDown(e) {
  if (!videoElement) return;
  
  // Проверяем, что клик не на элементах управления
  if (e.target.closest('.video-bar')) return;
  
  pressTimer = setTimeout(activateSpeedBoost, 500);
}

function handleVideoMouseUp(e) {
  if (!videoElement) return;
  clearTimeout(pressTimer);

  const currentSpeed = videoElement.playbackRate;

  if (videoElement.playbackRate > 1.0) {
    deactivateSpeedBoost();
  } else {
    userSelectedSpeed = currentSpeed;
    if (videoElement.paused) {
      videoElement.play();
    } else {
      videoElement.pause();
    }
  }
}

function handleVideoMouseLeave() {
  if (!videoElement) return;
  clearTimeout(pressTimer);
  
  if (videoElement.playbackRate > 1.0) {
    deactivateSpeedBoost();
  }
}
function init() {
  videoElement = findVideo();
  
  if (videoElement) {
    originalSpeed = videoElement.playbackRate;

    if (!keyListenersAdded) {
      document.addEventListener('keydown', handleKeyPress, true);
      window.addEventListener('keydown', handleKeyPress, true);
      keyListenersAdded = true;
    }
    
    videoElement.removeEventListener('play', setupPauseTimer);
    videoElement.removeEventListener('mousedown', handleVideoMouseDown);
    videoElement.removeEventListener('mouseup', handleVideoMouseUp);
    videoElement.removeEventListener('mouseleave', handleVideoMouseLeave);
    
    // Добавляем новые обработчики
    videoElement.addEventListener('play', setupPauseTimer);
    videoElement.addEventListener('mousedown', handleVideoMouseDown);
    videoElement.addEventListener('mouseup', handleVideoMouseUp);
    videoElement.addEventListener('mouseleave', handleVideoMouseLeave);
    
    setupPauseTimer();
    
    // console.log('Логи расширения: оно (РАБОТАЕТ!!!) инициализировано');
  } else {
    // console.log('Логи расширения: видео элемент не найден, повторная попытка через 1 секунду');
    setTimeout(init, 1000);
  }
}

function setupMutationObserver() {
  const observer = new MutationObserver((changesEl) => {
    let shouldReinit = false;
    
    changesEl.forEach((mutation) => {
      if (mutation.type === 'childList') {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            if (node.tagName === 'VIDEO' || node.querySelector('video')) {
              shouldReinit = true;
            }
          }
        });
      }
    });
    
    if (shouldReinit && !videoElement) {
      // console.log('Логи расширения: обнаружено новое видео, переинициализация');
      init();
    }
  });
  
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
}

document.addEventListener('DOMContentLoaded', () => {
  init();
  setupMutationObserver();
});

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    init();
    setupMutationObserver();
  });
} else {
  init();
  setupMutationObserver();
}

setTimeout(() => {
  if (!videoElement) {
    init();
  }
}, 3000);

chrome.storage.onChanged.addListener((changes) => {
  if (changes.pauseTimer || changes.autoPauseEnabled) {
    setupPauseTimer();
  }
});