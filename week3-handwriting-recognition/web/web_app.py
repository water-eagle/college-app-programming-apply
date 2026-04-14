from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import base64
import io
import os
import numpy as np
from PIL import Image, ImageOps
from sklearn import datasets
from sklearn.svm import SVC

# Initialize FastAPI application
app = FastAPI(title="Handwriting Recognition Web App")

# Allow CORS for potential cross-origin requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global model variable
clf = None

# Model to accept base64 image data
class ImageData(BaseModel):
    image: str

@app.on_event("startup")
def load_and_train_model():
    global clf
    print("Training the SVM model... Please wait.")
    digits = datasets.load_digits()
    clf = SVC(gamma=0.001)
    clf.fit(digits.data, digits.target)
    print("Model trained successfully!")

@app.post("/predict")
async def predict_digit(data: ImageData):
    global clf
    try:
        # Extract base64 part
        image_data = data.image.split(',')[1]
        
        # Decode base64 image
        image_bytes = base64.b64decode(image_data)
        
        # Open image with PIL
        img = Image.open(io.BytesIO(image_bytes))
        
        # Convert to grayscale ("L" mode)
        img = img.convert("L")
        
        # Since canvas drawing is black on transparent/white background,
        # we invert it so the strokes are white on a black background
        inverted_image = ImageOps.invert(img)
        
        # Get bounding box of the drawn digit
        bbox = inverted_image.getbbox()
        if not bbox:
            return JSONResponse(content={"error": "Canvas is empty. Draw something!"}, status_code=400)
            
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
        
        # Resize to 8x8 which is what the scikit-learn dataset uses
        # We resize to 6x6 inside an 8x8 to leave a small margin, similar to the original dataset
        img_resized = square_img.resize((6, 6), Image.Resampling.LANCZOS)
        
        final_img = Image.new("L", (8, 8), color=0)
        final_img.paste(img_resized, (1, 1))
        
        # Convert to numpy array
        img_array = np.array(final_img)
        
        # Scale values from 0-255 to 0-16
        img_scaled = (img_array / 255.0) * 16.0
        
        # Flatten to 1D array
        img_flat = img_scaled.reshape(1, -1)
        
        # Predict
        prediction = clf.predict(img_flat)
        return {"prediction": int(prediction[0])}

    except Exception as e:
        print(f"Error during prediction: {str(e)}")
        return JSONResponse(content={"error": str(e)}, status_code=500)

# Mount static files to serve index.html, css, js
STATIC_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "static")
if not os.path.exists(STATIC_DIR):
    os.makedirs(STATIC_DIR)

app.mount("/", StaticFiles(directory=STATIC_DIR, html=True), name="static")

if __name__ == "__main__":
    import uvicorn
    # Make sure we're serving from the right port
    print("Starting Web Server at http://localhost:8000")
    uvicorn.run("web_app:app", host="127.0.0.1", port=8000, reload=True)
