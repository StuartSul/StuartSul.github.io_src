const initialState = 1;

let clock = document.getElementById('clock');
let button = document.getElementById('clock-button');
let alarmSound = document.getElementById('alarm-sound');
let workTimeMinInput = document.getElementById('work-time-min');
let workTimeSecInput = document.getElementById('work-time-sec');
let restTimeMinInput = document.getElementById('rest-time-min');
let restTimeSecInput = document.getElementById('rest-time-sec');

let timeRemaining;
let timer;
let state = initialState;

function updateClock() {
    let minutes = Math.floor(timeRemaining / 60);
    let seconds = timeRemaining % 60;
    clock.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function startCountdown(duration, nextState) {
    clearInterval(timer);
    timeRemaining = duration;
    updateClock();

    timer = setInterval(() => {
    timeRemaining--;
    updateClock();
    if (timeRemaining <= 0) {
        clearInterval(timer);
        state = nextState;
        handleState();
    }
    }, 1000);
}

function getWorkTime() {
    return parseInt(workTimeMinInput.value) * 60 + parseInt(workTimeSecInput.value)
}

function getRestTime() {
    return parseInt(restTimeMinInput.value) * 60 + parseInt(restTimeSecInput.value)
}

function handleState() {
    switch (state) {
    case 1:
        timeRemaining = getWorkTime();
        updateClock();
        button.textContent = 'Begin Work';
        button.onclick = () => {
            state = 2;
            handleState();
        };
        break;
    case 2:
        button.textContent = 'Reset';
        button.onclick = () => {
            state = 1;
            clearInterval(timer);
            handleState();
        };
        startCountdown(getWorkTime(), 3);
        break;
    case 3:
        timeRemaining = getRestTime();
        updateClock();
        button.textContent = 'Begin Rest';
        alarmSound.play();
        document.body.classList.add('timer-flashing')
        button.onclick = () => {
            state = 4;
            handleState();
            alarmSound.pause();
            alarmSound.currentTime = 0;
            document.body.classList.remove('timer-flashing')
        };
        break;
    case 4:
        button.textContent = 'Reset';
        button.onclick = () => {
            state = 1;
            clearInterval(timer);
            handleState();
        };
        startCountdown(getRestTime(), 5);
        break;
    case 5:
        timeRemaining = 0;
        updateClock();
        button.textContent = 'Begin Work';
        alarmSound.play();
        document.body.classList.add('timer-flashing')
        button.onclick = () => {
            state = 2;
            handleState();
            alarmSound.pause();
            alarmSound.currentTime = 0;
            document.body.classList.remove('timer-flashing')
        };
        break;
    }
}

workTimeMinInput.oninput = () => {
    let correctedValue = Math.min(99, Math.max(0, workTimeMinInput.value));
    workTimeMinInput.value = correctedValue.toString().padStart(2, '0');
    if (state === 1) {
        timeRemaining = getWorkTime();
        updateClock();
    }
};

workTimeSecInput.oninput = () => {
    let correctedValue = Math.min(59, Math.max(0, workTimeSecInput.value));
    workTimeSecInput.value = correctedValue.toString().padStart(2, '0');
    if (state === 1) {
        timeRemaining = getWorkTime();
        updateClock();
    }
};

restTimeMinInput.oninput = () => {
    let correctedValue = Math.min(99, Math.max(0, restTimeMinInput.value));
    restTimeMinInput.value = correctedValue.toString().padStart(2, '0');
    if (state === 3) {
        timeRemaining = getRestTime();
        updateClock();
    }
};

restTimeSecInput.oninput = () => {
    let correctedValue = Math.min(59, Math.max(0, restTimeSecInput.value));
    restTimeSecInput.value = correctedValue.toString().padStart(2, '0');
    if (state === 3) {
        timeRemaining = getRestTime();
        updateClock();
    }
};

handleState();
