const URL = "./my_model/";
let model, webcam, labelContainer, maxPredictions;
let isFrontCamera = true; 

async function init() {
    const modelURL = URL + "model.json";
    const metadataURL = URL + "metadata.json";

    model = await tmImage.load(modelURL, metadataURL);
    maxPredictions = model.getTotalClasses();

    await setupWebcam(); 

    window.requestAnimationFrame(loop);
}

async function setupWebcam() { 
    if (webcam) {
        webcam.stop();
    }

    const flip = isFrontCamera; 
    const facingMode = isFrontCamera ? "user" : "environment"; 

    webcam = new tmImage.Webcam(200, 200, flip);
    await webcam.setup({ facingMode }); 
    await webcam.play();

    const container = document.getElementById("webcam-container");
    container.innerHTML = ""; 
    container.appendChild(webcam.canvas);

    labelContainer = document.getElementById("label-container");
    labelContainer.innerHTML = ""; 
    for (let i = 0; i < maxPredictions; i++) {
        labelContainer.appendChild(document.createElement("div"));
    }
}

async function loop() {
    webcam.update();
    await predict();
    window.requestAnimationFrame(loop);
}

async function predict() {
    const prediction = await model.predict(webcam.canvas);
    for (let i = 0; i < maxPredictions; i++) {
        const classPrediction = prediction[i].className + ": " + prediction[i].probability.toFixed(2);
        labelContainer.childNodes[i].innerHTML = classPrediction;
    }
}

async function toggleCamera() {
    isFrontCamera = !isFrontCamera; 
    await setupWebcam(); 
}
