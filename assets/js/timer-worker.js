let running = false;
let interval;

function startTimer(startTime, duration) {
    running = true;
    interval = setInterval(() => {
        if (running) {
            const timeRemaining = Math.max(
                duration - Math.floor(performance.now() / 1000 - startTime), 0
            );
            running = timeRemaining > 0;
    
            postMessage({
                type: "timerRunningMessage",
                timeRemaining: timeRemaining,
                running: running
            });
        }
        else
            clearInterval(interval);
    }, 10); // update every 10ms
}

function stopTimer(nextState) {
    running = false;
    clearInterval(interval);
    postMessage({
        type: "timerStopMessage",
        nextState: nextState
    });
}

onmessage = (e) => {
    /*
        Sample message
        e.data = {
            command: "start",
            duration: 600
        }
    */
    switch (e.data.command) {
        case 'start':
            if (!running)
                startTimer(performance.now() / 1000, e.data.duration);
            break;
        case 'stop':
            stopTimer(e.data.nextState);
            break;
    }
};
