// FAQ accordion toggle
document.querySelectorAll(".faq-item button").forEach(button => {
  button.addEventListener("click", () => {
    const faqItem = button.parentElement;
    const isOpen = faqItem.classList.contains("active");

    // Close all
    document.querySelectorAll(".faq-item").forEach(item => {
      item.classList.remove("active");
    });

    // Toggle current
    if (!isOpen) {
      faqItem.classList.add("active");
    }
  });
});

// FAQ search
const searchInput = document.getElementById("faqSearch");

searchInput.addEventListener("input", function () {
  const filter = this.value.toLowerCase();
  const items = document.querySelectorAll(".faq-item");

  items.forEach(item => {
    const question = item.querySelector("span").textContent.toLowerCase();
    item.style.display = question.includes(filter) ? "block" : "none";
  });
});

