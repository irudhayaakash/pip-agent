# Pip's Dream Nursery

Complete website project for Visual Studio Code. The HTML, CSS, JavaScript, and all image assets are included.

## Run in VS Code (recommended)

1. Extract this ZIP file.
2. In VS Code, choose **File → Open Folder** and select the `pips-dream-nursery` folder (the folder containing `package.json`).
3. Choose **Terminal → New Terminal**.
4. Run:

   ```bash
   npm install
   npm run dev
   ```

5. Open the local URL printed in the terminal, usually `http://127.0.0.1:5173/`.

**Important:** Don't double-click `index.html` to run the site. Keep `index.html` in the project folder; Vite serves it when you run `npm run dev`. The site preview opens in a browser, while you edit the code in VS Code.

## Build

```bash
npm run build
```

The production output is written to `dist/`.

## Requirements

Install Node.js LTS first: https://nodejs.org/
