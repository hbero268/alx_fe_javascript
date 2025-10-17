// ===== Dynamic Quote Generator Script =====

const quoteDisplay = document.getElementById('quoteDisplay');
const categoryFilter = document.getElementById('categoryFilter');
const newQuoteBtn = document.getElementById('newQuote');
const addQuoteBtn = document.getElementById('addQuoteBtn');
const newQuoteText = document.getElementById('newQuoteText');
const newQuoteCategory = document.getElementById('newQuoteCategory');
const exportJsonBtn = document.getElementById('exportJsonBtn');
const importFileInput = document.getElementById('importFile');
const clearStorageBtn = document.getElementById('clearStorageBtn');
const messageEl = document.getElementById('message');

let quotes = [];

// ===== Default Seed Quotes =====
const SEED_QUOTES = [
  { text: "The best way to get started is to quit talking and begin doing.", category: "Motivation" },
  { text: "Life is what happens when you're busy making other plans.", category: "Life" },
  { text: "Success is not final, failure is not fatal; it is the courage to continue that counts.", category: "Success" }
];

// ===== Helper Functions =====
function showMessage(text, type = 'info') {
  const color = type === 'error' ? 'crimson' : type === 'success' ? 'green' : '#444';
  messageEl.style.color = color;
  messageEl.textContent = text;
}

function saveQuotes() {
  localStorage.setItem('quotes', JSON.stringify(quotes));
}

function loadQuotes() {
  const stored = localStorage.getItem('quotes');
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) {
        quotes = parsed;
        return;
      }
    } catch {}
  }
  quotes = [...SEED_QUOTES];
  saveQuotes();
}

function escapeHtml(unsafe) {
  return String(unsafe)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

// ===== Populate Categories Dropdown =====
function populateCategories() {
  categoryFilter.innerHTML = '';
  const allOption = document.createElement('option');
  allOption.value = 'all';
  allOption.textContent = 'All Categories';
  categoryFilter.appendChild(allOption);

  const uniqueCategories = [...new Set(quotes.map(q => q.category))];
  uniqueCategories.forEach(cat => {
    const opt = document.createElement('option');
    opt.value = cat;
    opt.textContent = cat;
    categoryFilter.appendChild(opt);
  });

  // Restore last selected category
  const lastFilter = localStorage.getItem('lastSelectedCategory');
  if (lastFilter && [...categoryFilter.options].some(o => o.value === lastFilter)) {
    categoryFilter.value = lastFilter;
  }
}

// ===== Filter and Display Quotes =====
function filterQuotes() {
  const selectedCategory = categoryFilter.value;
  localStorage.setItem('lastSelectedCategory', selectedCategory);

  const filtered = selectedCategory === 'all'
    ? quotes
    : quotes.filter(q => q.category === selectedCategory);

  if (filtered.length === 0) {
    quoteDisplay.innerHTML = '<em>No quotes available for this category.</em>';
    showMessage('No quotes found for selected category.', 'error');
    return;
  }

  const q = filtered[Math.floor(Math.random() * filtered.length)];
  quoteDisplay.innerHTML = `
    <p>"${escapeHtml(q.text)}"</p>
    <small>— <strong>${escapeHtml(q.category)}</strong></small>
  `;
  showMessage(`Showing quote from "${q.category}" category.`, 'info');
}

// ===== Add New Quote =====
function addQuote() {
  const text = newQuoteText.value.trim();
  const category = newQuoteCategory.value.trim();

  if (!text || !category) {
    showMessage('Please enter both quote and category.', 'error');
    return;
  }

  quotes.push({ text, category });
  saveQuotes();
  populateCategories();
  filterQuotes();

  newQuoteText.value = '';
  newQuoteCategory.value = '';
  showMessage('✅ Quote added successfully!', 'success');
}

// ===== Export Quotes as JSON =====
function exportQuotesAsJson() {
  const dataStr = JSON.stringify(quotes, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'quotes.json';
  a.click();
  URL.revokeObjectURL(url);
  showMessage('Export started.', 'success');
}

// ===== Import Quotes from JSON File =====
function importFromJsonFile(file) {
  const reader = new FileReader();
  reader.onload = e => {
    try {
      const imported = JSON.parse(e.target.result);
      if (!Array.isArray(imported)) throw new Error('Invalid file format');
      imported.forEach(item => {
        if (item.text && item.category) quotes.push(item);
      });
      saveQuotes();
      populateCategories();
      filterQuotes();
      showMessage('Quotes imported successfully.', 'success');
    } catch (err) {
      showMessage('Failed to import file.', 'error');
    }
  };
  reader.readAsText(file);
}

// ===== Clear Local Storage =====
function clearStoredQuotes() {
  if (!confirm('This will clear all stored quotes. Continue?')) return;
  localStorage.removeItem('quotes');
  localStorage.removeItem('lastSelectedCategory');
  loadQuotes();
  populateCategories();
  quoteDisplay.innerHTML = 'Storage cleared. Click "Show New Quote"';
  showMessage('Local storage cleared.', 'success');
}

// ===== Initialize App =====
function init() {
  loadQuotes();
  populateCategories();
  filterQuotes();

  newQuoteBtn.addEventListener('click', filterQuotes);
  addQuoteBtn.addEventListener('click', addQuote);
  exportJsonBtn.addEventListener('click', exportQuotesAsJson);
  importFileInput.addEventListener('change', e => {
    const file = e.target.files[0];
    if (file) importFromJsonFile(file);
    importFileInput.value = '';
  });
  clearStorageBtn.addEventListener('click', clearStoredQuotes);
  categoryFilter.addEventListener('change', filterQuotes);
}

window.onload = init;
