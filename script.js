// Define the drawing canvas
const canvas = document.getElementById('drawing-canvas');
const context = canvas.getContext('2d');

// Define the submit button
const submitButton = document.getElementById('submit-button');

// Define the feedback box
const feedbackBox = document.getElementById('feedback');

// Define variables for storing the current drawing and feedback
let currentDrawing = null;
let feedback = null;

// Add event listeners to the canvas
canvas.addEventListener('mousedown', startDrawing);
canvas.addEventListener('mousemove', continueDrawing);
canvas.addEventListener('mouseup', stopDrawing);

// Define functions for handling drawing events
function startDrawing(event) {
  context.beginPath();
  context.moveTo(event.offsetX, event.offsetY);
  canvas.addEventListener('mousemove', continueDrawing);
}

function continueDrawing(event) {
  context.lineTo(event.offsetX, event.offsetY);
  context.stroke();
}

function stopDrawing(event) {
  canvas.removeEventListener('mousemove', continueDrawing);
  currentDrawing = context.getImageData(0, 0, canvas.width, canvas.height);
}

// Create a function to preprocess the image
function preprocessImage(image) {
  // Convert to grayscale
  const grayscaleImage = new cv.Mat();
  cv.cvtColor(image, grayscaleImage, cv.COLOR_RGBA2GRAY);

  // Resize to 28x28 pixels
  const resizedImage = new cv.Mat();
  cv.resize(grayscaleImage, resizedImage, new cv.Size(28, 28));

  // Convert to float32 array and normalize
  const float32Array = new Float32Array(resizedImage.data.length);
  cv.imshow(resizedImage, resizedImage); // necessary for rescaling values
  cv.cvtColor(resizedImage, resizedImage, cv.COLOR_GRAY2RGBA);
  for (let i = 0; i < resizedImage.data.length; i += 4) {
    float32Array[i / 4] = resizedImage.data[i] / 255.0;
  }

  // Return the preprocessed image
  return float32Array;
}

// Load the trained model
const model = await tf.loadLayersModel('shape_recognition_model/model.json');

// Define a function to predict the shape
async function predictShape(image) {
  // Preprocess the image
  const tensor = tf.tensor(preprocessImage(image)).reshape([1, 28, 28, 1]);

  // Use the model to make a prediction
  const prediction = await model.predict(tensor);

  // Convert the prediction to a shape label
  const shapeIndex = tf.argMax(prediction, 1).dataSync()[0];
  if (shapeIndex == 0) {
    return 'Circle';
  } else if (shapeIndex == 1) {
    return 'Square';
  } else {
    return 'Triangle';
  }
}

// Define a function to handle the submit button click
submitButton.addEventListener('click', async () => {
  if (currentDrawing !== null) {
    // Predict the shape of the drawing
    const shape = await predictShape(currentDrawing);

    // Display the prediction in the feedback box
    feedback = `Is this a ${shape}? (Y/N)`;
    feedbackBox.innerText = feedback;

    // Clear the current drawing
    currentDrawing = null;
    context.clearRect(0, 0, canvas.width, canvas.height);
  }
});
