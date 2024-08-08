const defaultBpm = 60;

const icon = document.getElementById("metronome-icon");
const bpmSlider = document.getElementById("bpm-range");
const bpmNumber = document.getElementById("bpm-number");
const button = document.getElementById("metronome-button");
const metronomeSound = new Audio("/assets/audio/metronome-beat.mp3");

metronomeSound.preload = 'auto';

let bpm = defaultBpm;
bpmSlider.value = defaultBpm;
bpmNumber.value = defaultBpm;

let running = false;

bpmSlider.oninput = () => {
    bpm = bpmSlider.value;
    bpmNumber.value = bpmSlider.value;
};

bpmNumber.oninput = () => {
    let correctedValue = bpmNumber.value;
    if (correctedValue < 1)
        correctedValue = 1
    else if (correctedValue > 250)
        correctedValue = 250
    bpm = correctedValue
    bpmNumber.value = correctedValue;
    bpmSlider.value = correctedValue;
};

button.onclick = () => {
    running = !running;

    if (running) {
        button.textContent = "Stop";
        metronomeLoop();
    } else {
        button.textContent = "Start";
    }
};

async function metronomeLoop() {
    metronomeBeat();

    let prevTime = performance.now();
    let currTime;

    while (running) {
        currTime = performance.now()
        if (currTime - prevTime >= 60000 / bpm) {
            metronomeBeat();
            prevTime = currTime;
        }
        await sleep(1);
    }
}

function metronomeBeat() {
    icon.classList.add('metronome-flashing');
    metronomeSound.currentTime = 0;
    metronomeSound.play();
    setTimeout(() => {
        icon.classList.remove('metronome-flashing');
    }, 200);
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
