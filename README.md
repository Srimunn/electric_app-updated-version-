# Autonomous Wireless EV Charging Client ⚡

Welcome to the **Autonomous Wireless EV Charging App**. This is a React Native / Expo web application designed to run seamlessly on modern laptops and mobile browsers.

This guide provides step-by-step instructions to set up, configure, and run the web application locally on your laptop.

---

## 📋 Prerequisites

Before running the application, make sure you have the following installed on your laptop:

1. **Node.js** (v18.x or v20.x recommended):
   - [Download Node.js](https://nodejs.org/) and follow the installer instructions.
   - To verify the installation, open your terminal/command prompt and run:
     ```bash
     node -v
     npm -v
     ```
2. **Git** (Optional, to clone the project):
   - [Download Git](https://git-scm.com/) if you haven't already.

---

## 🚀 Getting Started

Follow these steps to run the web application on your laptop:

### 1. Clone or Extract the Project
If you are using Git, clone the repository:
```bash
git clone https://github.com/Srimunn/electric_app-updated-version-.git
cd electric_app-updated-version-
```
Otherwise, extract the zip file of the project and open your terminal (Command Prompt, PowerShell, or Git Bash) inside the project folder.

### 2. Configure Environment Variables
The frontend communicates with a backend server. You need to configure the backend API URL.

1. Locate or create a file named `.env` in the root directory.
2. Open `.env` and set `EXPO_PUBLIC_API_URL` to point to your running backend server:
   ```env
   EXPO_PUBLIC_API_URL=http://localhost:5000
   ```
   *(Replace `http://localhost:5000` with the actual IP address/URL where the backend server is running if it is hosted elsewhere or running on another machine on the LAN).*

### 3. Install Dependencies
Run the following command to download and install all necessary packages:
```bash
npm install
```
*(This may take a minute or two to finish).*

### 4. Start the Web App
Run the start command tailored for web mode:
```bash
npm run web
```
This command starts the Expo developer server and opens the application in your default web browser automatically (typically at `http://localhost:8081`).

*If the browser does not open automatically, look at the terminal output and open the displayed URL (e.g., `http://localhost:8081`) manually.*

---

## 🛠️ Folder Structure & Highlights

- **`app/`**: Contains the main screen layouts and screens (using Expo Router file-based navigation):
  - `index.tsx`: Main loading and initialization screen.
  - `login.tsx` & `register.tsx`: User authentication.
  - `selection.tsx`: Vehicle model selection.
  - `home.tsx` & `details.tsx`: Charging status and vehicle details.
  - `settings.tsx`: Profile controls and logout mechanism.
- **`app/config/network.ts`**: Resolves the backend server URLs dynamically depending on the environment.
- **`context/`**: Manages React state contexts (e.g., realtime websocket connections and vehicle selection state).

---

## ❓ Troubleshooting

### Port Already In Use
If you get an error saying port `8081` is already in use, Expo will ask if you want to use a different port. Type `y` (yes) to run it on an alternative port (e.g. `8082`).

### Connecting to Backend Issues
- Ensure your backend server is active and running.
- If you are running the backend on a different machine or testing on a physical mobile device, update `.env` with the machine's local IP (e.g. `EXPO_PUBLIC_API_URL=http://192.168.1.15:5000`).
- Ensure both the laptop running the web app and the machine running the backend are on the same Wi-Fi network.
