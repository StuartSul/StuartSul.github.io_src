const initialCanvasWidth = 400;
const borderWidth = 2.5;
const borderColor = "#c7c7c7";
const canvasMessage = "Drag an image here or click to upload";
const maxWidth = 760
const maxHeight = 500
const maxInputSize = 9999;
const cropBoxColor = "#333";
const cropBoxOuterAreaColor = "#9999";
const cropBoxOuterLineWidthBase = 1;
const cropBoxTickWidthBase = 3;
const cropBoxTickLengthBase = 10;
const cropBoxClickToleranceBase = 15;

const body = document.getElementsByTagName("body")[0];
const canvas = document.getElementById("canvas");
const uiLayer = document.getElementById("ui-layer");
const imageLayer = document.getElementById("image-layer");
const resBox = document.getElementById("res");
const upload = document.getElementById("upload");
const resizeInput = document.getElementById("resize");
const formatInput = document.getElementById("format");
const resizeControlBox = document.getElementById("resize-controls")
const widthLabel = document.getElementById("currWidth");
const heightLabel = document.getElementById("currHeight");
const widthInput = document.getElementById("width");
const heightInput = document.getElementById("height");
const keepRatioInput = document.getElementById("keep-ratio");
const downloadButton = document.getElementById("download-button");

const renderLayer = document.createElement("canvas");
const renderLayerCtx = renderLayer.getContext("2d");
const uiLayerCtx = uiLayer.getContext("2d");
const imageLayerCtx = imageLayer.getContext("2d");

let origFileName;
let origFileExtension;
let initialUploadDone = false;
let mouseX;
let mouseY;
let mouseDown = false;
let zoom = 1.0;
let cropBox;
let selectedCropPoint; // clock-wise from top-left, possible values are 0...7 + 8 (box movement)

initializeCanvas();

function changeCanvasSize(width, height) {
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    uiLayer.width = width;
    uiLayer.height = height;
    imageLayer.width = width;
    imageLayer.height = height;
}

function initializeCanvas() {
    // Set initial canvas size
    changeCanvasSize(initialCanvasWidth, initialCanvasWidth * 9 / 21);
    const centerX = Math.floor(uiLayer.width / 2);
    const centerY = Math.floor(uiLayer.height / 2);

    // Draw elements
    drawBorders(uiLayerCtx, borderWidth, borderColor, [10, 10]);
    drawDownloadIcon(uiLayerCtx, centerX - 35, centerY + 5, 70);

    // Write instruction message
    uiLayerCtx.font = `500 20px "Open Sans", sans-serif`;
    uiLayerCtx.textAlign = "center";
    uiLayerCtx.fillText(canvasMessage, centerX, centerY + 45);

    // Set default inputs
    widthInput.disabled = true;
    heightInput.disabled = true;
    resizeInput.checked = false;
    resizeInput.disabled = true;
    keepRatioInput.checked = true;
    keepRatioInput.disabled = true;
    formatInput.disabled = true;
    downloadButton.disabled = true;

    // Set event listeners
    body.addEventListener('dragover', (event) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'copy';
    });
    body.addEventListener('drop', (event) => {
        event.preventDefault();
        const file = event.dataTransfer.files[0];
        handleImageUpload(file);
    });
    canvas.addEventListener('click', handleCanvasClick);
    upload.addEventListener('change', (event) => {
        const file = event.target.files[0];
        handleImageUpload(file);
    });
    widthInput.addEventListener('input', () => {
        if (widthInput.value > maxInputSize)
            widthInput.value = maxInputSize;
        
        if (keepRatioInput.checked) {
            const origW = cropBox.bottomRight.x - cropBox.topLeft.x;
            const origH = cropBox.bottomRight.y - cropBox.topLeft.y;
            let newHeight = Math.round(widthInput.value * origH / origW);

            if (newHeight > maxInputSize) {
                newHeight = maxInputSize;
                widthInput.value = Math.round(maxInputSize * origW / origH);
            }
            heightInput.value = newHeight;
        }
    });
    heightInput.addEventListener('input', () => {
        if (heightInput.value > maxInputSize)
            heightInput.value = maxInputSize;

        if (keepRatioInput.checked) {
            const origW = cropBox.bottomRight.x - cropBox.topLeft.x;
            const origH = cropBox.bottomRight.y - cropBox.topLeft.y;
            let newWidth = Math.round(heightInput.value * origW / origH);

            if (newWidth > maxInputSize) {
                newWidth = maxInputSize;
                heightInput.value = Math.round(maxInputSize * origH / origW);
            }
            widthInput.value = newWidth;
        }
    });
    resizeInput.addEventListener('change', () => {
        if (resizeInput.checked) {
            widthInput.disabled = false;
            heightInput.disabled = false;
            keepRatioInput.disabled = false;
        } else {
            widthInput.disabled = true;
            heightInput.disabled = true;
            keepRatioInput.disabled = true;
        }
    });
    keepRatioInput.addEventListener('change', () => {
        if (keepRatioInput.checked) {
            const origW = cropBox.bottomRight.x - cropBox.topLeft.x;
            const origH = cropBox.bottomRight.y - cropBox.topLeft.y;
            let newWidth = Math.round(widthInput.value * origW / origH);
            let newHeight = Math.round(widthInput.value * origH / origW);

            if (newHeight > maxInputSize) {
                newHeight = maxInputSize;
                widthInput.value = Math.round(maxInputSize * origW / origH);
                heightInput.value = newHeight;
            } else if (newWidth > maxInputSize) {
                newWidth = maxInputSize;
                heightInput.value = Math.round(maxInputSize * origH / origW);
                widthInput.value = newWidth;
            } else {
                heightInput.value = newHeight;
            }
        }
    });
}

function drawBorders(ctx, width, color, dashStyle) {
    ctx.lineWidth = width;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = color;
    ctx.setLineDash(dashStyle);

    ctx.strokeRect(
        0 + width, 0 + width, 
        uiLayer.width - width * 2, 
        uiLayer.height - width * 2
    );
}

function drawDownloadIcon(ctx, x, y, width) {
    const w2 = Math.round(width / 2);
    const w3 = Math.round(width / 3);
    const w4 = Math.round(width / 4);
    const w5 = Math.round(width / 5);
    const w6 = Math.round(width / 6);

    ctx.lineWidth = 6;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "#333";
    ctx.setLineDash([]);

    ctx.beginPath();
    ctx.moveTo(x, y - w3);
    ctx.lineTo(x, y);
    ctx.lineTo(x + width, y);
    ctx.lineTo(x + width, y - w3);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(x + w2, y - width + w6);
    ctx.lineTo(x + w2, y - w5);
    ctx.lineTo(x + w4, y - w2);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(x + w2, y - w5);
    ctx.lineTo(x + width - w4, y - w2);
    ctx.stroke();
}

function handleCanvasClick() {
    upload.click();
}

function handleImageUpload(file) {
    const image = new Image();
    const reader = new FileReader();
    origFileName = file.name.split('.').slice(0, -1).join('.');
    origFileExtension = file.name.split('.').pop();
    
    reader.onload = (e) => {
        image.src = e.target.result;
        image.onload = () => {
            zoom = Math.min(maxWidth / image.width, maxHeight / image.height, 1.0);
            console.log(zoom);
            canvas.style.zoom = zoom;

            cropBox = {
                topLeft: {
                    x: 0,
                    y: 0
                },
                bottomRight: {
                    x: image.width,
                    y: image.height
                }
            }

            if (!initialUploadDone) {
                handleInitialImageUpload(image);
                initialUploadDone = true;
            }

            changeCanvasSize(image.width, image.height);
            widthLabel.innerHTML = image.width;
            widthInput.value = image.width;
            heightLabel.innerHTML = image.height;
            heightInput.value = image.height;
        
            canvas.classList.add("bordered-canvas");
            imageLayerCtx.drawImage(image, 0, 0);

            drawCropBox(
                cropBox, cropBoxOuterLineWidthBase / zoom, cropBoxTickWidthBase / zoom, cropBoxTickLengthBase / zoom
            );
        };
    };

    reader.readAsDataURL(file);
}

function handleInitialImageUpload() {
    resizeInput.disabled = false;
    formatInput.disabled = false;
    downloadButton.disabled = false;

    canvas.removeEventListener('click', handleCanvasClick);

    uiLayer.addEventListener('mousedown', (e) => {
        mouseDown = true;

        const pageX = e.pageX;
        const pageY = e.pageY;
        const offsetX = e.offsetX / zoom;
        const offsetY = e.offsetY / zoom;
        const cropBoxClickTolerance = cropBoxClickToleranceBase / zoom;
        
        resBox.style.display = "inline";
        resBox.style.left = `${pageX + 4}px`;
        resBox.style.top = `${pageY + 4}px`;
        resBox.innerHTML = `${Math.round(cropBox.bottomRight.x - cropBox.topLeft.x)} x ${Math.round(cropBox.bottomRight.y - cropBox.topLeft.y)}`;

        // top left
        if (Math.abs(cropBox.topLeft.x - offsetX) < cropBoxClickTolerance &&
            Math.abs(cropBox.topLeft.y - offsetY) < cropBoxClickTolerance) {
            selectedCropPoint = 0;
            body.style.cursor = "nwse-resize";
        }
        
        // top center
        else if (Math.abs((cropBox.topLeft.x + cropBox.bottomRight.x) / 2 - offsetX) < cropBoxClickTolerance &&
                 Math.abs(cropBox.topLeft.y - offsetY) < cropBoxClickTolerance) {
            selectedCropPoint = 1;
            body.style.cursor = "row-resize";
        }
        
        // top right
        else if (Math.abs(cropBox.bottomRight.x - offsetX) < cropBoxClickTolerance &&
                 Math.abs(cropBox.topLeft.y - offsetY) < cropBoxClickTolerance) {
            selectedCropPoint = 2;
            body.style.cursor = "nesw-resize";
        }
        
        // center right
        else if (Math.abs(cropBox.bottomRight.x - offsetX) < cropBoxClickTolerance &&
                 Math.abs((cropBox.topLeft.y + cropBox.bottomRight.y) / 2 - offsetY) < cropBoxClickTolerance) {
            selectedCropPoint = 3;
            body.style.cursor = "col-resize";
        }
        
        // bottom right
        else if (Math.abs(cropBox.bottomRight.x - offsetX) < cropBoxClickTolerance &&
                 Math.abs(cropBox.bottomRight.y - offsetY) < cropBoxClickTolerance) {
            selectedCropPoint = 4;
            body.style.cursor = "nwse-resize";
        }
        
        // bottom center
        else if (Math.abs((cropBox.topLeft.x + cropBox.bottomRight.x) / 2 - offsetX) < cropBoxClickTolerance &&
                 Math.abs(cropBox.bottomRight.y - offsetY) < cropBoxClickTolerance) {
            selectedCropPoint = 5;
            body.style.cursor = "row-resize";
        }

        // bottom left
        else if (Math.abs(cropBox.topLeft.x - offsetX) < cropBoxClickTolerance &&
                 Math.abs(cropBox.bottomRight.y - offsetY) < cropBoxClickTolerance) {
            selectedCropPoint = 6;
            body.style.cursor = "nesw-resize";
        }

        // center left
        else if (Math.abs(cropBox.topLeft.x - offsetX) < cropBoxClickTolerance &&
                 Math.abs((cropBox.topLeft.y + cropBox.bottomRight.y) / 2 - offsetY) < cropBoxClickTolerance) {
            selectedCropPoint = 7;
            body.style.cursor = "col-resize";
        }
        
        // inner-box
        else if (cropBox.topLeft.x <= offsetX && offsetX <= cropBox.bottomRight.x &&
                 cropBox.topLeft.y <= offsetY && offsetY <= cropBox.bottomRight.y) {
            selectedCropPoint = 8;
            body.style.cursor = "grabbing";
        }

        else {
            mouseDown = false;
            selectedCropPoint = -1;
        }
    });
    uiLayer.addEventListener('mousemove', (e) => {
        if (mouseDown)
            return;

        const offsetX = e.offsetX / zoom;
        const offsetY = e.offsetY / zoom;
        const cropBoxClickTolerance = cropBoxClickToleranceBase / zoom;

        // top left && bottom right
        if ((Math.abs(cropBox.topLeft.x - offsetX) < cropBoxClickTolerance &&
             Math.abs(cropBox.topLeft.y - offsetY) < cropBoxClickTolerance) || 
            (Math.abs(cropBox.bottomRight.x - offsetX) < cropBoxClickTolerance &&
             Math.abs(cropBox.bottomRight.y - offsetY) < cropBoxClickTolerance))
            body.style.cursor = "nwse-resize";
        
        // top center && bottom center
        else if ((Math.abs((cropBox.topLeft.x + cropBox.bottomRight.x) / 2 - offsetX) < cropBoxClickTolerance &&
                  Math.abs(cropBox.topLeft.y - offsetY) < cropBoxClickTolerance) || 
                 (Math.abs((cropBox.topLeft.x + cropBox.bottomRight.x) / 2 - offsetX) < cropBoxClickTolerance &&
                  Math.abs(cropBox.bottomRight.y - offsetY) < cropBoxClickTolerance))
            body.style.cursor = "row-resize";
        
        // top right && bottom left
        else if ((Math.abs(cropBox.bottomRight.x - offsetX) < cropBoxClickTolerance &&
                  Math.abs(cropBox.topLeft.y - offsetY) < cropBoxClickTolerance) || 
                 (Math.abs(cropBox.topLeft.x - offsetX) < cropBoxClickTolerance &&
                  Math.abs(cropBox.bottomRight.y - offsetY) < cropBoxClickTolerance))
            body.style.cursor = "nesw-resize";
    
        // center right && center left
        else if ((Math.abs(cropBox.bottomRight.x - offsetX) < cropBoxClickTolerance &&
                  Math.abs((cropBox.topLeft.y + cropBox.bottomRight.y) / 2 - offsetY) < cropBoxClickTolerance) || 
                 (Math.abs(cropBox.topLeft.x - offsetX) < cropBoxClickTolerance &&
                  Math.abs((cropBox.topLeft.y + cropBox.bottomRight.y) / 2 - offsetY) < cropBoxClickTolerance))
            body.style.cursor = "col-resize";

        // inner-box
        else if (cropBox.topLeft.x <= offsetX && offsetX <= cropBox.bottomRight.x &&
                 cropBox.topLeft.y <= offsetY && offsetY <= cropBox.bottomRight.y)
            body.style.cursor = "grab";
        
        else
            body.style.cursor = "default";
    });
    uiLayer.addEventListener('mouseout', (e) => {
        if (!mouseDown)
            body.style.cursor = "default";
    });
    body.addEventListener('mousemove', (e) => {
        if (!mouseDown)
            return;

        const pageX = e.pageX;
        const pageY = e.pageY;
        const movementX = e.movementX / zoom;
        const movementY = e.movementY / zoom;
        
        resBox.style.display = "inline";
        resBox.style.left = `${pageX + 4}px`;
        resBox.style.top = `${pageY + 4}px`;
        resBox.innerHTML = `${Math.round(cropBox.bottomRight.x - cropBox.topLeft.x)} x ${Math.round(cropBox.bottomRight.y - cropBox.topLeft.y)}`;
        
        switch (selectedCropPoint) {
            case 0:
                if (cropBox.topLeft.x + movementX < cropBox.bottomRight.x)
                    cropBox.topLeft.x = Math.max(0, movementX + cropBox.topLeft.x);
                if (cropBox.topLeft.y + movementY < cropBox.bottomRight.y)
                    cropBox.topLeft.y = Math.max(0, movementY + cropBox.topLeft.y);
                break;
            case 1:
                if (cropBox.topLeft.y + movementY < cropBox.bottomRight.y)
                    cropBox.topLeft.y = Math.max(0, movementY + cropBox.topLeft.y);
                break;
            case 2:
                if (cropBox.bottomRight.x + movementX > cropBox.topLeft.x)
                    cropBox.bottomRight.x = Math.min(imageLayer.width, movementX + cropBox.bottomRight.x);
                if (cropBox.topLeft.y + movementY < cropBox.bottomRight.y)
                    cropBox.topLeft.y = Math.max(0, movementY + cropBox.topLeft.y);
                break;
            case 3:
                if (cropBox.bottomRight.x + movementX > cropBox.topLeft.x)
                    cropBox.bottomRight.x = Math.min(imageLayer.width, movementX + cropBox.bottomRight.x);
                break;
            case 4:
                if (cropBox.bottomRight.x + movementX > cropBox.topLeft.x)
                    cropBox.bottomRight.x = Math.min(imageLayer.width, movementX + cropBox.bottomRight.x);
                if (cropBox.bottomRight.y + movementY > cropBox.topLeft.y)
                    cropBox.bottomRight.y = Math.min(imageLayer.height, movementY + cropBox.bottomRight.y);
                break;
            case 5:
                if (cropBox.bottomRight.y + movementY > cropBox.topLeft.y)
                    cropBox.bottomRight.y = Math.min(imageLayer.height, movementY + cropBox.bottomRight.y);
                break;
            case 6:
                if (cropBox.topLeft.x + movementX < cropBox.bottomRight.x)
                    cropBox.topLeft.x = Math.max(0, movementX + cropBox.topLeft.x);
                if (cropBox.bottomRight.y + movementY > cropBox.topLeft.y)
                    cropBox.bottomRight.y = Math.min(imageLayer.height, movementY + cropBox.bottomRight.y);
                break;
            case 7:
                if (cropBox.topLeft.x + movementX < cropBox.bottomRight.x)
                    cropBox.topLeft.x = Math.max(0, movementX + cropBox.topLeft.x);
                break;
            case 8:
                if (movementX + cropBox.topLeft.x >= 0 && movementX + cropBox.bottomRight.x <= imageLayer.width) {
                    cropBox.topLeft.x += movementX;
                    cropBox.bottomRight.x += movementX;
                }
                if (movementY + cropBox.topLeft.y >= 0 && movementY + cropBox.bottomRight.y <= imageLayer.height) {
                    cropBox.topLeft.y += movementY;
                    cropBox.bottomRight.y += movementY;
                }
                break;
        }
        
        drawCropBox(
            cropBox, cropBoxOuterLineWidthBase / zoom, cropBoxTickWidthBase / zoom, cropBoxTickLengthBase / zoom, true
        );
        widthLabel.innerHTML = Math.round(cropBox.bottomRight.x - cropBox.topLeft.x);
        widthInput.value = Math.round(cropBox.bottomRight.x - cropBox.topLeft.x);
        heightLabel.innerHTML = Math.round(cropBox.bottomRight.y - cropBox.topLeft.y);
        heightInput.value = Math.round(cropBox.bottomRight.y - cropBox.topLeft.y);
    });
    body.addEventListener('mouseup', (e) => {
        mouseDown = false;
        resBox.style.display = "none";
        drawCropBox(
            cropBox, cropBoxOuterLineWidthBase / zoom, cropBoxTickWidthBase / zoom, cropBoxTickLengthBase / zoom
        );

        if (!canvas.contains(e.target))
            body.style.cursor = "default";
        else if (body.style.cursor == "grabbing")
            body.style.cursor = "grab";
    });
    downloadButton.addEventListener('click', () => {
        const width = Math.round(cropBox.bottomRight.x - cropBox.topLeft.x);
        const height = Math.round(cropBox.bottomRight.y - cropBox.topLeft.y);
        const data = imageLayerCtx.getImageData(
            Math.round(cropBox.topLeft.x), Math.round(cropBox.topLeft.y), width, height
        );

        renderLayer.width = width;
        renderLayer.height = height;
        renderLayerCtx.putImageData(data, 0, 0)

        if (resizeInput.checked && (widthInput.value != width || heightInput.value != height))
            resizeCanvas(renderLayer, renderLayerCtx, widthInput.value, heightInput.value);

        const link = document.createElement('a');
        const format = formatInput.value == "original" ? origFileExtension : formatInput.value;

        if (format == "jpg" || format == "jpeg") {
            link.download = `${origFileName}-edited.jpg`;
            link.href = renderLayer.toDataURL(`image/jpeg`, 1.0);
        }
        else if (format == "svg") {
            link.download = `${origFileName}-edited.svg`;
            link.href = renderLayer.toDataURL(`image/svg+xml`, 1.0);
        }
        else {
            link.download = `${origFileName}-edited.${format}`;
            link.href = renderLayer.toDataURL(`image/${format}`, 1.0);
        }

        link.click();
    });
}

function resizeCanvas(canvas, ctx, tgtWidth, tgtHeight) {
    const resizeLayer = document.createElement("canvas");
    const resizeLayerCtx = resizeLayer.getContext("2d");
    const redrawLayer = document.createElement("canvas");
    const redrawLayerCtx = redrawLayer.getContext("2d");

    resizeLayerCtx.imageSmoothingEnabled = true;
    resizeLayerCtx.imageSmoothingQuality = "high";
    redrawLayerCtx.imageSmoothingEnabled = true;
    redrawLayerCtx.imageSmoothingQuality = "high";
    
    const xScaleFactor = canvas.width > tgtWidth ? 0.5 : (canvas.width == tgtWidth ? 1 : 2.0);
    const yScaleFactor = canvas.height > tgtHeight ? 0.5 : (canvas.height == tgtHeight ? 1 : 2.0);

    let currWidth = canvas.width;
    let currHeight = canvas.height;
    let nextWidth, nextHeight;

    resizeLayer.width = Math.max(canvas.width, tgtWidth);
    resizeLayer.height = Math.max(canvas.height, tgtHeight);
    redrawLayer.width = resizeLayer.width;
    redrawLayer.height = resizeLayer.height;

    resizeLayerCtx.drawImage(canvas, 0, 0, currWidth, currHeight);

    while (currWidth != tgtWidth || currHeight != tgtHeight) {
        nextWidth = Math.round(currWidth * xScaleFactor);
        nextHeight = Math.round(currHeight * yScaleFactor);

        if (xScaleFactor < 1)
            nextWidth = Math.max(nextWidth, tgtWidth);
        else
            nextWidth = Math.min(nextWidth, tgtWidth);

        if (yScaleFactor < 1)
            nextHeight = Math.max(nextHeight, tgtHeight);
        else
            nextHeight = Math.min(nextHeight, tgtHeight);

        redrawLayerCtx.clearRect(0, 0, redrawLayer.width, redrawLayer.height);
        redrawLayerCtx.drawImage(
            resizeLayer,
            0, 0, currWidth, currHeight,
            0, 0, nextWidth, nextHeight
        )
        resizeLayerCtx.clearRect(0, 0, redrawLayer.width, redrawLayer.height);
        resizeLayerCtx.drawImage(
            redrawLayer, 
            0, 0, nextWidth, nextHeight,
            0, 0, nextWidth, nextHeight
        );

        currWidth = nextWidth;
        currHeight = nextHeight;
    }

    canvas.width = tgtWidth;
    canvas.height = tgtHeight;
    ctx.drawImage(
        resizeLayer, 
        0, 0, tgtWidth, tgtHeight,
        0, 0, tgtWidth, tgtHeight
    );

    resizeLayerCtx.clearRect(0, 0, redrawLayer.width, redrawLayer.height);
    redrawLayerCtx.clearRect(0, 0, redrawLayer.width, redrawLayer.height);
}

function drawCropBox(
    cropBox, lineWidth, cropBoxTickWidth, cropBoxTickLength, drawRulers = false
) {
    let baseX, baseY, startX, startY, endX, endY;
    const w3 = (cropBox.bottomRight.x - cropBox.topLeft.x) / 3;
    const h3 = (cropBox.bottomRight.y - cropBox.topLeft.y) / 3;

    uiLayerCtx.clearRect(0, 0, uiLayer.width, uiLayer.height);

    uiLayerCtx.fillStyle = cropBoxOuterAreaColor;
    uiLayerCtx.strokeStyle = cropBoxOuterAreaColor;
    uiLayerCtx.fillRect(0, 0, uiLayer.width, uiLayer.height)
    uiLayerCtx.clearRect(
        cropBox.topLeft.x,
        cropBox.topLeft.y,
        cropBox.bottomRight.x - cropBox.topLeft.x,
        cropBox.bottomRight.y - cropBox.topLeft.y
    );

    if (drawRulers) {
        uiLayerCtx.beginPath();
        uiLayerCtx.lineWidth = lineWidth;
        uiLayerCtx.lineCap = "butt";
        uiLayerCtx.lineJoin = "miter";
        uiLayerCtx.strokeStyle = cropBoxColor;
        uiLayerCtx.setLineDash([5, 5]);
    
        // 1/3 vertical
        baseX = cropBox.topLeft.x + w3;
        startY = cropBox.topLeft.y;
        endY = cropBox.bottomRight.y;
        uiLayerCtx.moveTo(baseX, startY);
        uiLayerCtx.lineTo(baseX, endY);
        
        // 2/3 vertical
        baseX = cropBox.topLeft.x + w3 * 2;
        startY = cropBox.topLeft.y;
        endY = cropBox.bottomRight.y;
        uiLayerCtx.moveTo(baseX, startY);
        uiLayerCtx.lineTo(baseX, endY);
    
        // 1/3 horizontal
        startX = cropBox.topLeft.x;
        endX = cropBox.bottomRight.x;
        baseY = cropBox.topLeft.y + h3;
        uiLayerCtx.moveTo(startX, baseY);
        uiLayerCtx.lineTo(endX, baseY);
    
        // 2/3 horizontal
        startX = cropBox.topLeft.x;
        endX = cropBox.bottomRight.x;
        baseY = cropBox.topLeft.y + h3 * 2;
        uiLayerCtx.moveTo(startX, baseY);
        uiLayerCtx.lineTo(endX, baseY);
        uiLayerCtx.stroke();
    }

    uiLayerCtx.lineWidth = lineWidth;
    uiLayerCtx.lineCap = "butt";
    uiLayerCtx.lineJoin = "miter";
    uiLayerCtx.fillStyle = cropBoxColor;
    uiLayerCtx.strokeStyle = cropBoxColor;
    uiLayerCtx.setLineDash([]);
    uiLayerCtx.strokeRect(
        cropBox.topLeft.x + lineWidth / 2,
        cropBox.topLeft.y + lineWidth / 2,
        cropBox.bottomRight.x - cropBox.topLeft.x - lineWidth,
        cropBox.bottomRight.y - cropBox.topLeft.y - lineWidth
    );

    uiLayerCtx.beginPath();
    uiLayerCtx.lineWidth = cropBoxTickWidth;

    // top left
    baseX = cropBox.topLeft.x + lineWidth + cropBoxTickWidth / 2;
    baseY = cropBox.topLeft.y + lineWidth + cropBoxTickWidth / 2;
    uiLayerCtx.moveTo(baseX + cropBoxTickLength, baseY);
    uiLayerCtx.lineTo(baseX, baseY);
    uiLayerCtx.lineTo(baseX, baseY + cropBoxTickLength);

    // top center
    baseX = (cropBox.topLeft.x + cropBox.bottomRight.x) / 2;
    baseY = cropBox.topLeft.y + lineWidth + cropBoxTickWidth / 2;
    uiLayerCtx.moveTo(baseX - cropBoxTickLength, baseY);
    uiLayerCtx.lineTo(baseX, baseY);
    uiLayerCtx.lineTo(baseX + cropBoxTickLength, baseY);

    // top right
    baseX = cropBox.bottomRight.x - lineWidth - cropBoxTickWidth / 2;
    baseY = cropBox.topLeft.y + lineWidth + cropBoxTickWidth / 2;
    uiLayerCtx.moveTo(baseX - cropBoxTickLength, baseY);
    uiLayerCtx.lineTo(baseX, baseY);
    uiLayerCtx.lineTo(baseX, baseY + cropBoxTickLength);

    // center right
    baseX = cropBox.bottomRight.x - lineWidth - cropBoxTickWidth / 2;
    baseY = (cropBox.topLeft.y + cropBox.bottomRight.y) / 2;
    uiLayerCtx.moveTo(baseX, baseY - cropBoxTickLength);
    uiLayerCtx.lineTo(baseX, baseY);
    uiLayerCtx.lineTo(baseX, baseY + cropBoxTickLength);

    // bottom right
    baseX = cropBox.bottomRight.x - lineWidth - cropBoxTickWidth / 2;
    baseY = cropBox.bottomRight.y - lineWidth - cropBoxTickWidth / 2;
    uiLayerCtx.moveTo(baseX, baseY - cropBoxTickLength);
    uiLayerCtx.lineTo(baseX, baseY);
    uiLayerCtx.lineTo(baseX - cropBoxTickLength, baseY);

    // bottom center
    baseX = (cropBox.topLeft.x + cropBox.bottomRight.x) / 2;
    baseY = cropBox.bottomRight.y - lineWidth - cropBoxTickWidth / 2;
    uiLayerCtx.moveTo(baseX - cropBoxTickLength, baseY);
    uiLayerCtx.lineTo(baseX, baseY);
    uiLayerCtx.lineTo(baseX + cropBoxTickLength, baseY);

    // bottom left
    baseX = cropBox.topLeft.x + lineWidth + cropBoxTickWidth / 2;
    baseY = cropBox.bottomRight.y - lineWidth - cropBoxTickWidth / 2;
    uiLayerCtx.moveTo(baseX, baseY - cropBoxTickLength);
    uiLayerCtx.lineTo(baseX, baseY);
    uiLayerCtx.lineTo(baseX + cropBoxTickLength, baseY);

    // center left
    baseX = cropBox.topLeft.x + lineWidth + cropBoxTickWidth / 2;
    baseY = (cropBox.topLeft.y + cropBox.bottomRight.y) / 2;
    uiLayerCtx.moveTo(baseX, baseY - cropBoxTickLength);
    uiLayerCtx.lineTo(baseX, baseY);
    uiLayerCtx.lineTo(baseX, baseY + cropBoxTickLength);

    uiLayerCtx.stroke();
}
