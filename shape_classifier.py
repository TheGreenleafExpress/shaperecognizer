import tensorflow as tf
from tensorflow.keras import layers
from tensorflow.keras.preprocessing.image import ImageDataGenerator

# Define the image dimensions and batch size
img_width, img_height = 64, 64
batch_size = 32

# Create an image data generator to preprocess the images
train_datagen = ImageDataGenerator(
    rescale=1. / 255, # Normalize pixel values to [0,1]
    shear_range=0.2, # Apply random shear transformations
    zoom_range=0.2, # Apply random zoom transformations
    horizontal_flip=True) # Flip images horizontally

# Load the training data from a directory
train_data = train_datagen.flow_from_directory(
    'shapes/train',
    target_size=(img_width, img_height),
    batch_size=batch_size,
    class_mode='categorical') # Use categorical classification

# Create the model architecture
model = tf.keras.Sequential([
    layers.Conv2D(32, (3, 3), activation='relu', input_shape=(img_width, img_height, 3)),
    layers.MaxPooling2D((2, 2)),
    layers.Conv2D(64, (3, 3), activation='relu'),
    layers.MaxPooling2D((2, 2)),
    layers.Conv2D(128, (3, 3), activation='relu'),
    layers.MaxPooling2D((2, 2)),
    layers.Flatten(),
    layers.Dense(64, activation='relu'),
    layers.Dense(3, activation='softmax') # Output layer with 3 classes (circle, square, triangle)
])

# Compile the model
model.compile(optimizer='adam',
              loss='categorical_crossentropy',
              metrics=['accuracy'])

# Train the model
model.fit(train_data, epochs=20)

# Save the model to a file
model.save('shape_classifier.h5')
