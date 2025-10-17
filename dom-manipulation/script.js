// ==========================
// Dynamic Quote Generator
// ==========================

// Initial quotes array
let quotes = [
  { text: "The best way to get started is to quit talking and begin doing.", category: "Motivation" },
  { text: "Life is what happens when you're busy making other plans.", category: "Life" },
  { text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", category: "Success" }
];

// DOM elements
const quoteDisplay = document.getElementById("quoteDisplay");
const newQuoteBtn = document.getElementById("newQuote");
const addQuoteBtn = document.getElementById("addQuoteBtn");
const newQuoteText = document.getElementById("newQuoteText");
const newQuoteCategory = document.getElementById("newQuoteCategory");
const categorySelect = document.getElementById("categorySelect");

// ==========================
// Show Random Quote
// ==========================
function showRandomQuote() {
  const selectedCategory = categorySelect.value;
  let filteredQuotes = quotes;

  // Filter by selected category
  if (selectedCategory !== "all") {
    filteredQuotes = quotes.filter(
      q => q.category.toLowerCase() === selectedCategory.toLowerCase()
    );
  }

  // Handle empty category
  if (filteredQuotes.length === 0) {
    quoteDisplay.innerHTML = `<em>No quotes available for this category.</em>`;
    return;
  }

  // Pick random quote
  const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
  const randomQuote = filteredQuotes[randomIndex];

  // Display quote using innerHTML
  quoteDisplay.innerHTML = `
    <p>"${randomQuote.text}"</p>
    <small>— <strong>${randomQuote.category}</strong></small>
  `;
}

// ==========================
// Add New Quote
// ==========================
function addQuote() {
  const text = newQuoteText.value.trim();
  const category = newQuoteCategory.value.trim();

  if (!text || !category) {
    quoteDisplay.innerHTML = `<em style="color:red;">⚠️ Please enter both quote text and category.</em>`;
    return;
  }

  // Add to quotes array
  quotes.push({ text, category });

  // Add new category to dropdown if it doesn't exist
  const existingOption = Array.from(categorySelect.options).some(
    opt => opt.value.toLowerCase() === category.toLowerCase()
  );

  if (!existingOption) {
    const newOption = document.createElement("option");
    newOption.value = category;
    newOption.textContent = category;
    categorySelect.appendChild(newOption);
  }

  // Clear inputs
  newQuoteText.value = "";
  newQuoteCategory.value = "";

  // Show success message
  quoteDisplay.innerHTML = `<em style="color:green;">✅ Quote added successfully! Click "Show New Quote" to see it.</em>`;
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

// Initialize on load
populateCategories();
