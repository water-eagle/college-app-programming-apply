# PRD Step 1: Refrigerator Ingredient Recognition

## 1. Objective
Enable users to upload or capture a photo of their refrigerator and automatically extract a list of ingredients using Google AI Studio's `gemini-3-flash-preview` model.

## 2. Key Features
- **Image Input**: Support for image upload (drag-and-drop or file picker) and camera capture (for mobile/tablet users).
- **AI Ingredient Detection**: Integration with `gemini-3-flash-preview` to identify multiple ingredients from a single photo.
- **Ingredient List Management**: Display the detected items in a clear list, allowing users to manually confirm or edit them.

## 3. User Flow
1. User opens the web application.
2. User clicks on "Upload Image" or "Capture Photo".
3. The image is sent to the Google AI Studio API with a prompt to list all food items found in the image.
4. The application displays a "Analyzing..." loading state.
5. The detected ingredients are displayed as editable tags or a list.

## 4. Technical Requirements
- **Framework**: Modern frontend (e.g., React, Vue, or Vanilla JS).
- **API**: Google AI Studio API (Gemini API).
- **Model**: `gemini-3-flash-preview`.
- **Media Support**: JPG, PNG, WEBP.

## 5. Verification & Testing
- Test with various lighting conditions and angles of refrigerator contents.
- Verify that the model can handle overlapping items.
- Ensure the UI remains responsive during the API call.
