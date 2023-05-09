import pygame
import numpy as np
import tensorflow as tf
from PIL import Image

# Initialize Pygame
pygame.init()

# Define colors
BLACK = (0, 0, 0)
WHITE = (255, 255, 255)
RED = (255, 0, 0)

# Define window size
WINDOW_SIZE = (800, 600)

# Create a Pygame window
screen = pygame.display.set_mode(WINDOW_SIZE)
pygame.display.set_caption("Shape Recognition")

# Define font for displaying text
font = pygame.font.SysFont('Calibri', 25, True, False)

# Load the trained model
model = tf.keras.models.load_model('shape_recognition_model.h5')

# Define the drawing box rectangle
drawing_box = pygame.Rect(200, 50, 400, 400)

# Define the submit button rectangle
submit_button = pygame.Rect(350, 475, 100, 50)

# Define the feedback box rectangle
feedback_box = pygame.Rect(200, 525, 400, 50)

# Create a variable to hold the current drawing
current_drawing = None

# Create a function to preprocess the image
def preprocess_image(image):
    # Convert to grayscale
    image = image.convert('L')
    # Resize to 28x28 pixels
    image = image.resize((28, 28))
    # Convert to numpy array and normalize
    image = np.array(image) / 255.0
    # Add extra dimension for batch size
    image = np.expand_dims(image, axis=0)
    return image

# Create a function to predict the shape
def predict_shape(image):
    # Preprocess the image
    image = preprocess_image(image)
    # Use the model to make a prediction
    prediction = model.predict(image)
    # Convert the prediction to a shape label
    if np.argmax(prediction) == 0:
        return 'Circle'
    elif np.argmax(prediction) == 1:
        return 'Square'
    else:
        return 'Triangle'

# Define a variable for storing the feedback
feedback = None

# Create a function to handle events
def handle_events():
    global current_drawing, feedback
    
    for event in pygame.event.get():
        if event.type == pygame.QUIT:
            pygame.quit()
            quit()
        elif event.type == pygame.MOUSEBUTTONDOWN:
            # Check if the submit button was clicked
            if submit_button.collidepoint(event.pos):
                if current_drawing is not None:
                    # Predict the shape of the drawing
                    shape = predict_shape(current_drawing)
                    # Display the prediction in the feedback box
                    feedback = f"Is this a {shape}? (Y/N)"
                    current_drawing = None
            # Check if the click was inside the drawing box
            elif drawing_box.collidepoint(event.pos):
                # Start a new drawing
                current_drawing = pygame.Surface((drawing_box.width, drawing_box.height))
                current_drawing.fill(WHITE)
                # Move the drawing surface to the click position
                current_drawing_rect = current_drawing.get_rect()
                current_drawing_rect.center = event.pos
        elif event.type == pygame.MOUSEMOTION:
            # Check if the mouse is moved inside the drawing box
            if current_drawing is not None:
                # Draw a line from the previous position to the current position
                pygame.draw.line(current_drawing, BLACK, current_drawing_rect.center,
