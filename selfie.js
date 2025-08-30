const uploadInput = document.getElementById("upload");
const projectSelect = document.getElementById("projectSelect");
const mockupGallery = document.getElementById("mockupGallery");
const selfieImage = document.getElementById("selfieImage");
const selfieCanvas = document.getElementById("selfieCanvas");
const saveBtn = document.getElementById("saveBtn");

// 1. Populate project selector
designs.forEach((proj) => {
  const opt = document.createElement("option");
  opt.value = proj.id;
  opt.textContent = proj.title;
  projectSelect.appendChild(opt);
});

// 2. Handle selfie upload
uploadInput.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (file) {
    selfieImage.src = URL.createObjectURL(file);
    selfieImage.style.display = "block";
  }
});

// 3. Show mockup gallery for selected project
projectSelect.addEventListener("change", (e) => {
  mockupGallery.innerHTML = "";
  const selected = designs.find((d) => d.id === e.target.value);
  if (selected) {
    selected.mockupGallery.forEach((mock) => {
      const img = document.createElement("img");
      img.src = mock.url;
      img.alt = mock.altText;
      img.addEventListener("click", () => addOverlay(mock.url));
      mockupGallery.appendChild(img);
    });
  }
});

// 4. Add draggable overlay
function addOverlay(url) {
  const img = document.createElement("img");
  img.src = url;
  img.className = "overlay";
  img.style.left = "50px";
  img.style.top = "50px";

  // drag logic
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

// 5. Export selfie
saveBtn.addEventListener("click", async () => {
  html2canvas(selfieCanvas).then((canvas) => {
    const link = document.createElement("a");
    link.download = "my-digital-selfie.png";
    link.href = canvas.toDataURL();
    link.click();
  });
});