// script.js
// Dynamic Quote Generator with localStorage, sessionStorage, import/export JSON
// Key localStorage: 'dqg_quotes'
// Key sessionStorage: 'dqg_lastQuote'

// Wrap in DOMContentLoaded to be safe
document.addEventListener('DOMContentLoaded', () => {
  // ======= Initial seed quotes (used only if no localStorage present) =======
  const SEED_QUOTES = [
    { text: "The best way to get started is to quit talking and begin doing.", category: "Motivation" },
    { text: "Life is what happens when you're busy making other plans.", category: "Life" },
    { text: "Success is not final, failure is not fatal; it is the courage to continue that counts.", category: "Success" }
  ];

  // ======= DOM elements =======
  const quoteDisplay = document.getElementById('quoteDisplay');
  const newQuoteBtn = document.getElementById('newQuote');
  const addQuoteBtn = document.getElementById('addQuoteBtn');
  const newQuoteText = document.getElementById('newQuoteText');
  const newQuoteCategory = document.getElementById('newQuoteCategory');
  const categorySelect = document.getElementById('categorySelect');
  const messageEl = document.getElementById('message');
  const exportJsonBtn = document.getElementById('exportJsonBtn');
  const importFileInput = document.getElementById('importFile');
  const clearStorageBtn = document.getElementById('clearStorageBtn');

  // ======= Storage keys =======
  const LS_KEY = 'dqg_quotes';
  const SS_KEY = 'dqg_lastQuote';

  // ======= In-memory quotes array =======
  let quotes = [];

  // ======= Helpers =======
  function escapeHtml(unsafe) {
    return String(unsafe)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }

  function showMessage(text, type = 'info') {
    // type: 'info' | 'success' | 'error'
    const color = type === 'error' ? 'crimson' : type === 'success' ? 'green' : '#444';
    messageEl.style.color = color;
    messageEl.textContent = text;
  }

  // ======= localStorage functions =======
  function saveQuotesToLocalStorage() {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(quotes));
      showMessage('Quotes saved locally.', 'success');
    } catch (err) {
      console.error('Failed to save quotes to localStorage', err);
      showMessage('Failed to save quotes to localStorage.', 'error');
    }
  }

  function loadQuotesFromLocalStorage() {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (!raw) {
        quotes = [...SEED_QUOTES];
        saveQuotesToLocalStorage(); // seed once
        return;
      }
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        // validate items minimally: must have text & category strings
        quotes = parsed.filter(item => item && typeof item.text === 'string' && typeof item.category === 'string');
      } else {
        quotes = [...SEED_QUOTES];
      }
    } catch (err) {
      console.error('Failed to load quotes from localStorage', err);
      quotes = [...SEED_QUOTES];
    }
  }

  // ======= sessionStorage (store last shown quote) =======
  function saveLastQuoteToSession(quoteObj) {
    try {
      sessionStorage.setItem(SS_KEY, JSON.stringify(quoteObj));
    } catch (err) {
      console.warn('Could not save to sessionStorage', err);
    }
  }
  function loadLastQuoteFromSession() {
    try {
      const raw = sessionStorage.getItem(SS_KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  // ======= Populate category select =======
  function populateCategories() {
    // Clear except keep "all"
    categorySelect.innerHTML = '';
    const allOpt = document.createElement('option');
    allOpt.value = 'all';
    allOpt.textContent = 'All';
    categorySelect.appendChild(allOpt);

    const categories = [...new Set(quotes.map(q => q.category))];
    categories.forEach(cat => {
      const opt = document.createElement('option');
      opt.value = cat;
      opt.textContent = cat;
      categorySelect.appendChild(opt);
    });
  }

  // ======= Show random quote (uses innerHTML) =======
  function showRandomQuote() {
    const selectedCategory = categorySelect.value || 'all';
    let pool = quotes;
    if (selectedCategory !== 'all') {
      pool = quotes.filter(q => q.category.toLowerCase() === selectedCategory.toLowerCase());
    }

    if (!pool.length) {
      quoteDisplay.innerHTML = `<em>No quotes available for this category.</em>`;
      showMessage('No quotes found for the selected category.', 'error');
      return;
    }

    const idx = Math.floor(Math.random() * pool.length);
    const quote = pool[idx];

    quoteDisplay.innerHTML = `
      <p>"${escapeHtml(quote.text)}"</p>
      <small>— <strong>${escapeHtml(quote.category)}</strong></small>
    `;

    // Save last shown quote to session storage
    saveLastQuoteToSession(quote);
    showMessage('Displayed a new quote.', 'info');
  }

  // ======= addQuote: adds to quotes array, updates DOM and saves =======
  function addQuote() {
    const text = newQuoteText.value.trim();
    const category = newQuoteCategory.value.trim();

    if (!text || !category) {
      showMessage('Please enter both quote text and category.', 'error');
      return false;
    }

    // Add to array
    const newObj = { text, category };
    quotes.push(newObj);

    // Save to localStorage
    saveQuotesToLocalStorage();

    // Update category select if needed
    const exists = Array.from(categorySelect.options).some(opt => opt.value.toLowerCase() === category.toLowerCase());
    if (!exists) {
      const opt = document.createElement('option');
      opt.value = category;
      opt.textContent = category;
      categorySelect.appendChild(opt);
    }

    // Clear inputs
    newQuoteText.value = '';
    newQuoteCategory.value = '';

    // Show success in DOM and optionally show the added quote
    quoteDisplay.innerHTML = `
      <p>"${escapeHtml(newObj.text)}"</p>
      <small>— <strong>${escapeHtml(newObj.category)}</strong></small>
    `;
    saveLastQuoteToSession(newObj);
    showMessage('✅ Quote added and saved locally.', 'success');
    return true;
  }

  // ======= Export to JSON (download) =======
  function exportQuotesAsJson() {
    try {
      const dataStr = JSON.stringify(quotes, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = `quotes_${new Date().toISOString().slice(0,19).replace(/[:T]/g,'-')}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      showMessage('Export started. Check your downloads.', 'success');
    } catch (err) {
      console.error('Export failed', err);
      showMessage('Export failed.', 'error');
    }
  }

  // ======= Import from uploaded JSON file =======
  function importFromJsonFile(file) {
    if (!file) {
      showMessage('No file selected.', 'error');
      return;
    }
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const parsed = JSON.parse(evt.target.result);
        if (!Array.isArray(parsed)) throw new Error('JSON root must be an array');

        // Validate items (must be objects with string text & category)
        const cleaned = parsed.filter(item =>
          item && typeof item.text === 'string' && typeof item.category === 'string'
        ).map(item => ({ text: item.text.trim(), category: item.category.trim() }));

        if (!cleaned.length) {
          showMessage('No valid quotes found in file.', 'error');
          return;
        }

        // Optional: merge without duplicates (simple duplicate check by exact text+category)
        const existingSet = new Set(quotes.map(q => `${q.text}___${q.category}`));
        let addedCount = 0;
        cleaned.forEach(item => {
          const key = `${item.text}___${item.category}`;
          if (!existingSet.has(key)) {
            quotes.push(item);
            existingSet.add(key);
            addedCount++;
          }
        });

        saveQuotesToLocalStorage();
        populateCategories();
        showMessage(`Imported ${addedCount} new quote(s).`, 'success');
      } catch (err) {
        console.error('Import error', err);
        showMessage('Failed to import JSON file. Ensure it contains an array of {text, category}.', 'error');
        alert('Import failed: ' + (err.message || 'invalid JSON'));
      }
    };
    reader.readAsText(file);
  }

  // ======= Clear stored quotes & reset to seed =======
  function clearStoredQuotes() {
    if (!confirm('This will clear stored quotes and reset to defaults. Continue?')) return;
    localStorage.removeItem(LS_KEY);
    loadQuotesFromLocalStorage();
    populateCategories();
    quoteDisplay.innerHTML = 'Storage cleared. Showing seed content. Click "Show New Quote".';
    showMessage('Local storage cleared. Seed quotes restored.', 'success');
  }

  // ======= Initializer =======
  function init() {
    loadQuotesFromLocalStorage();
    populateCategories();

    // Restore last shown quote from session storage if present
    const last = loadLastQuoteFromSession();
    if (last && last.text && last.category) {
      quoteDisplay.innerHTML = `
        <p>"${escapeHtml(last.text)}"</p>
        <small>— <strong>${escapeHtml(last.category)}</strong> <span class="small">(last viewed this session)</span></small>
      `;
      showMessage('Restored last quote from this session.', 'info');
    } else {
      quoteDisplay.innerHTML = 'Click “Show New Quote” to get inspired!';
      showMessage('Ready.', 'info');
    }

    // Wire events
    newQuoteBtn.addEventListener('click', showRandomQuote);
    addQuoteBtn.addEventListener('click', addQuote);
    exportJsonBtn.addEventListener('click', exportQuotesAsJson);
    importFileInput.addEventListener('change', (e) => {
      const f = e.target.files && e.target.files[0];
      if (f) importFromJsonFile(f);
      // clear input to allow re-importing the same file later if needed
      importFileInput.value = '';
    });
    clearStorageBtn.addEventListener('click', clearStoredQuotes);

    // Allow Enter key to submit addQuote when focused in inputs
    [newQuoteText, newQuoteCategory].forEach(inp => {
      inp.addEventListener('keyup', (e) => { if (e.key === 'Enter') addQuote(); });
    });

    // Self-check console logs (non-blocking)
    console.log('Dynamic Quote Generator initialized. Quotes count:', quotes.length);
  }

  // Run initializer
  init();

  // Expose some functions for debugging in console (optional)
  window.__DQG = {
    showRandomQuote, addQuote, exportQuotesAsJson, importFromJsonFile, getQuotes: () => quotes
  };
});
