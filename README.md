# 👻 ESCAPE THE GHASTLY - Portal Maze Game

A ghost-themed puzzle maze game where you navigate through portals, break walls, and find the optimal path to escape!

## 🎮 Features

- **Ghost Theme**: Beautiful cyan and purple aesthetic with glowing effects
- **Portal System**: Teleport through colored portals to navigate the maze
- **Wall Breaking Mode**: Break through walls strategically (limited breaks)
- **Difficulty Levels**: Easy, Medium, Hard for both modes
- **Path Hints**: Get real-time hints for the next best move
- **Leaderboard**: Track and compare your best scores
- **Map Editor**: Create and edit your own custom mazes
- **Path Visualization**: See the optimal solution in the editor

## 🚀 Quick Start

1. Open `index.html` in your browser
2. Enter your username
3. Select mode (Normal or Wall Break) and difficulty
4. Navigate using WASD or Arrow keys
5. Press Enter to teleport through portals
6. Hold Enter + movement key to break walls (in Wall Break mode)

## 🎯 Game Controls

- **Movement**: WASD or Arrow Keys
- **Teleport**: Enter (when standing on a portal)
- **Break Wall**: Enter + Movement Key (in Wall Break mode)
- **Pause**: Click Pause button
- **Reset**: Click Reset button
- **Hint**: Click Show Hint button

## 📁 Project Structure

```
PORTAL_MAZE/
├── index.html          # Landing page
├── game.html           # Main game page
├── editor.html         # Map editor
├── style.css           # Ghost-themed styles
├── assets/             # Images and resources
│   └── gastly.png
└── js/
    ├── main.js         # Entry point
    ├── config.js       # Game configuration
    ├── game.js         # Game logic
    ├── ui.js           # UI handlers
    ├── editor.js       # Map editor
    ├── solver.js       # Pathfinding (BFS)
    ├── leaderboard.js  # Score tracking
    ├── animation.js    # Visual effects
    └── presets.js      # Default maps
```

## 🌐 Deployment Options

### Option 1: GitHub Pages (Recommended)

1. Create a new GitHub repository
2. Push your PORTAL_MAZE folder:
   ```bash
   cd PORTAL_MAZE/PORTAL-MAZE__GAME/PORTAL_MAZE
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/portal-maze.git
   git push -u origin main
   ```
3. Go to repository Settings → Pages
4. Select branch: `main`, folder: `/ (root)`
5. Save and wait for deployment
6. Access at: `https://YOUR_USERNAME.github.io/portal-maze/`

### Option 2: Netlify

1. Go to [netlify.com](https://www.netlify.com)
2. Drag and drop the `PORTAL_MAZE` folder
3. Your site will be live instantly!
4. Optional: Configure custom domain

### Option 3: Vercel

1. Install Vercel CLI: `npm i -g vercel`
2. Navigate to project folder
3. Run: `vercel`
4. Follow the prompts
5. Deploy with: `vercel --prod`

### Option 4: Local Server

For local testing:
```bash
# Python 3
python -m http.server 8000

# Node.js (with http-server)
npx http-server -p 8000
```
Then open: `http://localhost:8000`

## 🛠️ Technical Details

- **Framework**: Vanilla JavaScript (ES6 modules)
- **Rendering**: HTML5 Canvas
- **Storage**: localStorage (for maps, scores, usernames)
- **Pathfinding**: Breadth-First Search (BFS)
- **Grid Size**: 8×8 (fixed)
- **Cell Size**: 60px

## 🎨 Customization

Edit CSS variables in `style.css` to change the theme:
```css
:root {
    --ghost-dark: #0a0e27;
    --ghost-purple: #2a1a4a;
    --ghost-accent: #7b68ee;
    --ghost-cyan: #00ffff;
    --ghost-green: #39ff14;
}
```

## 📝 Creating Custom Maps

1. Click "📝 Map Editor" from the options screen
2. Use tools to place walls, portals, start, and goal
3. Set max wall breaks (K value)
4. Click "✓ Validate Map" to test
5. Click "🔍 Show Path" to visualize solution
6. Export your map or return to game

## 🏆 Scoring System

- **Steps**: Number of moves taken
- **Time**: Completion time in seconds
- **Optimal**: Shortest possible solution
- **Leaderboard**: Top 10 scores per map/mode

## 🐛 Known Issues

- Timer starts on first move (resets don't auto-restart timer)
- Portal teleportation requires manual Enter key press

## 📄 License

Free to use and modify for personal and educational purposes.

## 👨‍💻 Credits

Developed with ❤️ using vanilla JavaScript and HTML5 Canvas.

---

**Enjoy the game! 👻**