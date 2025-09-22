/************************************

    DOM, constants, global variables

 ************************************/

// DOM
const pencilButton = document.getElementById("pencil-button");
const eraserButton = document.getElementById("eraser-button");
const rectangleButton = document.getElementById("rectangle-button");
const circleButton = document.getElementById("circle-button");
const lineButton = document.getElementById("line-button");
const arrowButton = document.getElementById("arrow-button");
const textButton = document.getElementById("text-button");
const boxedTextButton = document.getElementById("boxed-text-button");
const strokeColorButton = document.getElementById("stroke-color-button");
const strokeColorBox = document.getElementById("stroke-color-box");
const strokeColorPickerBox = document.getElementById("stroke-color-picker-box");
const fillColorButton = document.getElementById("fill-color-button");
const fillColorBox = document.getElementById("fill-color-box");
const fillColorPickerBox = document.getElementById("fill-color-picker-box");
const resizeButton = document.getElementById("resize-button");
const resizeBox = document.getElementById("resize-box");
const resizeWidth = document.getElementById("resize-width");
const resizeHeight = document.getElementById("resize-height");
const resizeConfirmButton = document.getElementById("resize-confirm-button");
const thicknessPickerButton = document.getElementById("thickness-picker-button");
const thicknessBox = document.getElementById("thickness-box");
const thicknessPickerBox = document.getElementById("thickness-picker-box");
const thicknessSlider = document.getElementById("thickness-slider");
const thicknessToolTipBox = document.getElementById("thickness-tool-tip");
const resetButton = document.getElementById("reset-button");
const downloadButton = document.getElementById("download-button");
const toolTipBox = document.getElementById("tool-tip");
const canvas = document.getElementById("canvas");

// Constants
const buttonClickedClassName = "clicked";
const toolButtons = [
    pencilButton, eraserButton, 
    rectangleButton, circleButton, 
    lineButton, arrowButton,
    textButton, boxedTextButton, 
    strokeColorButton, fillColorButton,
    resizeButton, thicknessPickerButton,
    resetButton, downloadButton,
];
const toolButtonToolTips = [
    "Pencil", "Eraser",
    "Rectangle", "Circle",
    "Straight line", "Arrow",
    "Text", "Boxed text",
    "Stroke color", "Fill color",
    "Resize whiteboard", "Stroke thickness",
    "Reset whiteboard", "Download whiteboard (PNG)"
];
const modes = {
    pencil: 0,
    eraser: 1,
    rectangle: 2,
    circle: 3,
    line: 4,
    arrow: 5,
    text: 6,
    boxedText: 7,
    strokeColorPick: 8,
    fillColorPick: 9,
    resize: 10,
    thicknessPick: 11,
    reset: 12,
    download: 13
};
const initialMode = modes.pencil;
const popUpBoxes = {
    strokeColorPicker: strokeColorPickerBox,
    fillColorPicker: fillColorPickerBox,
    resize: resizeBox,
    thicknessPicker: thicknessPickerBox
}
const popUpBoxToolButtons = [
    strokeColorButton,
    fillColorButton,
    resizeButton,
    thicknessPickerButton
]
const colors = [
    ["#f1a199", "#ffc67b", "#ffe6a2", "#80e5b1", "#92e8e8", "#a6a1e6", "#e2a1e6"],
    ["#e54234", "#ff8d02", "#ffcd44", "#00cc62", "#26d2d1", "#4e7de9", "#c544ce"],
    ["#ff0000", "#ffa500", "#ffff00", "#00ff00", "#00ffff", "#0000ff", "#800080"],
    ["#882720", "#b54800", "#d69a00", "#007a3b", "#167e7d", "#2f4b8b", "#76287b"],
    [null, "#ffffff", "#cdcdcd", "#9c9c9c", "#696969", "#373737", "#000000"]
];
const colorTypes = {
    stroke: "stroke",
    fill: "fill"
}
const strokeColorButtons = {};
const fillColorButtons = {};
const initialStrokeColor = "#000000";
const initialFillColor = null; // null indicates no color
const noColorSelectedBackground = `
    linear-gradient(to top left,
        rgb(255, 255, 255) 0%,
        rgba(255, 255, 255) calc(50% - 1.3px),
        rgb(255, 0, 0) 50%,
        rgba(255, 255, 255) calc(50% + 1.3px),
        rgba(255, 255, 255) 100%)
`;
const minThickness = 1;
const maxThickness = 30;
const initialThickness = 3;
const thicknessThumbRadius = 9;
const thicknessToolTipHeight = 22.38;
const thicknessSliderLength = 120;
const thicknessSliderContainerPadding = 5;
const canvasScaleFactor = 2;
const minCanvasSize = 10;
const maxCanvasSize = 2000;
const initialCanvasWidth = null;
const initialCanvasHeight = null;
const cursorStrokeWidth = 1;
const crosshairLength = 18;
const textCursorWidth = 18;
const textCursorHeight = 22;
const cursorTypes = {
    circle: "circle",
    crosshair: "crosshair",
    text: "text"
};

// Global variables
let openPopUpBox;
let selectedMode;
let strokeColor;
let fillColor;
let selectedThickness;
let canvasMouseDown = false;





/************************************

    Toolbox Logic

 ************************************/

function initializeToolBox() {
    document.body.addEventListener("mousedown", (e) => {
        for (let i = 0; i < popUpBoxToolButtons.length; i++) {
            if (popUpBoxToolButtons[i].contains(e.target))
                return;
        }

        if (openPopUpBox && !openPopUpBox.contains(e.target))
            hidePopUpBox(openPopUpBox);
    });

    for (let i = 0; i < toolButtons.length; i++) {
        toolButtons[i].addEventListener("click", () => { 
            pickMode(i);
        });
        toolButtons[i].addEventListener("mousemove", (e) => {
            showToolTip(e.pageX + 6, e.pageY + 6, toolButtonToolTips[i]);
        });
        toolButtons[i].addEventListener("mouseout", () => {
            hideToolTip();
        });
    }

    pickMode(initialMode);
}

function pickMode(mode) {
    if (mode == modes.reset) {
        resetCanvas();
    }
    else if (mode == modes.download) {
        downloadCanvas();
    }
    else if (mode == modes.strokeColorPick) {
        if (openPopUpBox == popUpBoxes.strokeColorPicker)
            hidePopUpBox(openPopUpBox);
        else
            showPopUpBox(
                popUpBoxes.strokeColorPicker,
                strokeColorButton.getClientRects()["0"].right - 6,
                strokeColorButton.getClientRects()["0"].bottom - 6
            );
    }
    else if (mode == modes.fillColorPick)
        if (openPopUpBox == popUpBoxes.fillColorPicker)
            hidePopUpBox(openPopUpBox)
        else
            showPopUpBox(
                popUpBoxes.fillColorPicker,
                fillColorButton.getClientRects()["0"].right - 6,
                fillColorButton.getClientRects()["0"].bottom - 6
            );
    else if (mode == modes.resize)
        if (openPopUpBox == popUpBoxes.resize)
            hidePopUpBox(openPopUpBox)
        else
            showPopUpBox(
                popUpBoxes.resize,
                resizeButton.getClientRects()["0"].right - 6,
                resizeButton.getClientRects()["0"].bottom - 6
            );
    else if (mode == modes.thicknessPick)
        if (openPopUpBox == popUpBoxes.thicknessPicker)
            hidePopUpBox(openPopUpBox)
        else
            showPopUpBox(
                popUpBoxes.thicknessPicker,
                thicknessPickerButton.getClientRects()["0"].right - 6,
                (thicknessPickerButton.getClientRects()["0"].top +
                 thicknessPickerButton.getClientRects()["0"].bottom) / 2 - 
                (thicknessSliderContainerPadding + thicknessThumbRadius) -
                (thicknessSliderLength - 2 * thicknessThumbRadius) *
                (maxThickness - thicknessSlider.value) / (maxThickness - minThickness)
            );
    else {
        for (let i = 0; i < toolButtons.length; i++)
            toolButtons[i].classList.remove(buttonClickedClassName)
        selectedMode = mode;
        toolButtons[mode].classList.add(buttonClickedClassName);
    }
}

function showToolTip(x, y, text) {
    toolTipBox.style.display= "inline";
    toolTipBox.style.left = `${x}px`;
    toolTipBox.style.top = `${y}px`;
    toolTipBox.innerHTML = text;
}

function hideToolTip() {
    toolTipBox.style.display = "none";
}

function showPopUpBox(box, x, y) {
    hidePopUpBox(openPopUpBox);

    box.style.display= "inline";
    box.style.left = `${x}px`;
    box.style.top = `${y}px`;

    openPopUpBox = box;
}

function hidePopUpBox(box) {
    if (!box)
        return;

    box.style.display = "none";
    openPopUpBox = null;
}





/************************************

    Color Picker Logic

 ************************************/

function initializeColorPickerBoxes() {
    for (let i = 0; i < colors.length; i++) {
        const strokeColorPickerRow = document.createElement("div");
        const fillColorPickerRow = document.createElement("div");
        
        strokeColorPickerRow.classList.add("color-picker-row");
        fillColorPickerRow.classList.add("color-picker-row");
        
        for (let j = 0; j < colors[i].length; j++) {
            strokeColorPickerRow.appendChild(createColorButton(colorTypes.stroke, colors[i][j]));
            fillColorPickerRow.appendChild(createColorButton(colorTypes.fill, colors[i][j]));
        }
        
        strokeColorPickerBox.appendChild(strokeColorPickerRow);
        fillColorPickerBox.appendChild(fillColorPickerRow);
    }

    pickColor(colorTypes.stroke, initialStrokeColor);
    pickColor(colorTypes.fill, initialFillColor);
}
    
function createColorButton(type, color) {
    const colorButton = document.createElement("button");
    colorButton.classList.add("color-button");
    colorButton.style.background = color ? color : noColorSelectedBackground;
    
    if (type == colorTypes.stroke) {
        colorButton.addEventListener("click", (e) => {
            pickColor(colorTypes.stroke, color);
        });
        strokeColorButtons[color] = colorButton;
    }
    else if (type == colorTypes.fill) {
        colorButton.addEventListener("click", (e) => {
            pickColor(colorTypes.fill, color);
        });
        fillColorButtons[color] = colorButton;
    }

    return colorButton;
}

function pickColor(type, color) {
    if (type == colorTypes.stroke) {
        for (let colorKey in strokeColorButtons)
            strokeColorButtons[colorKey].classList.remove("clicked");
        strokeColor = color;
        strokeColorBox.style.background = (color) ? color : noColorSelectedBackground;
        strokeColorButtons[color].classList.add("clicked");
        pickThickness(thicknessSlider.value); // change thickness icon color
    }
    else if (type == colorTypes.fill) {
        for (let colorKey in fillColorButtons)
            fillColorButtons[colorKey].classList.remove("clicked");
        fillColor = color;
        fillColorBox.style.background = (color) ? color : noColorSelectedBackground;
        fillColorButtons[color].classList.add("clicked");
    }
    hidePopUpBox(openPopUpBox);
}





/************************************

    Resize Box Logic

 ************************************/

function initializeResizeBox() {   
    resizeWidth.value = canvas.clientWidth;
    resizeWidth.addEventListener("change", () => {
        resizeWidth.value = Math.max(minCanvasSize, Math.min(maxCanvasSize, resizeWidth.value));
    });

    resizeHeight.value = canvas.clientHeight;
    resizeHeight.addEventListener("change", () => {
        resizeHeight.value = Math.max(minCanvasSize, Math.min(maxCanvasSize, resizeHeight.value));
    });

    resizeConfirmButton.addEventListener("click", () => {
        resizeCanvas(resizeWidth.value, resizeHeight.value);
        hidePopUpBox(openPopUpBox);
    });
}





/************************************

    Thickness Picker Logic

 ************************************/

function initializeThicknessPicker() {
    thicknessSlider.min = minThickness;
    thicknessSlider.max = maxThickness;
    thicknessSlider.value = initialThickness;
    
    thicknessSlider.addEventListener('mousedown', () => {
        pickThickness(thicknessSlider.value);
        showThicknessToolTip();
    });
    
    thicknessSlider.addEventListener('input', () => {
        pickThickness(thicknessSlider.value);
        showThicknessToolTip();
    });
    
    thicknessSlider.addEventListener('change', () => {
        hidePopUpBox(openPopUpBox);
    });
    
    document.body.addEventListener('mouseup', () => {
        hideThicknessToolTip();
    });
    
    pickThickness(thicknessSlider.value);
}

function showThicknessToolTip() {
    const sliderRect = thicknessSlider.getBoundingClientRect();

    const toolTipMaxY = sliderRect.top - thicknessToolTipHeight / 2 + thicknessThumbRadius;
    const toolTipMinY = sliderRect.bottom - thicknessToolTipHeight / 2 - thicknessThumbRadius;

    thicknessToolTipBox.style.opacity= "1";
    thicknessToolTipBox.style.left = `${sliderRect.right + 17}px`;
    thicknessToolTipBox.style.top = `${
        toolTipMinY + (toolTipMaxY - toolTipMinY) *
        (thicknessSlider.value - minThickness) / 
        (maxThickness - minThickness)
    }px`;
    thicknessToolTipBox.innerHTML = thicknessSlider.value;
}

function hideThicknessToolTip() {
    thicknessToolTipBox.style.opacity= "0";
}

function pickThickness(thickness) {
    thicknessBox.style.width = `${thickness}px`;
    thicknessBox.style.height = `${thickness}px`;
    thicknessBox.style.backgroundColor = strokeColor;
    selectedThickness = thickness;
}





/************************************

    Canvas Logic

 ************************************/

function initializeCanvas() {
    canvas.addEventListener("mouseover", setCursorStyle);
}


const mainLayer = document.createElement('canvas');
const mainLayerCtx = mainLayer.getContext('2d');
mainLayer.classList.add("canvas-layer");
canvas.appendChild(mainLayer);

resizeCanvas(400, 400);

let lastX, lastY

let rect;

mainLayer.addEventListener('mousedown', (e) => {
    canvasMouseDown = true;

    rect = mainLayer.getBoundingClientRect();
    mainLayerCtx.lineWidth = selectedThickness;
    mainLayerCtx.lineCap = "round";
    mainLayerCtx.lineJoin = "round";
    mainLayerCtx.strokeStyle = strokeColor; // TODO: Handle case where color = null;


    mainLayerCtx.beginPath();
    mainLayerCtx.moveTo(0, 0);
    mainLayerCtx.lineTo(400, 400);
    mainLayerCtx.stroke();
    mainLayerCtx.closePath();



    mainLayerCtx.beginPath();
    mainLayerCtx.moveTo((e.clientX - rect.left) * canvasScaleFactor, (e.clientY - rect.top) * canvasScaleFactor);
    lastX = (e.clientX - rect.left) * canvasScaleFactor;
    lastY = (e.clientY - rect.top) * canvasScaleFactor;
});

mainLayer.addEventListener('mousemove', (e) => {
    if (!canvasMouseDown)
        return;

    // const rect = mainLayer.getBoundingClientRect(); // TODO: Do not call this every time on mousemove

    const endX = (e.clientX - rect.left) * canvasScaleFactor;
    const endY = (e.clientY - rect.top) * canvasScaleFactor;
    const diffX = (endX - lastX) / canvasScaleFactor;
    const diffY = (endY - lastY) / canvasScaleFactor;

    // for (let i = 1; i <= canvasScaleFactor; i++) {
    //     mainLayerCtx.lineTo(lastX + diffX * i, lastY + diffY * i);
    // }
    mainLayerCtx.lineTo(endX, endY);
    mainLayerCtx.stroke();

    lastX = (e.clientX - rect.left) * canvasScaleFactor;
    lastY = (e.clientY - rect.top) * canvasScaleFactor;
});

document.body.addEventListener('mouseup', () => {
    canvasMouseDown = false;

    mainLayerCtx.closePath();
});


// stuff from tool box
    // let selectedMode;
    // let strokeColor;
    // let fillColor;
    // let selectedThickness;

// global constants
    // const minCanvasSize = 10;
    // const maxCanvasSize = 2000;
    // const initialCanvasWidth = null;
    // const initialCanvasHeight = null;

function resizeCanvas(width, height) {
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    mainLayer.width = width * canvasScaleFactor;
    mainLayer.height = height * canvasScaleFactor;
}

function resetCanvas() {
    // TODO
    console.log("reset complete");
}

function downloadCanvas() {
    // TODO
    console.log("download complete");
}

function generateCustomCursorCss(cursorType, length) {
    let svg, hotspotX, hotspotY;

    switch (cursorType) {
        case cursorTypes.circle:
            if (length > 1) {
                svg = `
                    <svg xmlns="http://www.w3.org/2000/svg" width="${length}" height="${length}" viewBox="0 0 ${length} ${length}">
                        <circle cx="${length / 2}" cy="${length / 2}" r="${length / 2 - cursorStrokeWidth / 2}" stroke="#000000" stroke-width="${cursorStrokeWidth}" fill="none" />
                    </svg>
                `;
                hotspotX = length / 2;
                hotspotY = length / 2;
            }
            else {
                svg = `
                    <svg xmlns="http://www.w3.org/2000/svg" width="1" height="1" viewBox="0 0 1 1">
                        <circle cx="0.5" cy="0.5" r="1" stroke="none" stroke-width="0" fill="#000000" />
                    </svg>
                `;
                hotspotX = 0.5;
                hotspotY = 0.5;
            }
            break;
        case cursorTypes.crosshair:
            svg = `
                <svg xmlns="http://www.w3.org/2000/svg" width="${crosshairLength}" height="${crosshairLength}" viewBox="0 0 ${crosshairLength} ${crosshairLength}">
                    <line x1="0" y1="${crosshairLength / 2}" x2="${crosshairLength}" y2="${crosshairLength / 2}" stroke="#000000" stroke-width="${cursorStrokeWidth}" />
                    <line x1="${crosshairLength / 2}" y1="0" x2="${crosshairLength / 2}" y2="${crosshairLength}" stroke="#000000" stroke-width="${cursorStrokeWidth}" />
                </svg>
            `;
            hotspotX = crosshairLength / 2;
            hotspotY = crosshairLength / 2;
            break;
        case cursorTypes.text:
            svg = `
                <svg xmlns="http://www.w3.org/2000/svg" width="${textCursorWidth}" height="${textCursorHeight}" viewBox="0 0 ${textCursorWidth} ${textCursorHeight}">
                    <rect x="0" y="0" width="${textCursorWidth}" height="${textCursorHeight}" stroke="#000000" stroke-width="${cursorStrokeWidth}" fill="none" />
                    <line x1="${textCursorWidth / 2}" y1="2" x2="${textCursorWidth / 2}" y2="${textCursorHeight - 2}" stroke="#000000" stroke-width="${cursorStrokeWidth}" />    
                </svg>
                `;
            hotspotX = textCursorWidth / 2;
            hotspotY = textCursorHeight / 2;
            break;
        default:
            return "crosshair";
    }

    return `url(data:image/svg+xml;base64,${btoa(svg)}) ${hotspotX} ${hotspotY}, crosshair`;
}

function setCursorStyle() {
    let cursor;

    switch (selectedMode) {
        case modes.pencil:
        case modes.eraser:
            cursor = generateCustomCursorCss(cursorTypes.circle, selectedThickness);
            break;
        case modes.rectangle:
        case modes.circle:
        case modes.line:
        case modes.arrow:
            cursor = generateCustomCursorCss(cursorTypes.crosshair);
            break;
        case modes.text:
        case modes.boxedText:
            cursor = generateCustomCursorCss(cursorTypes.text);
            break;
    }

    canvas.style.cursor = cursor;
}





/************************************

    Top-level Document Logic

 ************************************/

document.addEventListener('DOMContentLoaded', () => {
    // **Order of initialization matters**
    initializeResizeBox();
    initializeColorPickerBoxes();
    initializeThicknessPicker();
    initializeToolBox();
    initializeCanvas();
});
