document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('drawingCanvas');
    const ctx = canvas.getContext('2d');
    const clearBtn = document.getElementById('clearBtn');
    const recognizeBtn = document.getElementById('recognizeBtn');
    const predictedValue = document.getElementById('predictedValue');
    const resultText = document.getElementById('resultText');
    const loader = document.getElementById('loader');

    // Setting up the canvas drawing defaults
    // The background should be transparent or white, but since we use image data directly, 
    // let's fill it white initially so drawn parts are easily identifiable
    function initCanvas() {
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.lineWidth = 15; // Thick stroke for better visibility when scaled down
        ctx.strokeStyle = "black";
    }

    initCanvas();

    let isDrawing = false;
    let hasDrawn = false;

    // Desktop Events
    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseout', stopDrawing);

    // Mobile/Touch Events
    canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
    canvas.addEventListener('touchend', stopDrawing);

    function getCoordinates(e) {
        if (e.touches && e.touches.length > 0) {
            const rect = canvas.getBoundingClientRect();
            return {
                x: e.touches[0].clientX - rect.left,
                y: e.touches[0].clientY - rect.top
            };
        } else {
            return {
                x: e.offsetX,
                y: e.offsetY
            };
        }
    }

    function handleTouchStart(e) {
        e.preventDefault(); // Prevent scrolling
        const coords = getCoordinates(e);
        isDrawing = true;
        hasDrawn = true;
        ctx.beginPath();
        ctx.moveTo(coords.x, coords.y);
    }

    function handleTouchMove(e) {
        e.preventDefault();
        draw(e);
    }

    function startDrawing(e) {
        isDrawing = true;
        hasDrawn = true;
        const coords = getCoordinates(e);
        ctx.beginPath();
        ctx.moveTo(coords.x, coords.y);
    }

    function draw(e) {
        if (!isDrawing) return;
        const coords = getCoordinates(e);
        ctx.lineTo(coords.x, coords.y);
        ctx.stroke();
    }

    function stopDrawing() {
        if (!isDrawing) return;
        isDrawing = false;
        ctx.closePath();
    }

    // Clear Button
    clearBtn.addEventListener('click', () => {
        initCanvas();
        hasDrawn = false;
        predictedValue.textContent = "-";
        predictedValue.style.textShadow = "0 0 20px rgba(0, 198, 255, 0.5)";
        predictedValue.style.color = "#ffffff";
        resultText.textContent = "Prediction will appear here";
    });

    // Recognize Button
    recognizeBtn.addEventListener('click', async () => {
        if (!hasDrawn) {
            alert("Please draw a digit first!");
            return;
        }

        // Show Loader
        loader.classList.remove('hidden');
        resultText.textContent = "Processing...";

        // Get base64 encoded image
        const dataURL = canvas.toDataURL('image/png');

        try {
            const response = await fetch('/predict', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ image: dataURL })
            });

            const data = await response.json();

            // Hide Loader
            loader.classList.add('hidden');

            if (response.ok) {
                resultText.textContent = "Predicted Digit";
                predictedValue.textContent = data.prediction;
                // Add a cool pulse effect
                predictedValue.animate([
                    { transform: 'scale(1)', color: '#ffffff' },
                    { transform: 'scale(1.2)', color: '#00c6ff' },
                    { transform: 'scale(1)', color: '#ffffff' }
                ], { duration: 500 });
                predictedValue.style.color = "#00c6ff";
            } else {
                resultText.textContent = "Error";
                predictedValue.textContent = "!";
                predictedValue.style.color = "#ff4d4d";
                console.error(data.error);
                alert(data.error || "An error occurred during prediction.");
            }
        } catch (error) {
            loader.classList.add('hidden');
            resultText.textContent = "Network Error";
            predictedValue.textContent = "X";
            predictedValue.style.color = "#ff4d4d";
            console.error("Error connecting to server:", error);
            alert("Failed to connect to the prediction server.");
        }
    });
});
