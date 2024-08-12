const dayOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]; 

const unixTimeInput = document.getElementById("unix-time");
const setToNowInput = document.getElementById("set-to-now");
const utcDayOfWeek = document.getElementById("utc-dow");
const utcMonthInput = document.getElementById("utc-month");
const utcDayInput = document.getElementById("utc-day");
const utcYearInput = document.getElementById("utc-year");
const utcHourInput = document.getElementById("utc-hour");
const utcMinuteInput = document.getElementById("utc-minute");
const utcSecondInput = document.getElementById("utc-second");
const utcMillisecondInput = document.getElementById("utc-millisecond");
const localDayOfWeek = document.getElementById("local-dow");
const localMonthInput = document.getElementById("local-month");
const localDayInput = document.getElementById("local-day");
const localYearInput = document.getElementById("local-year");
const localHourInput = document.getElementById("local-hour");
const localMinuteInput = document.getElementById("local-minute");
const localSecondInput = document.getElementById("local-second");
const localMillisecondInput = document.getElementById("local-millisecond");
const localGmtSignInput = document.getElementById("local-gmt-sign");
const localGmtHourInput = document.getElementById("local-gmt-hour");
const localGmtMinuteInput = document.getElementById("local-gmt-minute");
const setToLocalInput = document.getElementById("set-to-local");
const relativeTimeInput = document.getElementById("relative-time");
const relativeTimeUnitInput = document.getElementById("relative-time-unit");
const relativeTimeDirectionInput = document.getElementById("relative-time-direction");

const userGmtOffset = -(new Date().getTimezoneOffset() / 60);
initialize();

function initialize() {
    setToNowInput.addEventListener('click', () => {
        unixTimeInput.value = Math.floor(Date.now() / 1000);
        syncTime("unixTime");
    });
    setToLocalInput.addEventListener('click', () => {
        localGmtSignInput.value = (userGmtOffset >= 0) ? "+" : "-";
        localGmtHourInput.value = pad(Math.floor(Math.abs(userGmtOffset)), 2);
        localGmtMinuteInput.value = pad(Math.floor((Math.abs(userGmtOffset) % 1) * 60), 2);
        syncTime("unixTime");
    });
    unixTimeInput.addEventListener("change", () => {
        unixTimeInput.value = limit(unixTimeInput.value, 0, 32503679999, false);
        syncTime("unixTime");
    })
    utcMonthInput.addEventListener("change", () => {
        const newValue = limit(utcMonthInput.value, 1, 12);
        utcMonthInput.value = pad(newValue, 2)
        syncTime("utcDate");
    })
    utcDayInput.addEventListener("change", () => {
        const newValue = limit(utcDayInput.value, 1, 31);
        utcDayInput.value = pad(newValue, 2)
        syncTime("utcDate");
    })
    utcYearInput.addEventListener("change", () => {
        const newValue = limit(utcYearInput.value, 1970, 2999);
        utcYearInput.value = pad(newValue, 4)
        syncTime("utcDate");
    })
    utcHourInput.addEventListener("change", () => {
        const newValue = limit(utcHourInput.value, 0, 23);
        utcHourInput.value = pad(newValue, 2)
        syncTime("utcDate");
    })
    utcMinuteInput.addEventListener("change", () => {
        const newValue = limit(utcMinuteInput.value, 0, 59);
        utcMinuteInput.value = pad(newValue, 2)
        syncTime("utcDate");
    })
    utcSecondInput.addEventListener("change", () => {
        const newValue = limit(utcSecondInput.value, 0, 59);
        utcSecondInput.value = pad(newValue, 2)
        syncTime("utcDate");
    })
    utcMillisecondInput.addEventListener("change", () => {
        const newValue = limit(utcMillisecondInput.value, 0, 999);
        utcMillisecondInput.value = pad(newValue, 3)
        syncTime("utcDate");
    })
    localMonthInput.addEventListener("change", () => {
        const newValue = limit(localMonthInput.value, 1, 12);
        localMonthInput.value = pad(newValue, 2)
        syncTime("localDate")
    })
    localDayInput.addEventListener("change", () => {
        const newValue = limit(localDayInput.value, 1, 31);
        localDayInput.value = pad(newValue, 2)
        syncTime("localDate")
    })
    localYearInput.addEventListener("change", () => {
        const newValue = limit(localYearInput.value, 1970, 2999);
        localYearInput.value = pad(newValue, 4)
        syncTime("localDate")
    })
    localHourInput.addEventListener("change", () => {
        const newValue = limit(localHourInput.value, 0, 23);
        localHourInput.value = pad(newValue, 2)
        syncTime("localDate")
    })
    localMinuteInput.addEventListener("change", () => {
        const newValue = limit(localMinuteInput.value, 0, 59);
        localMinuteInput.value = pad(newValue, 2)
        syncTime("localDate")
    })
    localSecondInput.addEventListener("change", () => {
        const newValue = limit(localSecondInput.value, 0, 59);
        localSecondInput.value = pad(newValue, 2)
        syncTime("localDate")
    })
    localMillisecondInput.addEventListener("change", () => {
        const newValue = limit(localMillisecondInput.value, 0, 999);
        localMillisecondInput.value = pad(newValue, 3)
        syncTime("localDate")
    })
    localGmtSignInput.addEventListener("change", () => {
        syncTime("unixTime")
    })
    localGmtHourInput.addEventListener("change", () => {
        const newValue = limit(localGmtHourInput.value, 0, 12);
        localGmtHourInput.value = pad(newValue, 2)
        syncTime("unixTime")
    })
    localGmtMinuteInput.addEventListener("change", () => {
        const newValue = limit(localGmtMinuteInput.value, 0, 59);
        localGmtMinuteInput.value = pad(newValue, 2)
        syncTime("unixTime")
    })
    relativeTimeUnitInput.addEventListener("change", () => {
        syncTime("unixTime");
    })
    relativeTimeDirectionInput.addEventListener("change", () => {
        syncTime("unixTime");
    })
    unixTimeInput.value = Math.floor(Date.now() / 1000);
    localGmtSignInput.value = (userGmtOffset >= 0) ? "+" : "-";
    localGmtHourInput.value = pad(Math.floor(Math.abs(userGmtOffset)), 2);
    localGmtMinuteInput.value = pad(Math.floor((Math.abs(userGmtOffset) % 1) * 60), 2);
    syncTime("unixTime");
}

function syncTime(baseInput) {
    const date = new Date();
    const localDateOffset = (localGmtSignInput.value == "+" ? 1 : -1) * 
                            (Number.parseInt(localGmtHourInput.value) * 3600 + 
                             Number.parseInt(localGmtMinuteInput.value) * 60);

    switch (baseInput) {
        case "unixTime":
            date.setTime(Number.parseFloat(unixTimeInput.value) * 1000);
            break;
        case "utcDate":
            date.setUTCMilliseconds(Number.parseInt(utcMillisecondInput.value));
            date.setUTCSeconds(Number.parseInt(utcSecondInput.value));
            date.setUTCMinutes(Number.parseInt(utcMinuteInput.value));
            date.setUTCHours(Number.parseInt(utcHourInput.value));
            date.setUTCDate(Number.parseInt(utcDayInput.value));
            date.setUTCMonth(Number.parseInt(utcMonthInput.value) - 1);
            date.setUTCFullYear(Number.parseInt(utcYearInput.value));
            break;
        case "localDate":
            date.setUTCMilliseconds(Number.parseInt(localMillisecondInput.value));
            date.setUTCSeconds(Number.parseInt(localSecondInput.value));
            date.setUTCMinutes(Number.parseInt(localMinuteInput.value));
            date.setUTCHours(Number.parseInt(localHourInput.value));
            date.setUTCDate(Number.parseInt(localDayInput.value));
            date.setUTCMonth(Number.parseInt(localMonthInput.value) - 1);
            date.setUTCFullYear(Number.parseInt(localYearInput.value));
            date.setTime(date.getTime() - localDateOffset * 1000);
            break;
        default:
            throw Error("Invalid base input type.")
    }

    unixTimeInput.value = date.getTime() / 1000;

    utcDayOfWeek.innerHTML = dayOfWeek[date.getUTCDay()];
    utcMonthInput.value = pad((date.getUTCMonth() + 1), 2);
    utcDayInput.value = pad(date.getUTCDate(), 2);
    utcYearInput.value = date.getUTCFullYear();
    utcHourInput.value = pad(date.getUTCHours(), 2);
    utcMinuteInput.value = pad(date.getUTCMinutes(), 2);
    utcSecondInput.value = pad(date.getUTCSeconds(), 2);
    utcMillisecondInput.value = pad(date.getUTCMilliseconds(), 3);

    date.setTime(date.getTime() + localDateOffset * 1000);
    localDayOfWeek.innerHTML = dayOfWeek[date.getUTCDay()];  
    localMonthInput.value = pad((date.getUTCMonth() + 1), 2);
    localDayInput.value = pad(date.getUTCDate(), 2);
    localYearInput.value = date.getUTCFullYear();
    localHourInput.value = pad(date.getUTCHours(), 2);
    localMinuteInput.value = pad(date.getUTCMinutes(), 2);
    localSecondInput.value = pad(date.getUTCSeconds(), 2);
    localMillisecondInput.value = pad(date.getUTCMilliseconds(), 3);
    date.setTime(date.getTime() - localDateOffset * 1000);

    const secDiff = (Date.now() - date.getTime()) / 1000;
    const diffDir = relativeTimeDirectionInput.value == "ago" ? 1 : -1;

    switch (relativeTimeUnitInput.value) {
        case "seconds":
            relativeTimeInput.innerHTML = Math.round(secDiff) * diffDir;
            break
        case "minutes":
            relativeTimeInput.innerHTML = Math.round(secDiff / 60) * diffDir;
            break
        case "hours":
            relativeTimeInput.innerHTML = Math.round(secDiff / 3600) * diffDir;
            break
        case "days":
            relativeTimeInput.innerHTML = Math.round(secDiff / 86400) * diffDir;
            break
        case "months":
            relativeTimeInput.innerHTML = Math.round(secDiff / 2629756.8) * diffDir;
            break
        case "years":
            relativeTimeInput.innerHTML = Math.round(secDiff / 31557600) * diffDir;
            break
    }
}

function pad(number, numDigits) {
    return number.toString().padStart(numDigits, "0");
}

function limit(number, min, max, isInteger = true) {
    if (isInteger)
        return Math.floor(Math.min(Math.max(number, min), max));
    else
        return Math.min(Math.max(number, min), max);
}
