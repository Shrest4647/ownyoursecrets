# Own Your Secrets App Development Prompts

This file contains a sequence of prompts to guide the LLM agent in building the "Own Your Secrets" React Native application within the specified monorepo structure (`apps/own-your-secrets`). Each step builds upon the previous one.

---

**Prompt 1: Initial Project Setup and Navigation Structure**

**Goal:** Set up the basic React Native application structure within `apps/own-your-secrets`, install core dependencies, and define the initial navigation structure using React Navigation. This will include differentiating between "Guest" (setup/authentication) and "Protected" (main app) flows.

**Instructions:**

1.  Navigate to the `apps/own-your-secrets` directory.
2.  Ensure `react-navigation/native`, `react-navigation/stack`, and their dependencies (`react-native-screens`, `react-native-safe-area-context`) are installed.
3.  Create `src/navigation/AppNavigator.tsx`.
4.  Inside `AppNavigator.tsx`, set up a main stack navigator.
5.  Create a `GuestStack.tsx` navigator in `src/navigation/GuestStack.tsx`. This stack will contain onboarding and setup screens.
6.  Create a `ProtectedStack.tsx` navigator in `src/navigation/ProtectedStack.tsx`. This stack will contain the main app screens (Secrets List, Add/Edit, Sync, etc.).
7.  In `AppNavigator.tsx`, use a state variable (e.g., `isSetupComplete`, `isAuthenticated`) to conditionally render either the `GuestStack` or the `ProtectedStack`. Initially, default to showing the `GuestStack`.
8.  Modify `App.tsx` to render the `AppNavigator`.
9.  Add placeholder screen components (e.g., `GuestHomeScreen.tsx`, `ProtectedHomeScreen.tsx`) in `src/screens/` to test the navigation setup. These can just display the screen name for now.

**Expected Output:**

- Updated `package.json` with navigation dependencies.
- `src/navigation/AppNavigator.tsx`
- `src/navigation/GuestStack.tsx`
- `src/navigation/ProtectedStack.tsx`
- Placeholder files like `src/screens/GuestHomeScreen.tsx` and `src/screens/ProtectedHomeScreen.tsx`.
- Modified `App.tsx`.

---

**Prompt 2: Implement Initial Entry Point Logic and Passcode Check**

**Goal:** Implement the logic at the app's entry point to check if the user has completed the initial setup (including passcode) and route them accordingly based on the diagram. Implement the Pass Code entry page.

**Instructions:**

1.  Create a `src/screens/SplashScreen.tsx`. This screen will perform the initial checks.
2.  Modify `AppNavigator.tsx` to show the `SplashScreen` first.
3.  In `SplashScreen.tsx`:
    - Simulate checking if the app has been setup before (e.g., use `AsyncStorage` or a simple state variable for now). `hasSetupComplete` (passcode set, age key generated/imported).
    - If `hasSetupComplete` is false, navigate to the first onboarding screen (`OnboardingPage`).
    - If `hasSetupComplete` is true, check if a passcode is set (`hasPasscodeSet`).
      - If `hasPasscodeSet` is true, navigate to the `PassCodePage`.
      - If `hasPasscodeSet` is false (user completed setup but chose no passcode), navigate directly to the `SecretsListingPage` (the main protected home).
    - Use `useEffect` and `setTimeout` or similar to simulate the checks and transitions after a brief splash screen delay.
4.  Create `src/screens/PassCodePage.tsx`.
5.  Design `PassCodePage.tsx` with:
    - A title (e.g., "Enter Passcode").
    - Input fields (or a single input) for the passcode. Use secure text entry.
    - A "Go" button or automatic submission after entering the digits.
    - Implement placeholder logic: if the entered code matches a hardcoded or simulated stored passcode (for now), navigate to the `SecretsListingPage`. Otherwise, show an error.
    - Add `PassCodePage` to the `GuestStack.tsx`.

**Expected Output:**

- `src/screens/SplashScreen.tsx`
- `src/screens/PassCodePage.tsx`
- Updated `src/navigation/AppNavigator.tsx` to include `SplashScreen` and conditional initial routing.
- Updated `src/navigation/GuestStack.tsx` to include `PassCodePage`.
- Basic logic for initial checks and navigation in `SplashScreen.tsx`.
- Basic UI and input handling in `PassCodePage.tsx`.

---

**Prompt 3: Implement First-Time User Onboarding Flow (Part 1: Welcome & Sync Option)**

**Goal:** Build the initial onboarding screens for first-time users, covering the welcome page and the sync option selection.

**Instructions:**

1.  Create `src/screens/onboarding/OnboardingPage.tsx`.
2.  Design `OnboardingPage.tsx` with a welcome message and explanation of the app's purpose as described in the diagram.
3.  Add a "Next" button that navigates to the `SyncOptionSelectionPage`.
4.  Add `OnboardingPage` to the `GuestStack.tsx`. Ensure the `SplashScreen` navigates here if `hasSetupComplete` is false.
5.  Create `src/screens/onboarding/SyncOptionSelectionPage.tsx`.
6.  Design `SyncOptionSelectionPage.tsx` with:
    - A title (e.g., "Choose Sync Option").
    - Options for "1. Git", "2. Drive", "3. None" (use buttons or a list).
    - Implement navigation logic:
      - "Git" option navigates to `GitSyncRepoSetupPage`.
      - "Drive" option should show a placeholder "Not implemented yet" message or navigate to an empty placeholder screen for now.
      - "None" option navigates to `AgeSecretKeySetupPage` (skipping sync setup).
    - Add `SyncOptionSelectionPage` to the `GuestStack.tsx`.

**Expected Output:**

- `src/screens/onboarding/OnboardingPage.tsx`
- `src/screens/onboarding/SyncOptionSelectionPage.tsx`
- Updated `src/navigation/GuestStack.tsx` to include these new screens.
- Navigation logic implemented between `OnboardingPage` -> `SyncOptionSelectionPage` and from `SyncOptionSelectionPage` based on selection.

---

**Prompt 4: Implement First-Time User Onboarding Flow (Part 2: Git Sync Setup)**

**Goal:** Build the screens related to setting up Git synchronization during the first-time user onboarding flow.

**Instructions:**

1.  Create `src/screens/onboarding/GitSyncRepoSetupPage.tsx`.
2.  Design `GitSyncRepoSetupPage.tsx` with:
    - A title (e.g., "Setup Git Sync Repository").
    - Input fields for "Repository URL" and "Personal Access Token (PAT)" for private repos. Use secure text entry for PAT.
    - A "Test Repo Access" button.
    - Implement placeholder logic for the "Test Repo Access" button: navigate to `GitTestLoadingPage`.
    - Add `GitSyncRepoSetupPage` to the `GuestStack.tsx`.
3.  Create `src/screens/onboarding/GitTestLoadingPage.tsx`.
4.  Design `GitTestLoadingPage.tsx` with:
    - A title (e.g., "Testing Repository...").
    - A loading indicator (e.g., `ActivityIndicator`).
    - Simulate a loading process using `setTimeout`.
    - After the simulated loading:
      - On simulated success, navigate to `GitRepoAccessedPage`.
      - On simulated failure, navigate back to `GitSyncRepoSetupPage` (or show an error and stay on the page, user can retry or go back). Let's implement navigation back to `GitSyncRepoSetupPage` for simplicity initially.
    - Add `GitTestLoadingPage` to the `GuestStack.tsx`.
5.  Create `src/screens/onboarding/GitRepoAccessedPage.tsx`.
6.  Design `GitRepoAccessedPage.tsx` with:
    - A title (e.g., "Repository Accessed").
    - Display area to show the contents of the cloned repo (initially, just display a placeholder message like "Repo cloned successfully!"). The diagram shows a file tree - this can be a future enhancement, just show success for now.
    - A "Continue" or "Next" button that navigates to `AgeSecretKeySetupPage`.
    - Add `GitRepoAccessedPage` to the `GuestStack.tsx`.

**Expected Output:**

- `src/screens/onboarding/GitSyncRepoSetupPage.tsx`
- `src/screens/onboarding/GitTestLoadingPage.tsx`
- `src/screens/onboarding/GitRepoAccessedPage.tsx`
- Updated `src/navigation/GuestStack.tsx` to include these screens.
- Navigation logic implemented for the Git setup flow (`GitSyncRepoSetupPage` -> `GitTestLoadingPage` -> `GitRepoAccessedPage` or back to `GitSyncRepoSetupPage`).
- Basic UI elements (inputs, buttons, loading indicator).

---

**Prompt 5: Implement First-Time User Onboarding Flow (Part 3: Age Key Setup & Completion)**

**Goal:** Implement the Age secret key setup page and the final transition to the main protected part of the app upon successful onboarding.

**Instructions:**

1.  Create `src/screens/onboarding/AgeSecretKeySetupPage.tsx`.
2.  Design `AgeSecretKeySetupPage.tsx` with:
    - A title (e.g., "Setup Age Secret Key").
    - Text explaining the need for the Age key for encryption/decryption.
    - Options to "Generate New Key Pair" or "Import Existing Key".
    - Placeholder buttons/logic for these options.
    - A "Continue" or "Finish Setup" button.
    - Implement placeholder logic for the "Continue" button:
      - Simulate key generation/import success.
      - Simulate setting a passcode (if the user hasn't already during this flow, though the diagram suggests passcode check is _before_ onboarding for regular starts). Let's assume for _first time setup_, the passcode is set _after_ the Age key. Add an option or step here to "Set App Passcode (Recommended)". If user chooses to set it, navigate to a "SetPasscodePage" (create a new one or reuse/adapt `PassCodePage`). If they skip, navigate directly to `SecretsListingPage`.
      - Once passcode is handled (set or skipped), update the `hasSetupComplete` flag (simulated or using storage) to true.
      - Navigate to the `SecretsListingPage` (this is the first screen in the `ProtectedStack`).
    - Add `AgeSecretKeySetupPage` to the `GuestStack.tsx`.
3.  (Optional but recommended) Create `src/screens/onboarding/SetPasscodePage.tsx` if a separate flow for setting the passcode during onboarding is desired, or adapt `PassCodePage`. Add this to `GuestStack` and link from `AgeSecretKeySetupPage`.
4.  Ensure the transition from `GuestStack` to `ProtectedStack` happens upon successful completion of the onboarding flow. This might involve updating the state variable in `AppNavigator.tsx` or navigating in a way that replaces the stack (less common in React Navigation, better to update the top-level state). For simplicity, let the `AppNavigator` detect the `hasSetupComplete` state change and re-render.

**Expected Output:**

- `src/screens/onboarding/AgeSecretKeySetupPage.tsx`
- (Optional) `src/screens/onboarding/SetPasscodePage.tsx`
- Updated `src/navigation/GuestStack.tsx` and potentially `AppNavigator.tsx` for state-driven stack switching.
- Basic UI for key setup options.
- Placeholder logic for key operations and the transition to the protected flow.

---

**Prompt 6: Implement Protected Area - Secrets Listing (Home Page)**

**Goal:** Build the main home screen for authenticated users, where secrets are listed.

**Instructions:**

1.  Create `src/screens/protected/SecretsListingPage.tsx`.
2.  Design `SecretsListingPage.tsx` based on the diagram:
    - A title (e.g., "Your Secrets").
    - A search bar component.
    - An area to display a list of secrets. Initially, use dummy data (an array of objects like `{ id: '1', name: 'Google', meta: 'Login details', updated: '...' }`).
    - Implement basic rendering of the dummy list.
    - Add sorting and filtering options UI (e.g., buttons or a dropdown - keep it simple, maybe just placeholder buttons).
    - Add a "+" or "New" button (like the diagram) to navigate to `NewPassAddPage`.
    - Add `SecretsListingPage` as the initial screen in `ProtectedStack.tsx`.

**Expected Output:**

- `src/screens/protected/SecretsListingPage.tsx`
- Updated `src/navigation/ProtectedStack.tsx`.
- Basic UI for search, list display, sorting/filtering placeholders, and an Add button.
- Rendering of dummy secret data.

---

**Prompt 7: Implement Protected Area - Add New Pass Page**

**Goal:** Build the screen for adding a new secret entry.

**Instructions:**

1.  Create `src/screens/protected/NewPassAddPage.tsx`.
2.  Design `NewPassAddPage.tsx` based on the diagram:
    - A title (e.g., "Add New Secret").
    - Input field for "Password Name" (e.g., username, service name).
    - Input field for the "Secret Password" (use secure text entry).
    - Input field (multiline) for "Meta" (descriptive text/notes).
    - "Save" and "Cancel" buttons.
    - Implement placeholder logic for "Cancel": navigate back.
    - Implement placeholder logic for "Save":
      - Collect data from input fields.
      - Log the collected data.
      - _Add a comment indicating where encryption and file saving will occur._
      - Navigate back to `SecretsListingPage` upon simulated success.
    - Add `NewPassAddPage` to `ProtectedStack.tsx`.
3.  Ensure the "+" button on `SecretsListingPage` navigates to `NewPassAddPage`.

**Expected Output:**

- `src/screens/protected/NewPassAddPage.tsx`
- Updated `src/navigation/ProtectedStack.tsx`.
- UI with input fields and buttons.
- Basic navigation logic.
- Comments indicating integration points for encryption and storage.

---

**Prompt 8: Implement Protected Area - Edit Pass Page**

**Goal:** Build the screen for editing an existing secret entry. This page is similar to the Add page but pre-populated with data.

**Instructions:**

1.  Create `src/screens/protected/EditPassPage.tsx`.
2.  Design `EditPassPage.tsx` similar to `NewPassAddPage.tsx`, but:
    - Change the title (e.g., "Edit Secret").
    - This screen should receive the secret ID (or the whole secret object) as navigation parameters.
    - _Add a comment indicating where decryption and loading the existing data will occur._ For now, use placeholder data to pre-fill the inputs.
    - Include the same input fields for "Password Name", "Secret Password", and "Meta".
    - "Save" and "Cancel" buttons with similar placeholder logic as `NewPassAddPage`. The "Save" button logic should include a comment about encryption and _updating_ the existing file.
    - Add `EditPassPage` to `ProtectedStack.tsx`.
3.  Modify `SecretsListingPage.tsx`:
    - Make the list items (secrets) tappable.
    - When a secret item is tapped, navigate to `EditPassPage`, passing the secret's ID or data as navigation parameters.

**Expected Output:**

- `src/screens/protected/EditPassPage.tsx`
- Updated `src/navigation/ProtectedStack.tsx`.
- Updated `src/screens/protected/SecretsListingPage.tsx` to handle item taps and navigation with parameters.
- UI with pre-filled input fields and buttons.
- Basic navigation and placeholder data loading/saving logic.
- Comments indicating integration points for decryption, encryption, and storage updates.

---

**Prompt 9: Implement Protected Area - Delete Pass Flow**

**Goal:** Implement the flow for deleting a secret entry, including a confirmation step.

**Instructions:**

1.  Create `src/screens/protected/DeletePassPage.tsx` (This acts as the confirmation modal/page).
2.  Design `DeletePassPage.tsx`:
    - A title (e.g., "Delete Secret?").
    - A confirmation message (e.g., "Are you sure you want to delete this secret? This action cannot be undone."). Include the name of the secret being deleted, if passed as a parameter.
    - "Delete" and "Cancel" buttons.
    - Implement placeholder logic for "Cancel": navigate back (dismiss the modal).
    - Implement placeholder logic for "Delete":
      - Log the intent to delete.
      - _Add a comment indicating where the file deletion will occur._
      - Navigate back to `SecretsListingPage` upon simulated success (and potentially refresh the list).
    - Configure `DeletePassPage` to be presented as a modal (optional, can just be a regular page initially depending on navigator setup). Add it to `ProtectedStack.tsx`.
3.  Modify `EditPassPage.tsx`:
    - Add a "Delete" button on this page.
    - Implement the "Delete" button logic to navigate to `DeletePassPage`, passing the secret's ID or name as a parameter.

**Expected Output:**

- `src/screens/protected/DeletePassPage.tsx`
- Updated `src/navigation/ProtectedStack.tsx`.
- Updated `src/screens/protected/EditPassPage.tsx` to add a Delete button and navigation.
- UI for confirmation message and buttons.
- Basic navigation logic.
- Comments indicating integration point for file deletion.

---

**Prompt 10: Implement Protected Area - Sync Pass Page**

**Goal:** Implement the screen for manually triggering synchronization and displaying its status.

**Instructions:**

1.  Create `src/screens/protected/SyncPassPage.tsx`.
2.  Design `SyncPassPage.tsx` based on the diagram:
    - A title (e.g., "Sync Status").
    - A button or section to "Trigger Sync".
    - An area to "Display sync connection status" and progress. Use placeholder text like "Idle", "Syncing...", "Last Synced: ...", "Error: ...".
    - Implement placeholder logic for "Trigger Sync":
      - Update the status display to "Syncing...".
      - Simulate a sync process (e.g., `setTimeout`).
      - _Add comments indicating where Git operations (pull, push) will be called._
      - After the simulated process, update the status display to "Sync Complete" or "Sync Error".
    - Add `SyncPassPage` to `ProtectedStack.tsx`.
3.  Add a way to access the `SyncPassPage` from the `SecretsListingPage` (e.g., a menu option, an icon in the header).

**Expected Output:**

- `src/screens/protected/SyncPassPage.tsx`
- Updated `src/navigation/ProtectedStack.tsx`.
- Updated `src/screens/protected/SecretsListingPage.tsx` to include a link to the Sync page.
- UI for triggering sync and displaying status.
- Basic state management for sync status display.
- Comments indicating integration points for Git operations.

---

**Prompt 11: Integration and Refinement (Basic)**

**Goal:** Review the generated code, ensure components are structured reasonably, add basic styling, and make sure navigation works as expected between the implemented screens. Add more specific comments about where the `humphd/sops-age` and Git integrations will fit.

**Instructions:**

1.  Review all created screen components (`.tsx` files).
2.  Add basic inline styles or use `StyleSheet.create` for padding, margins, text sizes, button appearance to make the UI look presentable, not just functional.
3.  Ensure all navigation links between the implemented pages are correctly set up and pass necessary parameters (like secret ID for Edit/Delete).
4.  Add explicit `// TODO: Integrate humphd/sops-age for encryption/decryption` comments in `NewPassAddPage.tsx`, `EditPassPage.tsx` (for loading and saving), and wherever secrets are read (e.g., `SecretsListingPage.tsx` when loading data).
5.  Add explicit `// TODO: Integrate Git operations (clone, pull, push) using native bridge/package` comments in `GitTestLoadingPage.tsx`, `GitSyncRepoSetupPage.tsx`, and `SyncPassPage.tsx`.
6.  Refine the initial logic in `SplashScreen.tsx` to use `AsyncStorage` or `react-native-shared-preferences` (or similar) to persistently store the `hasSetupComplete` and `hasPasscodeSet` flags.
7.  Add a basic placeholder implementation for file read/write operations using `react-native-fs` (e.g., `await RNFS.writeFile(filePath, encryptedData, 'utf8')`, `await RNFS.readFile(filePath, 'utf8')`). Add comments that these operations handle _encrypted_ data.

**Expected Output:**

- Styling added to components.
- Navigation links verified and corrected.
- `TODO` comments added for integration points.
- Basic persistent storage added for setup flags.
- Placeholder file I/O operations added with comments.

---

**Further Steps (Not in this file, but for context):**

These steps would involve more complex integrations the LLM might not fully implement but can be prompted for interface design:

- Implement the native bridge/JS wrapper for `humphd/sops-age`.
- Implement the native bridge/JS wrapper for Git operations.
- Implement secure storage for the Age secret key and the app passcode (`react-native-keychain` or similar).
- Implement the actual encryption/decryption and file storage/loading logic using the integrated crypto/storage modules.
- Implement Git cloning, pulling, pushing, and file tree listing logic using the integrated Git module.
- Refine error handling throughout the app.
- Implement search, sorting, and filtering logic on the Secrets Listing page.
- Add UI enhancements, icons, etc.
