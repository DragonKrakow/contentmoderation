# Multi-Platform Content Moderator (Free)

A static site for checking text or images for safe posting on Reddit, Twitter/X, Facebook, Instagram, and OnlyFans.

## Features

- **Text/Captions**: Paste text or a post URL (Reddit auto-fetches post, others require manual paste).
- **Images**: Paste a public Google Drive image link. The tool checks for NSFW or risky content.
- **No signup or API key required.**

## How to Use

1. **Deploy to GitHub Pages**:
   - Upload all files to a new GitHub repo (e.g., `content-moderator-site`).
   - Go to repo Settings → Pages.
   - Set source to `/ (root)` or `/docs` if you put your files there.
   - Share the GitHub Pages link (e.g., `https://yourusername.github.io/content-moderator-site/`).

2. **Check Text**:
   - Paste your post's text or caption, or paste a Reddit post URL.
   - Click "Check Text".
   - See if the content is flagged as "toxic" (risky for posting).

3. **Check Image**:
   - Upload your image to Google Drive.
   - Right-click → "Get link" → Set access: "Anyone with the link".
   - Copy the link. Paste it in the site.
   - Click "Check Image".
   - See if the image is likely NSFW or safe.

## Supported Platforms

- **Reddit**: Paste text or post URL (auto-fetches text for posts).
- **Twitter/X, Facebook, Instagram, OnlyFans**: Paste text/caption manually.

## Notes

- All moderation is done client-side, using free Hugging Face APIs.
- No login, no fees, no programming needed.
- For more advanced features, edit `main.js`.

---