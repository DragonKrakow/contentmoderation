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
    if (typeof toxicity === "undefined") {
      resultDiv.innerHTML = "<span style='color:red'>Toxicity model not loaded. Please ensure you have included the TensorFlow.js and toxicity model scripts in your HTML.</span>";
      return;
    }
    toxicityModel = await toxicity.load(0.7); // 0.7 is the threshold
  }
  toxicityModel.classify([textToCheck]).then(predictions => {
    let toxicLabels = predictions.filter(p => p.results[0].match).map(p => p.label);
    let resultHtml = "<b>Model predictions:</b><ul>";
    predictions.forEach(p => {
      resultHtml += `<li>${p.label}: ${(p.results[0].probabilities[1] * 100).toFixed(2)}% (${p.results[0].match ? "match" : "no match"})</li>`;
    });
    resultHtml += "</ul>";

    if (toxicLabels.length > 0) {
      resultDiv.innerHTML = `<span style='color:red'>Toxic labels detected: ${toxicLabels.join(", ")}</span><br>${resultHtml}`;
    } else {
      resultDiv.innerHTML = `<span style='color:green'>No toxicity detected.</span><br>${resultHtml}`;
    }
  }).catch(e => {
    resultDiv.innerHTML = `<span style='color:red'>Error running toxicity model.</span>`;
  });
};


// -------- IMAGE MODERATION (External API only) --------
document.getElementById("checkImageBtn").onclick = async function() {
  const url = document.getElementById("imageUrlInput").value.trim();
  const resultDiv = document.getElementById("imageResult");
  if (!url) {
    resultDiv.innerHTML = "Paste a public image URL.";
    return;
  }

  resultDiv.innerHTML = "Checking image (using external NSFW API)...";
  try {
    const apiResp = await fetch(`https://nsfw.m1guelpf.me/?url=${encodeURIComponent(url)}`);
    if (!apiResp.ok) {
      resultDiv.innerHTML = `<span style='color:red'>Failed to check image with external NSFW API. (${apiResp.status})</span>`;
      return;
    }
    const apiJson = await apiResp.json();
    let probList = Object.entries(apiJson)
      .filter(([k, v]) => k !== "pred")
      .map(([k, v]) => `<li>${k}: ${(v * 100).toFixed(2)}%</li>`)
      .join("");
    resultDiv.innerHTML =
      `<b>NSFW API predictions:</b><ul>${probList}</ul>` +
      `<b>Most likely:</b> <span style="${apiJson.pred !== "neutral" ? "color:red" : "color:green"}">${apiJson.pred}</span>`;
    // Also, optionally, show a warning if not neutral
    if (apiJson.pred !== "neutral") {
      resultDiv.innerHTML =
        `<span style="color:red">NSFW detected: ${apiJson.pred.toUpperCase()}</span><br>` +
        resultDiv.innerHTML;
    }
  } catch (e) {
    resultDiv.innerHTML = `<span style='color:red'>Error contacting external NSFW API.</span>`;
  }
};
