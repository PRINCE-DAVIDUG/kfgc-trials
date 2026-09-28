const API_BASE = "https://bible-api.com/";

// Elements
const dailyRef = document.getElementById("dailyRef");
const dailyText = document.getElementById("dailyText");
const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");
const searchResults = document.getElementById("searchResults");
const msg = document.getElementById("msg");

// -----------------------
// Verse of the Day
// -----------------------
const versesOfDay = [
  "John 3:16",
  "Psalm 23:1",
  "Romans 8:28",
  "Philippians 4:13",
  "Proverbs 3:5",
  "Isaiah 41:10",
  "Matthew 5:16"
];

async function loadDailyVerse() {
  const index = new Date().getDate() % versesOfDay.length;
  const verse = versesOfDay[index];
  try {
    const res = await fetch(`${API_BASE}${encodeURIComponent(verse)}`);
    const data = await res.json();
    dailyRef.textContent = data.reference;
    dailyText.textContent = data.text;
  } catch (err) {
    dailyText.textContent = "Failed to load verse.";
    console.error(err);
  }
}

// -----------------------
// Search Functionality
// -----------------------
searchBtn.addEventListener("click", async () => {
  const query = searchInput.value.trim();
  if (!query) return;

  msg.textContent = "";
  searchResults.innerHTML = "<div class='verse-container'>Loading...</div>";

  try {
    const res = await fetch(`${API_BASE}${encodeURIComponent(query)}`);
    const data = await res.json();

    if (data.text) {
      searchResults.innerHTML = `
        <div class="verse-container">
          <span class="verse-ref">${data.reference}</span>
          <span class="verse-text">${data.text}</span>
        </div>`;
    } else {
      searchResults.innerHTML = "";
      msg.textContent = "Verse not found. Please check your format.";
    }
  } catch (err) {
    console.error(err);
    searchResults.innerHTML = "";
    msg.textContent = "Error fetching verse.";
  }
});

// Load daily verse on page load
loadDailyVerse();

