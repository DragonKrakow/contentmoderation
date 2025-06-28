// -------- TEXT MODERATION --------
let toxicityModel = null;
document.getElementById("checkTextBtn").onclick = async function() {
  const input = document.getElementById("inputText").value.trim();
  const resultDiv = document.getElementById("textResult");
  if (!input) {
    resultDiv.innerHTML = "Please paste text or a post URL.";
    return;
  }
  resultDiv.innerHTML = "Checking...";

  // If it's a Reddit post URL, try to fetch post text (other platforms not supported client-side)
  let textToCheck = input;
  if (input.match(/^https?:\/\/(www\.)?reddit\.com\//)) {
    try {
      let url = input;
      if (!url.endsWith(".json")) url += ".json";
      const resp = await fetch(url, {headers: {"User-Agent": "Mozilla/5.0"}});
      const data = await resp.json();
      const post = data[0]?.data?.children[0]?.data;
      textToCheck = post?.selftext || post?.title || input;
    } catch(e) {
      resultDiv.innerHTML = "Could not fetch Reddit post content. Please paste the text manually.";
      return;
    }
  } else if (input.match(/^https?:\/\/(www\.)?(x\.com|twitter\.com|facebook\.com|instagram\.com|onlyfans\.com)\//)) {
    resultDiv.innerHTML = "Cannot auto-fetch text from this platform. Please copy/paste the post text.";
    return;
  }

  // Load the TensorFlow.js toxicity model if not loaded
  if (!toxicityModel) {
    toxicityModel = await toxicity.load(0.7); // 0.7 is the threshold
  }
  toxicityModel.classify([textToCheck]).then(predictions => {
    let toxicLabels = predictions.filter(p => p.results[0].match).map(p => p.label);
    if (toxicLabels.length > 0) {
      resultDiv.innerHTML = `<span style='color:red'>Toxic labels detected: ${toxicLabels.join(", ")}</span>`;
    } else {
      resultDiv.innerHTML = `<span style='color:green'>No toxicity detected.</span>`;
    }
  }).catch(e => {
    resultDiv.innerHTML = `<span style='color:red'>Error running toxicity model.</span>`;
  });
};


// -------- IMAGE MODERATION --------
let nsfwModel = null;
document.getElementById("checkImageBtn").onclick = async function() {
  const url = document.getElementById("imageUrlInput").value.trim();
  const resultDiv = document.getElementById("imageResult");
  if (!url) {
    resultDiv.innerHTML = "Paste a public image URL.";
    return;
  }
  resultDiv.innerHTML = "Checking image...";

  // Load NSFWJS model if not loaded
  if (!nsfwModel) {
    nsfwModel = await nsfwjs.load();
  }

  // Create an image element
  let img = new window.Image();
  img.crossOrigin = "anonymous";
  img.onload = async function() {
    // Create a canvas to draw the image
    let canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    let ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);
    // Classify the image
    const predictions = await nsfwModel.classify(canvas);
    // Find the category with the highest probability
    const top = predictions.sort((a, b) => b.probability - a.probability)[0];
    if (top.className === "Hentai" || top.className === "Porn" || top.className === "Sexy") {
      resultDiv.innerHTML = `<span style='color:red'>NSFW detected: ${top.className} (${(top.probability*100).toFixed(1)}%)</span>`;
    } else {
      resultDiv.innerHTML = `<span style='color:green'>Safe: ${top.className} (${(top.probability*100).toFixed(1)}%)</span>`;
    }
  };
  img.onerror = function() {
    resultDiv.innerHTML = "<span style='color:red'>Could not load image. Try a direct image URL.</span>";
  };
  img.src = url;
};
