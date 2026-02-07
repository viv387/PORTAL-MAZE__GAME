#!/bin/bash

echo "🎮 Portal Maze Game - Quick Deployment Script"
echo "=============================================="
echo ""

# Check if git is installed
if ! command -v git &> /dev/null; then
    echo "❌ Git is not installed. Please install Git first."
    exit 1
fi

echo "📦 Initializing Git repository..."
git init

echo "📝 Adding files..."
git add .

echo "💾 Creating initial commit..."
git commit -m "🎮 Initial commit - Portal Maze Game"

echo ""
echo "✅ Local repository ready!"
echo ""
echo "Next steps:"
echo "1. Create a new repository on GitHub: https://github.com/new"
echo "2. Run these commands (replace YOUR_USERNAME and YOUR_REPO):"
echo ""
echo "   git branch -M main"
echo "   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git"
echo "   git push -u origin main"
echo ""
echo "3. Enable GitHub Pages:"
echo "   - Go to repository Settings → Pages"
echo "   - Select branch: main, folder: / (root)"
echo "   - Save"
echo ""
echo "🚀 Your game will be live at: https://YOUR_USERNAME.github.io/YOUR_REPO/"
echo ""
