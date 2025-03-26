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
    let highestPrediction = prediction.reduce((max, p) => p.probability > max.probability ? p : max, prediction[0]);
    labelContainer.innerHTML = highestPrediction.className + ": " + (highestPrediction.probability * 100).toFixed(2) + "%";
}

async function toggleCamera() {
    isFrontCamera = !isFrontCamera; 
    await setupWebcam(); 
}
