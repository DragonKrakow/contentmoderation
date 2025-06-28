document.getElementById("checkTextBtn").onclick = async function() {
  const input = document.getElementById("inputText").value.trim();
  const resultDiv = document.getElementById("textResult");
  if (!input) {
    resultDiv.innerHTML = "Please paste text or a post URL.";
    return;
  }
  resultDiv.innerHTML = "Checking...";
  let textToCheck = input;

  // If it's a Reddit/Twitter/Facebook/Instagram/OnlyFans URL, try to fetch post text
  if (input.match(/^https?:\/\/(www\.)?(reddit\.com|x\.com|twitter\.com|facebook\.com|instagram\.com|onlyfans\.com)\//)) {
    try {
      if (input.includes("reddit.com")) {
        let url = input;
        if (!url.endsWith(".json")) url += ".json";
        const resp = await fetch(url, {headers: {"User-Agent": "Mozilla/5.0"}});
        const data = await resp.json();
        const post = data[0]?.data?.children[0]?.data;
        textToCheck = post?.selftext || post?.title || input;
      } else {
        // For Twitter/X, Facebook, Instagram, OnlyFans: cannot fetch text due to CORS & login
        resultDiv.innerHTML = "Cannot auto-fetch text from this platform. Please copy/paste the post text.";
        return;
      }
    } catch(e) {
      resultDiv.innerHTML = "Could not fetch post content. Please paste the text manually.";
      return;
    }
  }

  // Hugging Face Moderation API (facebook/roberta-base-toxic-comments)
  try {
    const apiUrl = "https://api-inference.huggingface.co/models/facebook/roberta-base-toxic-comments";
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer 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"
      },
      body: JSON.stringify({"inputs": textToCheck})
    });
    const result = await response.json();
    if (result.error) {
      resultDiv.innerHTML = "<span style='color:red'>API error: "+result.error+"</span>";
      return;
    }
    const arr = result[0];
    const sorted = arr.sort((a, b) => b.score - a.score);
    const top = sorted[0];
    const color = top.label === "toxic" ? "red" : "green";
    resultDiv.innerHTML = `<span style='color:${color}'>Prediction: ${top.label} (${(top.score*100).toFixed(1)}%)</span>`;
  } catch(e) {
    resultDiv.innerHTML = "<span style='color:red'>Request failed.</span>";
  }
};

document.getElementById("checkImageBtn").onclick = async function() {
  const url = document.getElementById("imageUrlInput").value.trim();
  const resultDiv = document.getElementById("imageResult");
  if (!url) {
    resultDiv.innerHTML = "Paste a public Google Drive image URL.";
    return;
  }
  resultDiv.innerHTML = "Checking image...";

  // Convert Google Drive share link to direct download link
  let match = url.match(/\/d\/(.*?)\//);
  let fileId = match ? match[1] : null;
  if (!fileId) {
    // Try alternate link format
    match = url.match(/id=([^&]+)/);
    fileId = match ? match[1] : null;
  }
  if (!fileId) {
    resultDiv.innerHTML = "Invalid Google Drive link.";
    return;
  }
  const directUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;

  // Fetch image as blob, convert to base64
  try {
    const imgResp = await fetch(directUrl);
    const imgBlob = await imgResp.blob();
    const reader = new FileReader();
    reader.onloadend = async function() {
      const base64 = reader.result.split(',')[1];
      // Send to Hugging Face image moderation API
      const apiUrl = "https://api-inference.huggingface.co/models/SmilingWolf/wd-v1-4-vit-tagger";
      const hfResp = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer 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"
        },
        body: JSON.stringify({inputs: base64})
      });
      const res = await hfResp.json();
      if (res.error) {
        resultDiv.innerHTML = "<span style='color:red'>API error: "+res.error+"</span>";
        return;
      }
      // Check for nsfw-related tags
      const nsfwTags = Object.entries(res).filter(([k,v]) => k.includes("nsfw") && v > 0.3);
      if (nsfwTags.length > 0) {
        resultDiv.innerHTML = `<span style='color:red'>Likely NSFW: ${nsfwTags.map(([k])=>k).join(", ")}</span>`;
      } else {
        resultDiv.innerHTML = `<span style='color:green'>No strong NSFW signals detected. Likely safe.</span>`;
      }
    };
    reader.readAsDataURL(imgBlob);
  } catch(e) {
    resultDiv.innerHTML = "<span style='color:red'>Could not check image.</span>";
  }
};
