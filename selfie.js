const selfieBtn = document.getElementById("selfieBtn");
const selfieModal = document.getElementById("selfieModal");
const closeModal = document.getElementById("closeModal");
const uploadInput = document.getElementById("upload");
const projectSelect = document.getElementById("projectSelect");
const mockupGallery = document.getElementById("mockupGallery");
const selfieImage = document.getElementById("selfieImage");
const selfieCanvas = document.getElementById("selfieCanvas");
const saveBtn = document.getElementById("saveBtn");

// ==== 1. Modal toggle ====
selfieBtn.addEventListener("click", () => {
  selfieModal.style.display = "block";
});

closeModal.addEventListener("click", () => {
  selfieModal.style.display = "none";
});

// ==== 2. Populate project selector from projects.js ====
designs.forEach((proj) => {
  const opt = document.createElement("option");
  opt.value = proj.id;
  opt.textContent = proj.title;
  projectSelect.appendChild(opt);
});

// ==== 3. Remove background function ====
async function removeBg(file) {
  const formData = new FormData();
  formData.append("image_file", file);
  formData.append("size", "auto");

  const response = await fetch("https://api.remove.bg/v1.0/removebg", {
    method: "POST",
    headers: {
      "X-Api-Key": "YOUR_API_KEY_HERE", // 👈 replace with your key
    },
    body: formData,
  });

  if (!response.ok) {
    alert("Failed to remove background!");
    return null;
  }

  const blob = await response.blob();
  return URL.createObjectURL(blob);
}

// ==== 4. Handle selfie upload ====
uploadInput.addEventListener("change", async (e) => {
  const file = e.target.files[0];
  if (file) {
    const bgRemovedUrl = await removeBg(file);
    if (bgRemovedUrl) {
      selfieImage.src = bgRemovedUrl;
      selfieImage.style.display = "block";
    }
  }
});

// ==== 5. Show mockup gallery for selected project ====
projectSelect.addEventListener("change", (e) => {
  mockupGallery.innerHTML = "";
  const selected = designs.find((d) => d.id === e.target.value);
  if (selected) {
    selected.mockupGallery.forEach((mock) => {
      const img = document.createElement("img");
      img.src = mock.url;
      img.alt = mock.altText;
      img.style.width = "120px";
      img.style.margin = "5px";
      img.addEventListener("click", () => addOverlay(mock.url));
      mockupGallery.appendChild(img);
    });
  }
});

// ==== 6. Add draggable overlay ====
function addOverlay(url) {
  const img = document.createElement("img");
  img.src = url;
  img.className = "overlay";
  img.style.left = "50px";
  img.style.top = "50px";

  let isDragging = false, offsetX = 0, offsetY = 0;

  img.addEventListener("mousedown", (e) => {
    isDragging = true;
    offsetX = e.offsetX;
    offsetY = e.offsetY;
  });

  document.addEventListener("mousemove", (e) => {
    if (isDragging) {
      const rect = selfieCanvas.getBoundingClientRect();
      img.style.left = e.clientX - rect.left - offsetX + "px";
      img.style.top = e.clientY - rect.top - offsetY + "px";
    }
  });

  document.addEventListener("mouseup", () => (isDragging = false));

  selfieCanvas.appendChild(img);
}

// ==== 7. Export selfie with overlays ====
saveBtn.addEventListener("click", async () => {
  html2canvas(selfieCanvas).then((canvas) => {
    const link = document.createElement("a");
    link.download = "my-digital-selfie.png";
    link.href = canvas.toDataURL();
    link.click();
  });
});