# Content Moderation Demo (No API Key Required)

This project is a simple web-based content moderation tool for both **text** and **images** that runs entirely in your browser.  
It uses open-source machine learning models with no API key or backend required.

---

## Features

- **Text Moderation**: Checks for toxic language using TensorFlow.js Toxicity Model.
- **Image Moderation**: Detects NSFW (Not Safe For Work) content in images using NSFWJS.
- **No API key required**: Everything runs locally in your browser.
- **Supports Reddit post URLs** for auto-fetching text. For other platforms, paste the text manually.

---

## Usage

1. Clone or download this repository.
2. Open `index.html` in your browser.
3. Paste text (or a Reddit post URL) and click **Check Text**.
4. Paste a public image URL and click **Check Image**.

**Note:**  
- For images, use a direct image URL (must allow cross-origin access).
- For Twitter, Facebook, Instagram, etc., copy and paste the post text manually (auto-fetch is not supported client-side).

---

## Technology

- [TensorFlow.js Toxicity Model](https://github.com/tensorflow/tfjs-models/tree/master/toxicity)
- [NSFWJS](https://github.com/infinitered/nsfwjs)

---

## Security & Privacy

- All processing happens in your browser.  
- No data is sent to any backend or third-party server.

---

## Credits

- Inspired by open-source moderation tools and the TensorFlow.js/NSFWJS demos.

---
