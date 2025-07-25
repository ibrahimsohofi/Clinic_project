To set up the project for the Medical Rehabilitation Clinic website, we will establish a monorepo structure, initialize Git, and configure both the React.js frontend with Tailwind CSS and the Node.js/Express.js backend.

### 1. Project Directory Structure

A monorepo approach is recommended for full-stack applications using React and Node.js, as it simplifies code sharing, dependency management, and consistency across the codebase. This structure allows both the frontend and backend to reside in a single repository while maintaining separate environments and configurations.

The recommended project structure is as follows:

```
project-root/
├── client/
│ ├── public/
│ ├── src/
│ │ ├── components/
│ │ ├── pages/
│ │ ├── services/
│ │ ├── utils/
│ │ └── App.js
│ ├── .env.example
│ └── package.json
├── server/
│ ├── src/
│ │ ├── config/
│ │ ├── controllers/
│ │ ├── models/
│ │ ├── routes/
│ │ ├── services/
│ │ ├── utils/
│ │ └── app.js
│ ├── tests/
│ ├── .env.example
│ └── package.json
├── .gitignore
├── package.json
├── nodemon.json (optional, for backend auto-restart)
├── tailwind.config.js (for frontend Tailwind configuration)
├── postcss.config.js (for frontend PostCSS configuration)
└── docker-compose.yml (optional, for containerization)
```

### 2. Initialize Git Repository

To set up version control for your project, follow these steps:

1.  **Navigate to the project root directory**:
    ```bash
    cd project-root
    ```
2.  **Initialize a new Git repository**:
    ```bash
    git init
    ```
3.  **Create a `.gitignore` file**: This file specifies intentionally untracked files that Git should ignore. Common entries for a React and Node.js project include `node_modules/`, `.env`, and build directories.
    ```
    # Node.js
    node_modules/
    .env

    # React
    build/
    .env.local
    .env.development.local
    .env.test.local
    .env.production.local

    # Logs
    npm-debug.log*
    yarn-debug.log*
    yarn-error.log*

    # OS
    .DS_Store
    Thumbs.db
    ```
4.  **Make your first commit**:
    ```bash
    git add .
    git commit -m "Initial project setup with monorepo structure"
    ```
5.  **Connect to a remote repository (e.g., GitHub, GitLab)**:
    *   Create a new empty repository on your chosen platform.
    *   Add the remote origin and push your initial commit:
        ```bash
        git remote add origin <remote_repository_url>
        git push -u origin master # or main, depending on your remote's default branch
        ```

### 3. Configure Development Environment

#### 3.1 Backend Setup (Node.js with Express.js)

1.  **Navigate to the `server` directory**:
    ```bash
    cd server
    ```
2.  **Initialize a new Node.js project**:
    ```bash
    npm init -y
    ```
    This creates a `package.json` file for your backend.
3.  **Install Express.js**:
    ```bash
    npm install express
    ```
4.  **Install `nodemon` for automatic server restarts (development dependency)**:
    `nodemon` automatically restarts your Node.js application when file changes are detected, streamlining the development workflow.
    ```bash
    npm install nodemon --save-dev
    ```
5.  **Configure `nodemon` in `package.json` or `nodemon.json`**:
    You can add a `start` script to your `server/package.json` to use `nodemon`.
    ```json
    // server/package.json
    {
      "name": "server",
      "version": "1.0.0",
      "description": "",
      "main": "src/app.js",
      "scripts": {
        "start": "nodemon src/app.js"
      },
      "keywords": [],
      "author": "",
      "license": "ISC",
      "dependencies": {
        "express": "^4.17.1"
      },
      "devDependencies": {
        "nodemon": "^2.0.15"
      }
    }
    ```
    Alternatively, create a `nodemon.json` file in the `server` directory for more complex configurations.
6.  **Create a basic Express.js application file (`server/src/app.js`)**:
    ```javascript
    // server/src/app.js
    const express = require('express');
    const app = express();
    const port = 4000; // Or any desired port

    app.get('/', (req, res) => {
      res.send('Hello from the backend!');
    });

    app.listen(port, () => {
      console.log(`Backend server listening on port ${port}!`);
    });
    ```
7.  **Test the backend**:
    ```bash
    npm start
    ```
    You should see "Backend server listening on port 4000!" in your console.

#### 3.2 Frontend Setup (React.js with Tailwind CSS)

It is highly recommended to use Vite for creating React applications with Tailwind CSS due to its faster development experience and better flexibility compared to Create React App, especially concerning PostCSS configurations.

1.  **Navigate back to the project root directory**:
    ```bash
    cd .. # if you are in the server directory
    ```
2.  **Create a new React project using Vite**:
    ```bash
    npm create vite@latest client -- --template react
    ```
    This command creates a `client` directory with a basic React project.
3.  **Navigate into the `client` directory**:
    ```bash
    cd client
    ```
4.  **Install project dependencies**:
    ```bash
    npm install
    ```
5.  **Install Tailwind CSS and its peer dependencies**:
    ```bash
    npm install -D tailwindcss postcss autoprefixer
    ```
6.  **Generate Tailwind CSS and PostCSS configuration files**:
    ```bash
    npx tailwindcss init -p
    ```
    This command creates `tailwind.config.js` and `postcss.config.js` in your `client` directory.
7.  **Configure `tailwind.config.js`**: Update the `content` array to include paths to all your React components and HTML files where Tailwind classes will be used.
    ```javascript
    // client/tailwind.config.js
    /** @type {import('tailwindcss').Config} */
    export default {
      content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
      ],
      theme: {
        extend: {},
      },
      plugins: [],
    }
    ```
8.  **Add Tailwind directives to your main CSS file (`client/src/index.css`)**: Clear any default styling and add the following:
    ```css
    /* client/src/index.css */
    @tailwind base;
    @tailwind components;
    @tailwind utilities;
    ```
9.  **Modify `client/src/App.jsx` to test Tailwind CSS**:
    ```javascript
    // client/src/App.jsx
    function App() {
      return (
        <h1 className="text-3xl font-bold underline text-center text-blue-600">
          Hello from the frontend with Tailwind CSS!
        </h1>
      );
    }

    export default App;
    ```
10. **Test the frontend**:
    ```bash
    npm run dev
    ```
    Open your browser to the URL provided (e.g., `http://localhost:5173`). You should see the styled "Hello from the frontend with Tailwind CSS!" message.

### 4. Running Both Frontend and Backend Concurrently

To streamline development, you can run both the frontend and backend servers simultaneously from the project root using `concurrently`.

1.  **Navigate back to the project root directory**:
    ```bash
    cd .. # if you are in the client directory
    ```
2.  **Install `concurrently` as a development dependency in the project root**:
    ```bash
    npm install concurrently --save-dev
    ```
3.  **Update the root `package.json` to include scripts for running both applications**:
    ```json
    // project-root/package.json
    {
      "name": "medical-rehab-clinic",
      "version": "1.0.0",
      "description": "Full-stack web application for Medical Rehabilitation Clinic",
      "main": "index.js",
      "scripts": {
        "start:backend": "npm start --prefix server",
        "start:frontend": "npm run dev --prefix client",
        "dev": "concurrently \"npm run start:backend\" \"npm run start:frontend\""
      },
      "keywords": [],
      "author": "",
      "license": "ISC",
      "devDependencies": {
        "concurrently": "^8.2.2"
      }
    }
    ```
    *   `"start:backend"`: Runs the `start` script defined in the `server` directory's `package.json`.
    *   `"start:frontend"`: Runs the `dev` script defined in the `client` directory's `package.json`.
    *   `"dev"`: Uses `concurrently` to run both the backend and frontend scripts in parallel.

4.  **Start both applications**:
    ```bash
    npm run dev
    ```
    This command will start both your Node.js backend and React frontend servers, allowing for integrated development.