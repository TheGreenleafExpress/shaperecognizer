// Define the canvas element and context
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

// Set the canvas dimensions
canvas.width = 150;
canvas.height = 150;

// Initialize the drawing variables
let painting = false;
let lastX = 0;
let lastY = 0;

// Add event listeners for mouse and touch events
canvas.addEventListener('mousedown', startDrawing);
canvas.addEventListener('mousemove', draw);
canvas.addEventListener('mouseup', endDrawing);
canvas.addEventListener('touchstart', startDrawing);
canvas.addEventListener('touchmove', draw);
canvas.addEventListener('touchend', endDrawing);

// Define the startDrawing function
function startDrawing(e) {
  painting = true;
  [lastX, lastY] = getCoordinates(e);
}

// Define the draw function
function draw(e) {
  if (!painting) return;
  const [x, y] = getCoordinates(e);
  ctx.beginPath();
  ctx.moveTo(lastX, lastY);
  ctx.lineTo(x, y);
  ctx.stroke();
  [lastX, lastY] = [x, y];
}

// Define the endDrawing function
function endDrawing() {
  painting = false;
}

// Define the getCoordinates function
function getCoordinates(e) {
  if (e.type.startsWith('mouse')) {
    return [e.offsetX, e.offsetY];
  } else if (e.type.startsWith('touch')) {
    const rect = canvas.getBoundingClientRect();
    return [e.touches[0].clientX - rect.left, e.touches[0].clientY - rect.top];
  }
}

// Add event listener for the predict button
const predictBtn = document.getElementById('predict-btn');
predictBtn.addEventListener('click', predictShape);

// Define the predictShape function
async function predictShape() {
  // Get the canvas image data as a base64-encoded string
  const imageData = canvas.toDataURL('image/png').replace('data:image/png;base64,', '');

  // Send the image data to the server to get the prediction
  const response = await fetch('/predict', {
    method: 'POST',
    body: JSON.stringify({ image_data: imageData }),
    headers: {
      'Content-Type': 'application/json'
    }
  });

  // Get the prediction result and display it
  const result = await response.json();
  const resultElem = document.getElementById('result');
  resultElem.textContent = `The shape is a ${result.prediction}.`;
}
