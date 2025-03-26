const URL = "./my_model/";
let model, webcam, labelContainer, maxPredictions;
let isFrontCamera = true;
let isUsingWebcam = false; // Agora começa como falso

async function init() {
    if (!model) {
        const modelURL = URL + "model.json";
        const metadataURL = URL + "metadata.json";

        model = await tmImage.load(modelURL, metadataURL);
        maxPredictions = model.getTotalClasses();
    }

    await setupWebcam();
}

async function setupWebcam() {
    if (webcam) {
        webcam.stop();
    }

    isUsingWebcam = true;
    const facingMode = isFrontCamera ? "user" : "environment";

    webcam = new tmImage.Webcam(200, 200, isFrontCamera);
    await webcam.setup({ facingMode });
    await webcam.play();

    document.getElementById("webcam-container").innerHTML = "";
    document.getElementById("webcam-container").appendChild(webcam.canvas);
    document.getElementById("uploadedImageCanvas").style.display = "none";
    document.getElementById("webcam-container").style.display = "flex";

    labelContainer = document.getElementById("label-container");
    labelContainer.innerHTML = "";

    window.requestAnimationFrame(loop);
}

async function loop() {
    if (isUsingWebcam) {
        webcam.update();
        await predictFromWebcam();
        window.requestAnimationFrame(loop);
    }
}

async function predictFromWebcam() {
    const prediction = await model.predict(webcam.canvas);
    showPrediction(prediction);
}

// Alternar câmera
async function toggleCamera() {
    isFrontCamera = !isFrontCamera;
    await setupWebcam();
}

document.getElementById("imageUpload").addEventListener("change", async function (event) {
    const file = event.target.files[0];
    if (file) {
        isUsingWebcam = false;

        const reader = new FileReader();
        reader.onload = function (e) {
            const img = new Image();
            img.onload = async function () {
                const canvas = document.getElementById("uploadedImageCanvas");
                const ctx = canvas.getContext("2d");
                canvas.width = 200;
                canvas.height = 200;
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

                document.getElementById("webcam-container").style.display = "none";
                canvas.style.display = "block";

                await predictFromImage(canvas); 
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }
});

async function predictFromImage(canvas) {
    if (!model) {
        const modelURL = URL + "model.json";
        const metadataURL = URL + "metadata.json";
        model = await tmImage.load(modelURL, metadataURL);
        maxPredictions = model.getTotalClasses();
    }

    const prediction = await model.predict(canvas);
    showPrediction(prediction);
}

function showPrediction(prediction) {
    let highestPrediction = prediction.reduce((max, p) => p.probability > max.probability ? p : max, prediction[0]);
    document.getElementById("label-container").innerHTML =
        highestPrediction.className + ": " + (highestPrediction.probability * 100).toFixed(2) + "%";
}
