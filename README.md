# GETSPD Website

Static homepage for **GETSPD** — ready for GitHub Pages.

## Local preview

```bash
cd GetSPD_WebSite
python3 -m http.server 8080
```

Open [http://localhost:8080](http://localhost:8080).

## Deploy on GitHub Pages

1. Create a GitHub repository (e.g. `GetSPD_WebSite` or `getspd.github.io`).
2. Push this folder to `main`.
3. In the repo: **Settings → Pages → Build and deployment**.
4. Source: **Deploy from a branch**.
5. Branch: `main` / folder: `/ (root)`.
6. Save — the site will be at `https://<user>.github.io/<repo>/`.

If the repo is named `<user>.github.io`, the site is served from the root domain.

## Structure

```
index.html
css/styles.css
js/main.js
assets/
  brand/          # logo + favicon
  screens/        # app screenshots
  *.png           # hero / lifestyle / CTA imagery
```
