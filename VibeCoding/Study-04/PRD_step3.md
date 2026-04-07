# PRD Step 3: User Profile & Recipe Storage

## 1. Objective
Allow users to create personal profiles and save their favorite recipes for future reference.

## 2. Key Features
- **User Authentication**: Simple login/signup (e.g., Email/Password or Social Login).
- **Saved Recipes Library**: A dedicated "My Recipes" section where users can view all recipes they have bookmarked.
- **Personalized Profile**: Store user preferences (e.g., dietary restrictions like "Vegetarian" or "Gluten-Free") to refine future AI recommendations.

## 3. User Flow
1. User creates an account or logs in.
2. While browsing recipes generated in Step 2, the user clicks a "Save" icon.
3. The recipe data is stored in the user's profile.
4. User visits the "Profile" page to see their collection of saved recipes.
5. User can remove recipes they no longer want to keep.

## 4. Technical Requirements
- **Backend/Database**: Options like Firebase, Supabase, or a simple Node.js/MongoDB setup.
- **Data Schema**: User object linked to a collection of Recipe objects.
- **State Management**: To keep track of the logged-in user and their saved data across sessions.

## 5. Verification & Testing
- Test the "Save" and "Unsave" functionality.
- Verify that saved recipes persist after the user logs out and logs back in.
- Ensure that dietary preferences in the profile correctly influence the prompts in Step 2.
