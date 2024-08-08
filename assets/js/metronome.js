const defaultBpm = 60;

const icon = document.getElementById("metronome-icon");
const bpmSlider = document.getElementById("bpm-range");
const bpmNumber = document.getElementById("bpm-number");
const button = document.getElementById("metronome-button");

let audioCtx;
let metronomeTick;
let metronomeTickGain;

let bpm = defaultBpm;
bpmSlider.value = defaultBpm;
bpmNumber.value = defaultBpm;

let running = false;
let interval;
let metronomeInitialized = false;

bpmSlider.oninput = () => {
    bpm = bpmSlider.value;
    bpmNumber.value = bpmSlider.value;
};

bpmSlider.onmouseup = () => {
    if (running)
        startMetronome();
}

bpmSlider.ontouchend = () => {
    if (running)
        startMetronome();
}

bpmNumber.oninput = () => {
    let correctedValue = bpmNumber.value;
    if (correctedValue < 1)
        correctedValue = 1
    else if (correctedValue > 250)
        correctedValue = 250
    bpm = correctedValue
    bpmNumber.value = correctedValue;
    bpmSlider.value = correctedValue;
    if (running)
        startMetronome();
};

button.onclick = () => {
    if (!metronomeInitialized)
        initializeMetronome();

    running = !running;

    if (running) {
        button.textContent = "Stop";
        startMetronome();
    } else {
        button.textContent = "Start";
        stopMetronome();
    }
};

function initializeMetronome() {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    metronomeTick = audioCtx.createOscillator();
    metronomeTickGain = audioCtx.createGain();

    metronomeTick.type = 'sine';
    metronomeTick.frequency.value = 1000;
    metronomeTickGain.gain.value = 0;
    metronomeTick.connect(metronomeTickGain);
    metronomeTickGain.connect(audioCtx.destination);
    metronomeTick.start(0);

    metronomeInitialized = true;
}

async function startMetronome() {
    stopMetronome();

    if (audioCtx.state === 'suspended') {
        await audioCtx.resume();
    }

    const timeInterval = 60 / bpm;
    let tickTime = audioCtx.currentTime + 0.5; // add a little delay for smooth start
    
    setNextTick(tickTime);
    tickTime += timeInterval;
    setTimeout(() => {
        flashMetronome();
    }, 500);

    interval = setInterval(() => {
        setNextTick(tickTime);
        tickTime += timeInterval;
        setTimeout(() => {
            flashMetronome();
        }, 500);
    }, timeInterval * 1000);
}

function stopMetronome() {
    clearInterval(interval);
    metronomeTickGain.gain.cancelScheduledValues(audioCtx.currentTime);
    metronomeTickGain.gain.setValueAtTime(0, audioCtx.currentTime);
}

function setNextTick(time) {
    metronomeTickGain.gain.setValueAtTime(0, time);
    metronomeTickGain.gain.linearRampToValueAtTime(1, time + .001);
    metronomeTickGain.gain.linearRampToValueAtTime(0, time + .001 + .01);
}

function flashMetronome() {
    icon.classList.add('metronome-flashing');
    setTimeout(() => {
        icon.classList.remove('metronome-flashing');
    }, 200);
}
