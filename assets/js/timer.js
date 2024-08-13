const initialState = 0;

let clock = document.getElementById('clock');
let button = document.getElementById('clock-button');
let alarmSound = document.getElementById('alarm-sound');
let workTimeMinInput = document.getElementById('work-time-min');
let workTimeSecInput = document.getElementById('work-time-sec');
let restTimeMinInput = document.getElementById('rest-time-min');
let restTimeSecInput = document.getElementById('rest-time-sec');

let state = initialState;
let worker = new Worker("/assets/js/timer-worker.js");

function updateClock(timeRemaining) {
    const minuteString = Math.floor(timeRemaining / 60).toString().padStart(2, '0');
    const secondString = (timeRemaining % 60).toString().padStart(2, '0');

    clock.textContent = `${minuteString}:${secondString}`;
}

function handleState() {
    switch (state) {
        case 0:
            updateClock(getWorkTime());
            button.textContent = 'Begin Work';
            button.onclick = () => {
                state = 1;
                handleState();
            };
            break;
        case 1:
            worker.postMessage({command: "start", duration: getWorkTime()});
            button.textContent = 'Reset';
            button.onclick = () => {
                worker.postMessage({command: "stop", nextState: 0});
            };
            break;
        case 2:
            updateClock(getRestTime());
            button.textContent = 'Begin Rest';
            button.onclick = () => {
                state = 3;
                handleState();
                alarmSound.pause();
                alarmSound.currentTime = 0;
                document.body.classList.remove('timer-flashing')
            };
            alarmSound.play();
            document.body.classList.add('timer-flashing')
            break;
        case 3:
            button.textContent = 'Reset';
            button.onclick = () => {
                worker.postMessage({command: "stop", nextState: 0});
            };
            worker.postMessage({command: "start", duration: getRestTime()});
            break;
        case 4:
            updateClock(getWorkTime());
            button.textContent = 'Begin Work';
            button.onclick = () => {
                state = 1;
                handleState();
                alarmSound.pause();
                alarmSound.currentTime = 0;
                document.body.classList.remove('timer-flashing')
            };
            alarmSound.play();
            document.body.classList.add('timer-flashing')
            break;
    }
}

function getWorkTime() {
    return parseInt(workTimeMinInput.value) * 60 + parseInt(workTimeSecInput.value)
}

function getRestTime() {
    return parseInt(restTimeMinInput.value) * 60 + parseInt(restTimeSecInput.value)
}

workTimeMinInput.oninput = () => {
    workTimeMinInput.value = Math.min(99, Math.max(0, workTimeMinInput.value)).toString().padStart(2, '0');
    if (state === 0)
        updateClock(getWorkTime());
};

workTimeSecInput.oninput = () => {
    workTimeSecInput.value = Math.min(59, Math.max(0, workTimeSecInput.value)).toString().padStart(2, '0');
    if (state === 0)
        updateClock(getWorkTime());
};

restTimeMinInput.oninput = () => {
    restTimeMinInput.value = Math.min(99, Math.max(0, restTimeMinInput.value)).toString().padStart(2, '0');
    if (state === 2)
        updateClock(getRestTime());
};

restTimeSecInput.oninput = () => {
    restTimeSecInput.value = Math.min(59, Math.max(0, restTimeSecInput.value)).toString().padStart(2, '0');
    if (state === 2)
        updateClock(getRestTime());
};

worker.onmessage = (e) => {
    if (e.data.type == "timerRunningMessage") {
        if (state == 1 || state == 3) {
            if (!e.data.running) {
                state++;
                handleState();
            }
            else
                updateClock(e.data.timeRemaining);
        }
    } else if (e.data.type == "timerStopMessage") {
        state = e.data.nextState;
        handleState();
    }
}

handleState();
