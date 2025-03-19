const URL = "./my_model/";
let model, webcam, labelContainer, maxPredictions;
let isFrontCamera = true; // Define se a câmera frontal está ativa

async function init() {
    const modelURL = URL + "model.json";
    const metadataURL = URL + "metadata.json";

    model = await tmImage.load(modelURL, metadataURL);
    maxPredictions = model.getTotalClasses();

    await setupWebcam(); // Inicializa a webcam corretamente

    window.requestAnimationFrame(loop);
}

async function setupWebcam() {
    if (webcam) {
        webcam.stop(); // Para a webcam antes de alternar
    }

    const flip = isFrontCamera; // Define se a câmera será espelhada
    const facingMode = isFrontCamera ? "user" : "environment"; // Alterna entre frontal e traseira

    webcam = new tmImage.Webcam(200, 200, flip);
    await webcam.setup({ facingMode }); // Configura a câmera correta
    await webcam.play();

    // Adiciona a webcam ao container
    const container = document.getElementById("webcam-container");
    container.innerHTML = ""; // Remove a câmera anterior
    container.appendChild(webcam.canvas);

    labelContainer = document.getElementById("label-container");
    labelContainer.innerHTML = ""; // Limpa previsões antigas
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

// Função para alternar entre as câmeras
async function toggleCamera() {
    isFrontCamera = !isFrontCamera; // Alterna entre frontal e traseira
    await setupWebcam(); // Reconfigura a webcam
}
