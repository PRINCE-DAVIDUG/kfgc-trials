const CLOUD_NAME = "dvnyyq3ru";
const UPLOAD_PRESET = "xdapq0dq";
const API_URL = "https://script.google.com/macros/s/AKfycbxlPtJuzw6bjTpN8iyh1r1t8dB5gWVJ7uwj7ppCb_i5Y3Z6mRRXhITZdVqdOOaRHVJG/exec";

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("testimonial-form");
  const container = document.getElementById("testimonial-cards");

  if (form) {
    const submitBtn = form.querySelector("button");

    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const name = document.getElementById("member-name").value.trim();
      const message = document.getElementById("testimonial-message").value.trim();
      const imageFile = document.getElementById("testimonial-image").files[0];

      if (!name || !message) {
        alert("Please fill all required fields");
        return;
      }

      submitBtn.disabled = true;
      submitBtn.innerText = "Submitting...";

      let imageURL = "";

      try {
        if (imageFile) {
          const fd = new FormData();
          fd.append("file", imageFile);
          fd.append("upload_preset", UPLOAD_PRESET);

          const res = await fetch(
            `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
            { method: "POST", body: fd }
          );

          const img = await res.json();
          imageURL = img.secure_url;
        }

        await fetch(API_URL, {
          method: "POST",
          body: JSON.stringify({ name, message, imageURL })
        });

        form.reset();
        alert("✅ Your testimony has been submitted!");
        loadTestimonials(container);

      } catch (err) {
        console.error(err);
        alert("❌ Failed to submit testimony");
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerText = "Submit Testimony";
      }
    });
  }

  loadTestimonials(container);
});

// ================================
// LOAD TESTIMONIALS WITH FADE-IN
// ================================
async function loadTestimonials(container) {
  if (!container) return;

  try {
    const res = await fetch(API_URL);
    const data = await res.json();

    container.innerHTML = "";

    data.reverse().forEach((t, i) => {
      if (!t.message) return;

      const card = document.createElement("div");
      card.className = "testimonial-card fade-in"; // add fade-in class

      card.innerHTML = `
        <div class="testimonial-header">
          <img class="dp" src="${t.imageURL || 'default-user.png'}" alt="${t.name || 'Member'}">
          <div>
            <strong>${t.name || "Anonymous"}</strong>
            <div class="date">${t.date || ""}</div>
          </div>
        </div>
        <p class="testimonial-message">"${t.message}"</p>
        <div class="reactions">
          <button class="like-btn">👍 ${t.likes || 0}</button>
          <button class="love-btn">❤️ ${t.love || 0}</button>
          <button class="amen-btn">🙏 ${t.amen || 0}</button>
        </div>
      `;

      const likeBtn = card.querySelector(".like-btn");
      const loveBtn = card.querySelector(".love-btn");
      const amenBtn = card.querySelector(".amen-btn");

      likeBtn.addEventListener("click", () => sendReaction(t.id, 'likes', likeBtn));
      loveBtn.addEventListener("click", () => sendReaction(t.id, 'love', loveBtn));
      amenBtn.addEventListener("click", () => sendReaction(t.id, 'amen', amenBtn));

      container.appendChild(card);
    });

  } catch (err) {
    console.error("Failed to load testimonies", err);
  }
}

// ================================
// REACTIONS (Saved to Google Script)
// ================================
async function sendReaction(testimonialId, type, button) {
  let currentCount = parseInt(button.innerText.split(" ")[1]) || 0;
  button.innerText = `${button.innerText.split(" ")[0]} ${currentCount + 1}`;

  try {
    // Send testimonial ID and reaction type to Google Script
    await fetch(`${API_URL}?id=${testimonialId}&react=${type}`, {
      method: "POST"
    });
  } catch (err) {
    console.error("Failed to send reaction", err);
    // Revert count if failed
    button.innerText = `${button.innerText.split(" ")[0]} ${currentCount}`;
  }
      }
