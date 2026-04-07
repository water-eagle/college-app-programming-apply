# PRD Step 2: Recipe Recommendation Engine

## 1. Objective
Generate personalized recipe recommendations based on the ingredients identified in Step 1, utilizing the `gemini-3-flash-preview` model.

## 2. Key Features
- **Recipe Generation**: Use the list of ingredients from Step 1 as context for the AI to suggest 3-5 recipes.
- **Smart Matching**: The AI should prioritize recipes that use as many of the available ingredients as possible while minimizing the need for extra shopping.
- **Detailed Recipe Cards**: Each recommendation includes a title, summary, preparation time, difficulty, and step-by-step instructions.

## 3. User Flow
1. After confirming ingredients in Step 1, the user clicks "Find Recipes".
2. The list of confirmed ingredients is sent to `gemini-3-flash-preview` with a prompt to generate creative and practical recipes.
3. The app displays a "Crafting Recipes..." loading state.
4. Users view a gallery of recipe cards.
5. Users can click a card to see the full cooking instructions.

## 4. Technical Requirements
- **Prompt Engineering**: Structured prompt to ensure consistent JSON-like output from Gemini for easier parsing.
- **UI Components**: Recipe cards with image placeholders and clear typography.

## 5. Verification & Testing
- Ensure the generated recipes are logically sound and use the provided ingredients.
- Verify that the instructions are clear and sequential.
- Test "Edge Cases" (e.g., only one ingredient available).
