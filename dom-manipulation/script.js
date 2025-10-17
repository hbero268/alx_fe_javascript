// ==========================
// Dynamic Quote Generator
// ==========================

// Initial quotes array (seed data)
let quotes = [
  { text: "The best way to get started is to quit talking and begin doing.", category: "Motivation" },
  { text: "Life is what happens when you're busy making other plans.", category: "Life" },
  { text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", category: "Success" }
];

// DOM elements (assumes index.html has these IDs)
const quoteDisplay = document.getElementById("quoteDisplay");
const newQuoteBtn = document.getElementById("newQuote");
const addQuoteBtn = document.getElementById("addQuoteBtn");
const newQuoteText = document.getElementById("newQuoteText");
const newQuoteCategory = document.getElementById("newQuoteCategory");
const categorySelect = document.getElementById("categorySelect");

// ==========================
// Utility: sanitize input for display
// ==========================
function escapeHtml(unsafe) {
  return unsafe
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

// ==========================
// Show Random Quote (uses innerHTML)
// ==========================
function showRandomQuote() {
  const selectedCategory = (categorySelect && categorySelect.value) ? categorySelect.value : "all";
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

  // Use innerHTML to produce formatted quote
  quoteDisplay.innerHTML = `
    <p>"${escapeHtml(randomQuote.text)}"</p>
    <small>— <strong>${escapeHtml(randomQuote.category)}</strong></small>
  `;
}

// ==========================
// Add New Quote
// - Validates inputs
// - Adds to quotes array
// - Adds category to dropdown if not present
// - Updates DOM with success or error message
// ==========================
function addQuote() {
  // Defensive checks in case elements are missing
  if (!newQuoteText || !newQuoteCategory || !quoteDisplay || !categorySelect) {
    console.error("Required DOM elements for addQuote are missing.");
    return false;
  }

  const text = newQuoteText.value.trim();
  const category = newQuoteCategory.value.trim();

  if (!text || !category) {
    quoteDisplay.innerHTML = `<em style="color:red;">⚠️ Please enter both quote text and category.</em>`;
    return false;
  }

  // Push into quotes array
  const newQuoteObj = { text, category };
  quotes.push(newQuoteObj);

  // Add category to dropdown if it doesn't already exist (case-insensitive)
  const exists = Array.from(categorySelect.options).some(
    opt => opt.value.toLowerCase() === category.toLowerCase()
  );

  if (!exists) {
    const newOption = document.createElement("option");
    newOption.value = category;
    newOption.textContent = category;
    categorySelect.appendChild(newOption);
  }

  // Clear input fields
  newQuoteText.value = "";
  newQuoteCategory.value = "";

  // Show success message in the DOM (no alert)
  quoteDisplay.innerHTML = `<em style="color:green;">✅ Quote added successfully! Click "Show New Quote" to view it.</em>`;

  return true;
}

// ==========================
// Populate Categories from quotes (initial)
 // includes "all" option by default
// ==========================
function populateCategories() {
  // Clear any existing except "all"
  const existingAll = Array.from(categorySelect.options).find(opt => opt.value === "all");
  categorySelect.innerHTML = ""; // clear all
  const allOption = document.createElement("option");
  allOption.value = "all";
  allOption.textContent = "All";
  categorySelect.appendChild(allOption);

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
// - "Show New Quote" button -> showRandomQuote
// - "Add Quote" button -> addQuote
// ==========================
function attachEventListeners() {
  if (newQuoteBtn) {
    newQuoteBtn.addEventListener("click", showRandomQuote);
  } else {
    console.warn('"Show New Quote" button not found (id="newQuote").');
  }

  if (addQuoteBtn) {
    addQuoteBtn.addEventListener("click", addQuote);
  } else {
    console.warn('"Add Quote" button not found (id="addQuoteBtn").');
  }

  // Optional: allow Enter key in newQuoteText/newQuoteCategory to submit (nice UX)
  [newQuoteText, newQuoteCategory].forEach(inputEl => {
    if (inputEl) {
      inputEl.addEventListener("keyup", (e) => {
        if (e.key === "Enter") addQuote();
      });
    }
  });
}

// ==========================
// Initialization
// ==========================
populateCategories();
attachEventListeners();

// ==========================
// Self-checks / Runtime tests
// These run immediately to confirm:
// 1) addQuote function exists
// 2) addQuote adds to quotes array and updates DOM elements
// 3) Show New Quote button causes quoteDisplay to change when clicked
// ==========================
(function runSelfChecks() {
  try {
    console.group("script.js self-checks");

    // 1) check addQuote exists
    console.assert(typeof addQuote === "function", "addQuote should be a function.");

    // 2) Test adding a quote programmatically
    const initialLength = quotes.length;
    // prepare test inputs
    if (newQuoteText && newQuoteCategory) {
      newQuoteText.value = "TEST QUOTE - unit test";
      newQuoteCategory.value = "UnitTestCategory";

      const addResult = addQuote();
      console.assert(addResult === true, "addQuote should return true on success.");
      console.assert(quotes.length === initialLength + 1, "quotes array should grow by 1 after addQuote.");

      // last quote should match what we added
      const last = quotes[quotes.length - 1];
      console.assert(last.text === "TEST QUOTE - unit test" && last.category === "UnitTestCategory",
        "Last quote in quotes array should match the test quote.");

      // category dropdown should include the new category
      const foundInSelect = Array.from(categorySelect.options).some(
        opt => opt.value.toLowerCase() === "unittestcategory".toLowerCase()
      );
      console.assert(foundInSelect, "New category should be added to the categorySelect dropdown.");

      // quoteDisplay should have success message after addQuote
      console.assert(quoteDisplay.innerHTML.includes("Quote added successfully"), "quoteDisplay should show a success message after adding.");

    } else {
      console.warn("Skipping programmatic addQuote test because input elements are missing.");
    }

    // 3) Test Show New Quote button triggers showRandomQuote-like change
    if (newQuoteBtn && quoteDisplay) {
      // set quoteDisplay to sentinel, set category to all so showRandomQuote can pick any
      const sentinel = "SENTINEL_BEFORE_CLICK";
      quoteDisplay.textContent = sentinel;
      if (categorySelect) categorySelect.value = "all";

      // simulate click
      newQuoteBtn.click();

      // After click, quoteDisplay should no longer equal sentinel (since showRandomQuote writes innerHTML)
      const changed = quoteDisplay.textContent !== sentinel;
      console.assert(changed, '"Show New Quote" button click should change the quoteDisplay content.');

    } else {
      console.warn("Skipping 'Show New Quote' click test because elements are missing.");
    }

    console.groupEnd();
  } catch (err) {
    console.error("Error during self-checks:", err);
  }
})();

// ==========================
// End of script.js
// ==========================
