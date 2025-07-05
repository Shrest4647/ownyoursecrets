# Project: Own Your Secrets Mobile App

## Overview

"Own Your Secrets" is a secure, self-managed mobile application designed for saving and managing sensitive secrets like passwords and notes. Unlike traditional password managers, it emphasizes user control by storing data locally and allowing synchronization with self-owned resources (like Git repositories) rather than relying on central servers. The app prioritizes privacy and security through encryption.

## Core Principles

- **Self-Owned Data:** All secrets are stored locally on the user's device.
- **Encryption at Rest:** Secrets are encrypted using `sops` and `age` protocols before being saved to files.
- **No Central Servers:** The app operates without connecting to any external, third-party servers for data storage or synchronization.
- **Open Source:** The project is intended to be fully open-source.
- **Self-Managed Sync:** Synchronization relies on protocols like Git, where the user controls the remote endpoint.

## Technology Stack

- **Mobile Framework:** React Native
- **Monorepo Structure:** The project is structured as a monorepo containing multiple `packages` (shared components, logic, utilities) and `apps` (the main mobile application). The mobile app will reside in `apps/own-your-secrets`.
- **Encryption:** `sops` and `age` via the `humphd/sops-age` library/integration for React Native. This will involve interacting with native code to perform encryption/decryption operations.
- **Navigation:** React Navigation (specifically, stack navigators).
- **UI:** Standard React Native components, potentially leveraging reusable components from a `packages/ui` library within the monorepo (assume basic React Native components if a specific UI package isn't defined yet).
- **Storage:** React Native filesystem APIs for storing encrypted files locally.
- **Sync (Initial):** Git integration for pushing/pulling encrypted files. This will involve Git command execution (likely through a React Native bridge).

## Project Structure (within the monorepo)

```

/
|- apps/
| |- own-your-secrets/  <- The main React Native app
|     |- app/
|     |  |- (guest|protected)/  <- Screens for guest and protected flows
|     `- package.json
|- packages/
| |- ui/ <- shared UI components + RNR components + Tailwind components
|- package.json <- Monorepo root package.json
|- turbo.json <- Turborepo configuration

```

The primary focus for the LLM agent will be generating code within `apps/own-your-secrets/app/`.

## User Flow and Screens

The provided diagram (referenced externally) is the authoritative source for the user flow and the required screens. Key screens and flows include:

1.  **Initial App Start:** Decision point: Has the user completed setup (passcode, age key)?
2.  **Guest Flow (First Time Setup):**
    - Onboarding Page
    - Sync Option Selection Page (Git, Drive, None)
    - Git Sync Setup Flow:
      - Git Sync Repo Setup Page (Input URL, PAT)
      - Loading Page (Testing Repo Access)
      - Git Repo Accessed Page (Show file tree)
    - Age Secret Key Setup Page (Generate/Import Age Key)
    - Transition to Protected Home
3.  **Authentication Flow (Regular Start):**
    - Pass Code Page (Input Passcode)
    - Transition to Protected Home on success
4.  **Protected Flow (Authenticated User):**
    - Secrets Listing Page (Home Screen with search, list of secrets)
    - New Pass Add Page (Input secret data)
    - Edit Pass Page (Edit existing secret data)
    - Delete Pass Flow (Delete Confirmation Page)
    - Sync Pass Page (Manual Sync Trigger and Status)

## Key Functionality Notes

- **Encryption/Decryption:** The LLM should scaffold the UI and logic flow assuming functions like `encryptSecret(data, ageKey)` and `decryptSecret(encryptedData, ageKey)` exist (presumably in a `packages/crypto` or native module). It should focus on _when_ these functions are called.
- **File Storage:** Secrets will be stored as encrypted YAML files (e.g., `google.yaml.sops`) in a specific app directory. The LLM should integrate file read/write operations (using `react-native-fs` or similar, or just calling placeholder storage functions).
- **Git Sync:** The LLM should create the UI for Git setup and the component for the manual sync page. It should integrate placeholder calls for Git operations (`clone`, `pull`, `push`).
- **Passcode:** A simple PIN/passcode for quick access. This is _not_ used for file encryption (Age handles that), but for app-level access control. It should be stored securely (e.g., using `react-native-keychain` or encrypted preferences).

## Development Guidelines and Preferences

- **Navigation:** Use `expo-router` for file-based routing instead of `react-navigation`.
- **Styling:** Prefer Tailwind CSS for all styling. Utilize the colors and typography defined in `apps/own-your-secrets/global.css`.
- **UI Components:** Use `react-native-reusables` (the shadcn/ui equivalent for React Native) for UI components. New components should be added to `packages/ui`.
- **CLI Commands:** When using `react-native-reusables` CLI commands (e.g., `npx @react-native-reusables/cli@latest add <component>`), ensure they are run from the specific app or package directory (e.g., `apps/own-your-secrets`) and not the monorepo root.

## App Architecture

![App Diagram](./app-diagram.png)
