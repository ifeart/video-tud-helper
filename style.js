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

function createInputNumberHandler(inputId, decrementId, incrementId, min = 1, max = 999) {
    const input = document.getElementById(inputId);
    const decrementBtn = document.getElementById(decrementId);
    const incrementBtn = document.getElementById(incrementId);
    
    if (!input || !decrementBtn || !incrementBtn) {
        console.error(`Input number elements not found: ${inputId}`);
        return;
    }
    
    decrementBtn.addEventListener('click', (e) => {
        e.preventDefault();
        let currentValue = parseInt(input.value) || min;
        if (currentValue > min) {
            input.value = currentValue - 1;
            input.dispatchEvent(new Event('input'));
        }
    });
    
    incrementBtn.addEventListener('click', (e) => {
        e.preventDefault();
        let currentValue = parseInt(input.value) || min;
        if (currentValue < max) {
            input.value = currentValue + 1;
            input.dispatchEvent(new Event('input'));
        }
    });
    
    input.addEventListener('input', () => {
        let value = parseInt(input.value);
        
        if (isNaN(value) || value < min) {
            input.value = min;
        } else if (value > max) {
            input.value = max;
        }
    });
    
    input.addEventListener('keydown', (e) => {
        const allowedKeys = [
            'Backspace', 'Delete', 'Tab', 'Enter',
            'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'
        ];
        
        if (!allowedKeys.includes(e.key) && 
            (e.key < '0' || e.key > '9')) {
            e.preventDefault();
        }
    });
}


document.addEventListener('DOMContentLoaded', () => {
    createInputNumberHandler('skip-timer', 'skip-decrement', 'skip-increment', 1, 60);
    createInputNumberHandler('pause-timer', 'pause-decrement', 'pause-increment', 1, 180);
});
