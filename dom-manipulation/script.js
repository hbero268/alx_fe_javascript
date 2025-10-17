// ==========================
// Dynamic Quote Generator
// ==========================

// Initial quotes array
let quotes = [
  { text: "The best way to get started is to quit talking and begin doing.", category: "Motivation" },
  { text: "Life is what happens when you're busy making other plans.", category: "Life" },
  { text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", category: "Success" }
];

// DOM Elements
const quoteDisplay = document.getElementById("quoteDisplay");
const newQuoteBtn = document.getElementById("newQuote");
const addQuoteBtn = document.getElementById("addQuoteBtn");
const newQuoteText = document.getElementById("newQuoteText");
const newQuoteCategory = document.getElementById("newQuoteCategory");
const categorySelect = document.getElementById("categorySelect");

// Helper: Sanitize text for innerHTML
function escapeHtml(unsafe) {
  return unsafe
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

// ==========================
// Show Random Quote
// ==========================
function showRandomQuote() {
  const selectedCategory = categorySelect.value;
  let filteredQuotes = quotes;

  if (selectedCategory !== "all") {
    filteredQuotes = quotes.filter(q => q.category.toLowerCase() === selectedCategory.toLowerCase());
  }

  if (filteredQuotes.length === 0) {
    quoteDisplay.innerHTML = `<em>No quotes available for this category.</em>`;
    return;
  }

  const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
  const randomQuote = filteredQuotes[randomIndex];

  quoteDisplay.innerHTML = `
    <p>"${escapeHtml(randomQuote.text)}"</p>
    <small>— <strong>${escapeHtml(randomQuote.category)}</strong></small>
  `;
}

// ==========================
// Add Quote
// ==========================
function addQuote() {
  const text = newQuoteText.value.trim();
  const category = newQuoteCategory.value.trim();

  if (!text || !category) {
    quoteDisplay.innerHTML = `<em style="color:red;">⚠️ Please enter both quote text and category.</em>`;
    return;
  }

  quotes.push({ text, category });

  // Add category if it doesn't exist
  const categoryExists = Array.from(categorySelect.options)
    .some(opt => opt.value.toLowerCase() === category.toLowerCase());

  if (!categoryExists) {
    const newOption = document.createElement("option");
    newOption.value = category;
    newOption.textContent = category;
    categorySelect.appendChild(newOption);
  }

  newQuoteText.value = "";
  newQuoteCategory.value = "";

  quoteDisplay.innerHTML = `<em style="color:green;">✅ Quote added successfully! Click "Show New Quote" to view it.</em>`;
}

// ==========================
// Populate Categories
// ==========================
function populateCategories() {
  const categories = [...new Set(quotes.map(q => q.category))];
  categories.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    categorySelect.appendChild(option);
  });
}

// ==========================
// Event Listeners
// ==========================
newQuoteBtn.addEventListener("click", showRandomQuote);
addQuoteBtn.addEventListener("click", addQuote);

// Initialize dropdown
populateCategories();
