const API_BASE =
  "http://CloudGallery-ALB-1965327607.ap-southeast-2.elb.amazonaws.com";

const uploadForm = document.getElementById("uploadForm");
const imageInput = document.getElementById("imageInput");
const galleryDiv = document.getElementById("gallery");

uploadForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const file = imageInput.files[0];
  if (!file) return;

  const formData = new FormData();
  formData.append("image", file);

  await fetch(`${API_BASE}/upload`, {
    method: "POST",
    body: formData,
  });

  imageInput.value = "";
  loadGallery();
});

async function loadGallery() {
  const response = await fetch(`${API_BASE}/gallery`);
  const images = await response.json();

  galleryDiv.innerHTML = "";

  images.forEach((item) => {
    if (!item.thumbnail) return;

    const img = document.createElement("img");
    img.src = item.thumbnail;
    img.classList.add("thumbnail");

    img.addEventListener("click", () => {
      window.open(item.original, "_blank");
    });

    galleryDiv.appendChild(img);
  });
}

loadGallery();
