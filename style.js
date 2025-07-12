const buttons = document.getElementsByClassName('btn');
for (let i = 0; i < buttons.length; i++) {
    buttons[i].addEventListener('click', function (e) {
        const wave = document.createElement('span');
        const rect = this.getBoundingClientRect();
        
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        wave.style.left = x + 'px';
        wave.style.top = y + 'px';
        
        this.appendChild(wave);
        
        setTimeout(() => {
            if (wave.parentNode) {
                wave.parentNode.removeChild(wave);
            }
        }, 500);
    });
}

function createInputNumberHandler(inputId, decrementId, incrementId, min = 1, max = 999, step = 1) {
    const input = document.getElementById(inputId);
    const decrementBtn = document.getElementById(decrementId);
    const incrementBtn = document.getElementById(incrementId);
    
    if (!input || !decrementBtn || !incrementBtn) {
        console.error(`Input number elements not found: ${inputId}`);
        return;
    }
    
    const isDecimal = step < 1;
    const parseValue = isDecimal ? parseFloat : parseInt;
    
    decrementBtn.addEventListener('click', (e) => {
        e.preventDefault();
        let currentValue = parseValue(input.value) || min;
        let newValue = currentValue - step;
        
        if (newValue >= min) {
            input.value = isDecimal ? newValue.toFixed(1) : newValue;
            input.dispatchEvent(new Event('input'));
        }
    });
    
    incrementBtn.addEventListener('click', (e) => {
        e.preventDefault();
        let currentValue = parseValue(input.value) || min;
        let newValue = currentValue + step;
        
        if (newValue <= max) {
            input.value = isDecimal ? newValue.toFixed(1) : newValue;
            input.dispatchEvent(new Event('input'));
        }
    });
    
    input.addEventListener('input', () => {
        let value = parseValue(input.value);
        
        if (isNaN(value) || value < min) {
            input.value = isDecimal ? min.toFixed(1) : min;
        } else if (value > max) {
            input.value = isDecimal ? max.toFixed(1) : max;
        } else if (isDecimal) {
            input.value = value.toFixed(1);
        }
    });
    
    input.addEventListener('keydown', (e) => {
        const allowedKeys = [
            'Backspace', 'Delete', 'Tab', 'Enter',
            'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'
        ];
        
        if (!allowedKeys.includes(e.key)) {
            if (isDecimal) {
                if (!((e.key >= '0' && e.key <= '9') || e.key === '.')) {
                    e.preventDefault();
                }
                if (e.key === '.' && input.value.includes('.')) {
                    e.preventDefault();
                }
            } else {
                if (e.key < '0' || e.key > '9') {
                    e.preventDefault();
                }
            }
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    createInputNumberHandler('skip-timer', 'skip-decrement', 'skip-increment', 1, 60, 1);
    createInputNumberHandler('pause-timer', 'pause-decrement', 'pause-increment', 1, 180, 1);
    createInputNumberHandler('speed-booster', 'speed-decrement', 'speed-increment', 1.0, 10.0, 0.1);
    createInputNumberHandler('video-speed', 'video-speed-decrement', 'video-speed-increment', 0.5, 3.0, 0.1);
});
