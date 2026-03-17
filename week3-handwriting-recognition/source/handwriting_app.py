import tkinter as tk
from tkinter import Canvas, Button, Label
from PIL import Image, ImageDraw, ImageOps
import numpy as np
from sklearn import datasets
from sklearn.svm import SVC

class HandwritingApp:
    def __init__(self):
        # Load and train the model
        print("Training model... Please wait.")
        digits = datasets.load_digits()
        # Train an SVM classifier
        self.clf = SVC(gamma=0.001)
        self.clf.fit(digits.data, digits.target)
        print("Model trained successfully!")

        # Set up the main window
        self.root = tk.Tk()
        self.root.title("Handwriting Recognition")
        self.root.geometry("300x350")
        
        # Setup canvas for drawing
        self.canvas_width = 200
        self.canvas_height = 200
        self.canvas = Canvas(self.root, width=self.canvas_width, height=self.canvas_height, bg='white', cursor="cross")
        self.canvas.pack(pady=10)
        
        # Internal PIL image to mirror the canvas drawing
        self.image = Image.new("L", (self.canvas_width, self.canvas_height), color=255)
        self.draw = ImageDraw.Draw(self.image)
        
        # Bind mouse movement to the paint method
        self.canvas.bind("<B1-Motion>", self.paint)
        
        # Label to show the result
        self.label = Label(self.root, text="Draw a digit (0-9) then click Recognize", font=("Helvetica", 12))
        self.label.pack(pady=10)
        
        # Buttons layout
        btn_frame = tk.Frame(self.root)
        btn_frame.pack(pady=5)
        
        self.btn_recognize = Button(btn_frame, text="Recognize", command=self.recognize)
        self.btn_recognize.pack(side=tk.LEFT, padx=10)
        
        self.btn_clear = Button(btn_frame, text="Clear", command=self.clear_canvas)
        self.btn_clear.pack(side=tk.RIGHT, padx=10)
        
    def run(self):
        self.root.mainloop()

    def paint(self, event):
        # Draw a thick stroke to mimic handwriting
        brush_size = 8
        x1, y1 = (event.x - brush_size), (event.y - brush_size)
        x2, y2 = (event.x + brush_size), (event.y + brush_size)
        
        # Draw on tkinter canvas
        self.canvas.create_oval(x1, y1, x2, y2, fill="black", outline="black")
        
        # Draw on PIL image
        self.draw.ellipse([x1, y1, x2, y2], fill=0)

    def clear_canvas(self):
        # Clear the UI canvas
        self.canvas.delete("all")
        
        # Clear the internal PIL image
        self.image = Image.new("L", (self.canvas_width, self.canvas_height), color=255)
        self.draw = ImageDraw.Draw(self.image)
        self.label.config(text="Draw a digit (0-9) then click Recognize")

    def recognize(self):
        # Invert the image (black background, white text)
        inverted_image = ImageOps.invert(self.image)
        
        # Get bounding box of the drawn digit
        bbox = inverted_image.getbbox()
        if not bbox:
            self.label.config(text="Canvas is empty! Draw something first.")
            return
            
        # Crop the drawing to the bounding box
        img_cropped = inverted_image.crop(bbox)
        
        # Make the image square to preserve aspect ratio
        width, height = img_cropped.size
        max_dim = max(width, height)
        
        # Create a square black image
        square_img = Image.new("L", (max_dim, max_dim), color=0)
        paint_x = (max_dim - width) // 2
        paint_y = (max_dim - height) // 2
        square_img.paste(img_cropped, (paint_x, paint_y))
        
        # Resize to 8x8 which is what the scikit-learn digits dataset uses
        # We use a slightly smaller size (6x6) inside an 8x8 box to match the dataset format better
        img_resized = square_img.resize((6, 6), Image.Resampling.LANCZOS)
        
        # Place the 6x6 image in the center of an 8x8 black image
        final_img = Image.new("L", (8, 8), color=0)
        final_img.paste(img_resized, (1, 1))
        
        # Convert to numpy array
        img_array = np.array(final_img)
        
        # Scale values from 0-255 to 0-16 (the format of the digits dataset)
        img_scaled = (img_array / 255.0) * 16.0
        
        # Flatten to 1D array (64 elements)
        img_flat = img_scaled.reshape(1, -1)
        
        # Predict using the trained SVM model
        prediction = self.clf.predict(img_flat)
        self.label.config(text=f"Predicted Digit: {prediction[0]}")

if __name__ == "__main__":
    app = HandwritingApp()
    app.run()
