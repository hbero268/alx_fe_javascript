// script.js - Dynamic Quote Generator with Filtering System

document.addEventListener('DOMContentLoaded', () => {
  const LS_KEY_QUOTES = 'dqg_quotes';
  const LS_KEY_FILTER = 'dqg_lastFilter';
  const SS_KEY_LAST_QUOTE = 'dqg_lastQuote';

  const quoteDisplay = document.getElementById('quoteDisplay');
  const newQuoteBtn = document.getElementById('newQuote');
  const addQuoteBtn = document.getElementById('addQuoteBtn');
  const newQuoteText = document.getElementById('newQuoteText');
  const newQuoteCategory = document.getElementById('newQuoteCategory');
  const categoryFilter = document.getElementById('categoryFilter');
  const exportJsonBtn = document.getElementById('exportJsonBtn');
  const importFileInput = document.getElementById('importFile');
  const clearStorageBtn = document.getElementById('clearStorageBtn');
  const messageEl = document.getElementById('message');

  let quotes = [];

  const SEED_QUOTES = [
    { text: "The best way to get started is to quit talking and begin doing.", category: "Motivation" },
    { text: "Life is what happens when you're busy making other plans.", category: "Life" },
    { text: "Success is not final, failure is not fatal; it is the courage to continue that counts.", category: "Success" }
  ];

  function escapeHtml(unsafe) {
    return String(unsafe)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }

  function showMessage(text, type = 'info') {
    const color = type === 'error' ? 'crimson' : type === 'success' ? 'green' : '#444';
    messageEl.style.color = color;
    messageEl.textContent = text;
  }

  // ===== Load/Save Quotes =====
  function saveQuotes() {
    localStorage.setItem(LS_KEY_QUOTES, JSON.stringify(quotes));
  }

  function loadQuotes() {
    const stored = localStorage.getItem(LS_KEY_QUOTES);
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

  // ===== Populate categories dynamically =====
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

    // restore last selected filter
    const lastFilter = localStorage.getItem(LS_KEY_FILTER);
    if (lastFilter && [...categoryFilter.options].some(o => o.value === lastFilter)) {
      categoryFilter.value = lastFilter;
    }
  }

  // ===== Filter and show quotes based on category =====
  function filterQuotes() {
    const selectedCategory = categoryFilter.value;
    localStorage.setItem(LS_KEY_FILTER, selectedCategory); // remember selection

    const filteredQuotes =
      selectedCategory === 'all'
        ? quotes
        : quotes.filter(q => q.category === selectedCategory);

    if (filteredQuotes.length === 0) {
      quoteDisplay.innerHTML = `<em>No quotes available for this category.</em>`;
      showMessage('No quotes found for selected category.', 'error');
      return;
    }

    // Show first quote from filtered list
    const q = filteredQuotes[Math.floor(Math.random() * filteredQuotes.length)];
    quoteDisplay.innerHTML = `
      <p>"${escapeHtml(q.text)}"</p>
      <small>— <strong>${escapeHtml(q.category)}</strong></small>
    `;

    sessionStorage.setItem(SS_KEY_LAST_QUOTE, JSON.stringify(q));
    showMessage(`Showing quote from "${q.category}" category.`, 'info');
  }

  // ===== Add new quote =====
  function addQuote() {
    const text = newQuoteText.value.trim();
    const category = newQuoteCategory.value.trim();
    if (!text || !category) {
      showMessage('Please enter both quote text and category.', 'error');
      return;
    }

    quotes.push({ text, category });
    saveQuotes();
    populateCategories(); // refresh dropdown

    newQuoteText.value = '';
    newQuoteCategory.value = '';
    showMessage('✅ Quote added successfully!', 'success');
    filterQuotes(); // refresh display based on current filter
  }

  // ===== Show random quote (button click) =====
  function showRandomQuote() {
    filterQuotes();
  }

  // ===== Export quotes as JSON =====
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

  // ===== Import from JSON =====
  function importFromJsonFile(file) {
    const reader = new FileReader();
    reader.onload = e => {
      try {
        const imported = JSON.parse(e.target.result);
        if (!Array.isArray(imported)) throw new Error('Invalid file format');
        imported.forEach(item => {
          if (item.text && item.category) {
            quotes.push(item);
          }
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

  // ===== Clear storage =====
  function clearStoredQuotes() {
    if (!confirm('This will clear all saved quotes and filters. Continue?')) return;
    localStorage.removeItem(LS_KEY_QUOTES);
    localStorage.removeItem(LS_KEY_FILTER);
    loadQuotes();
    populateCategories();
    quoteDisplay.innerHTML = 'Storage cleared. Click "Show New Quote"';
    showMessage('Local storage cleared.', 'success');
  }

  // ===== Initialize =====
  function init() {
    loadQuotes();
    populateCategories();

    // restore last selected filter automatically
    filterQuotes();

    // wire events
    newQuoteBtn.addEventListener('click', showRandomQuote);
    addQuoteBtn.addEventListener('click', addQuote);
    exportJsonBtn.addEventListener('click', exportQuotesAsJson);
    importFileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) importFromJsonFile(file);
      importFileInput.value = '';
    });
    clearStorageBtn.addEventListener('click', clearStoredQuotes);
  }

  init();

  // expose filterQuotes for HTML onchange
  window.filterQuotes = filterQuotes;
});
