# Anton — Systems Engineering Portfolio

An interactive, dark-themed portfolio website built with **pure HTML, CSS, and JavaScript**.  
Themed around "Systems Thinking" — designed to feel like a futuristic control panel.

## 📁 Project Structure

```
portfolio/
├── index.html            # Main HTML — semantic, accessible
├── css/
│   ├── styles.css        # Core styles, layout, responsive design
│   └── animations.css    # All keyframes & scroll-reveal classes
├── js/
│   ├── main.js           # App entry point — orchestrates everything
│   ├── animations.js     # Typing effect, skill bars, scroll reveals
│   ├── canvas.js         # Hero background — blueprint grid + particles
│   └── system-viz.js     # Interactive node-based system visualization
├── assets/               # Place images, CV PDF, etc. here
│   └── .gitkeep
└── README.md
```

## 🚀 Deploy to GitHub Pages

1. **Create a GitHub repository** (e.g., `portfolio`)
2. **Push this folder** to the repo:
   ```bash
   cd portfolio
   git init
   git add .
   git commit -m "Initial portfolio deploy"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/portfolio.git
   git push -u origin main
   ```
3. **Enable GitHub Pages:**
   - Go to **Settings → Pages**
   - Source: **Deploy from a branch**
   - Branch: **main**, folder: **/ (root)**
   - Click **Save**
4. Your site will be live at `https://YOUR_USERNAME.github.io/portfolio/`

## ✨ Features

- **Hero Section** — Typing animation, canvas particle background, blueprint grid
- **About Section** — Terminal-style bio, animated skill bars, interactive skill diagram
- **Projects Section** — Hover glow cards, modal popups, tag system
- **System Visualization** — Click-to-activate node network with live HUD stats
- **Timeline** — Scroll-animated vertical timeline
- **Contact** — Animated form with validation, social links
- **Bonus:** Custom cursor, scroll progress bar, page loader, glassmorphism

## 🎨 Customization

- **Colors:** Edit CSS custom properties in `:root` at the top of `css/styles.css`
- **Content:** Edit text directly in `index.html`
- **Projects:** Update the `projectDetails` object in `js/main.js`
- **Typing words:** Edit the array in `Animations.initTypingEffect()` call in `js/main.js`
- **CV Download:** Replace the `#` href on the "Download CV" button with your PDF path

## 💡 Suggested Improvements

1. **Add a real backend** for the contact form (Formspree, Netlify Forms, etc.)
2. **Add real project screenshots** in the project cards
3. **Implement dark/light theme toggle** with `prefers-color-scheme` support
4. **Add page transition animations** between sections
5. **Implement a blog section** with Markdown rendering
6. **Add i18n** (internationalization) for multiple languages
7. **Optimize images** with WebP format and lazy loading
8. **Add Open Graph meta tags** for better social media sharing
9. **Implement service worker** for offline support (PWA)
10. **Add analytics** (privacy-friendly, like Plausible or Umami)

## ⚡ Performance Notes

- No external JS frameworks — pure vanilla JavaScript
- Only external dependency: Google Fonts (Inter + JetBrains Mono)
- CSS animations use `will-change` and `transform` for GPU acceleration
- `IntersectionObserver` used instead of scroll event listeners where possible
- Canvas rendering is optimized with particle count reduction on mobile
- `prefers-reduced-motion` media query respected for accessibility

## 📄 License

MIT — Feel free to use and modify for your own portfolio.
