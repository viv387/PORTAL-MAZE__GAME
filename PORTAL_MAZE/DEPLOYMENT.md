# 🚀 Deployment Quick Start Guide

## Easiest Method: Netlify Drop

1. Go to https://app.netlify.com/drop
2. Drag and drop your entire `PORTAL_MAZE` folder
3. Done! Your game is live instantly 🎉

Your URL will be something like: `https://random-name-123.netlify.app`

---

## Method 2: GitHub Pages (Free Hosting)

### Step 1: Create GitHub Repository

1. Go to https://github.com/new
2. Repository name: `portal-maze` (or any name)
3. Keep it Public
4. Don't initialize with README (we already have one)
5. Click "Create repository"

### Step 2: Deploy Your Code

**Option A: Using the deploy script (Windows)**
```bash
# Navigate to your project folder
cd C:\Users\vivek\OneDrive\Desktop\PORTAL_MAZE\PORTAL-MAZE__GAME\PORTAL_MAZE

# Run the deployment script
deploy.bat

# Then follow the on-screen instructions
```

**Option B: Manual commands**
```bash
# Navigate to your project folder
cd C:\Users\vivek\OneDrive\Desktop\PORTAL_MAZE\PORTAL-MAZE__GAME\PORTAL_MAZE

# Initialize git
git init
git add .
git commit -m "Initial commit"

# Connect to GitHub (replace YOUR_USERNAME and YOUR_REPO)
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

### Step 3: Enable GitHub Pages

1. Go to your repository on GitHub
2. Click **Settings** tab
3. Scroll to **Pages** section (left sidebar)
4. Under "Source":
   - Branch: `main`
   - Folder: `/ (root)`
5. Click **Save**
6. Wait 1-2 minutes for deployment

Your game will be live at: `https://YOUR_USERNAME.github.io/YOUR_REPO/`

---

## Method 3: Vercel (Recommended for Custom Domains)

### One-Click Deploy

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Deploy:
   ```bash
   cd C:\Users\vivek\OneDrive\Desktop\PORTAL_MAZE\PORTAL-MAZE__GAME\PORTAL_MAZE
   vercel
   ```

3. Follow prompts:
   - Set up and deploy? **Y**
   - Which scope? (select your account)
   - Link to existing project? **N**
   - What's your project's name? **portal-maze**
   - In which directory? **./** (current directory)
   - Auto-detected settings? **Y**

4. For production deployment:
   ```bash
   vercel --prod
   ```

Your game will be live at: `https://portal-maze.vercel.app`

---

## Method 4: Local Testing

Test locally before deploying:

### Python (if installed)
```bash
cd C:\Users\vivek\OneDrive\Desktop\PORTAL_MAZE\PORTAL-MAZE__GAME\PORTAL_MAZE
python -m http.server 8000
```

### Node.js (if installed)
```bash
cd C:\Users\vivek\OneDrive\Desktop\PORTAL_MAZE\PORTAL-MAZE__GAME\PORTAL_MAZE
npx http-server -p 8000
```

Then open: http://localhost:8000

---

## 📱 Custom Domain (Optional)

### For Netlify:
1. Go to Domain settings
2. Add custom domain
3. Follow DNS configuration steps

### For GitHub Pages:
1. Go to repository Settings → Pages
2. Add custom domain under "Custom domain"
3. Configure DNS with your provider:
   - A Record: `185.199.108.153`
   - A Record: `185.199.109.153`
   - A Record: `185.199.110.153`
   - A Record: `185.199.111.153`

### For Vercel:
1. Run: `vercel domains add yourdomain.com`
2. Follow DNS configuration steps

---

## ✅ Checklist Before Deployment

- [ ] All files present (index.html, game.html, editor.html, style.css)
- [ ] Assets folder with gastly.png
- [ ] All JS files in js/ folder
- [ ] Test locally first
- [ ] Check browser console for errors
- [ ] Test on different browsers (Chrome, Firefox, Safari)

---

## 🐛 Troubleshooting

**Issue: Blank page after deployment**
- Check browser console (F12)
- Ensure all file paths are relative (no absolute paths)
- Check that all files were uploaded

**Issue: 404 errors for CSS/JS**
- Verify file paths in HTML are correct
- Ensure case-sensitivity matches (js/ vs JS/)

**Issue: Game not working**
- Check if localStorage is enabled
- Try in incognito/private mode
- Clear browser cache

---

## 🎉 You're Done!

Share your game URL with friends and enjoy!

**Need help?** Check the main README.md for more information.

---

**Pro Tip:** After any changes, redeploy:
- GitHub Pages: `git add . && git commit -m "Update" && git push`
- Netlify: Drag and drop again or connect to Git
- Vercel: `vercel --prod`
