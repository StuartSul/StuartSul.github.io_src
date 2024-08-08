

const wheel = document.getElementById("spinning-wheel");
const wheelInput = document.getElementById("wheel-input");
const wheelButton = document.getElementById("wheel-button");
const wheelLabel = document.getElementById("winner-label");
const wheelVertices = ["100% 0%", "100% 50%", "100% 100%", "50% 100%", "0% 100%", "0% 50%", "0% 0%", "50% 0%"];
const colors = ["#ffadad", "#ffd6a5", "#fdffb6", "#caffbf", "#9bf6ff", "#a0c4ff", "#bdb2ff", "#ffc6ff", "#fffffc"];
const defaultLabels = ["Jake", "Emily", "Ryan", "Samantha", "Liam", "Olivia"];
const minSpins = 5;
const maxSpins = 10;

let labels;
let currDeg = 0;
let timeout;
initialize();

wheelInput.oninput = () => {
    createWheel();
};

wheelButton.onclick = () => {
    clearTimeout(timeout)
    
    const idx = Math.floor(Math.random() * labels.length);
    const theta = (Math.random() + idx) * 360 / labels.length;
    const numSpins = Math.floor(Math.random() * (maxSpins - minSpins)) + minSpins;
    const totalTheta = numSpins * 360 - theta;
    
    currDeg += totalTheta + 360 - currDeg % 360;
    wheel.style.transform = `rotate(${currDeg}deg)`;

    timeout = setTimeout(() => {
        wheelLabel.textContent = `Selected: ${labels[idx]}`;
    }, 5000);
};

function initialize() {
    wheelInput.value = defaultLabels.join("\n");
    wheelInput.placeholder = "Enter labels on each line...";
    createWheel();
}

function createWheel() {
    labels = wheelInput.value.split(/\r?\n|\r|\n/g);
    wheel.innerHTML = '';
    clearTimeout(timeout);

    for (let i = 0; i < labels.length; i++)
        createSector(1 / labels.length, i / labels.length, labels[i], colors[i % colors.length])
}

/**
 * Creates and returns a concise circle sector.
 * @param  {Number} probability  A float between 0 and 1 indicating sector theta.
 * @param  {Number} occupied   A float between 0 and 1 indicating the area taken.
 * @param  {String} label A label to attach to the sector.
 * @param  {String} color A background color for the sector.
 */
function createSector(probability, occupied, label, color) {

    const sector = document.createElement("div");
    const baseRotation = occupied * 360
    
    const labelElem = document.createElement("span");
    labelElem.classList.add("sector-label");
    labelElem.textContent = label;
    labelElem.style.transform = `rotate(${360 * probability / 2 + baseRotation}deg)`;
    wheel.appendChild(labelElem)
    
    let idx = 0;
    clipPath = ["50% 50%", "50% 0%"]
    
    while (probability > 0) {
        if (probability >= 0.125) {
            clipPath.push(wheelVertices[idx]);
            probability -= 0.125
            idx += 1
        } else {
            switch (idx) {
                case 0:
                    x = 0.5 * Math.tan(Math.PI * 2 * probability) + 0.5
                    y = 1
                    break;
                case 1:
                    x = 1
                    y = 0.5 * Math.tan(Math.PI / 4 - Math.PI * 2 * probability) + 0.5
                    break;
                case 2:
                    x = 1
                    y = 0.5 - 0.5 * Math.tan(Math.PI * 2 * probability)
                    break;
                case 3:
                    x = 0.5 * Math.tan(Math.PI / 4 - Math.PI * 2 * probability) + 0.5
                    y = 0
                    break;
                case 4:
                    x = 0.5 - 0.5 * Math.tan(Math.PI * 2 * probability)
                    y = 0
                    break;
                case 5:
                    x = 0
                    y = 0.5 - 0.5 * Math.tan(Math.PI / 4 - Math.PI * 2 * probability)
                    break;
                case 6:
                    x = 0
                    y = 0.5 + 0.5 * Math.tan(Math.PI * 2 * probability)
                    break;
                case 7:
                    x = 0.5 - 0.5 * Math.tan(Math.PI / 4 - Math.PI * 2 * probability)
                    y = 1
                    break;
            }
            clipPath.push(`${Math.round(x * 100)}% ${Math.round((1 - y) * 100)}%`)
            break
        }
    }
    
    sector.classList.add("sector")
    sector.style.background = color;
    sector.style.clipPath = `polygon(${clipPath.join(", ")})`;
    sector.style.transform = `rotate(${baseRotation}deg)`;
    wheel.appendChild(sector);
}
