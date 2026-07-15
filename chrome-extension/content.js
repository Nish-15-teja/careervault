console.log('CareerVault Dynamic DOM Scraper loaded!');

// Helper: Scans inputs by traversing DOM labels and aria-attributes
const findInputByKeywords = (keywords) => {
  const inputs = document.querySelectorAll('input, textarea');
  
  for (let input of inputs) {
    // 1. Audit aria-label directly
    const ariaLabel = (input.getAttribute('aria-label') || '').toLowerCase();
    if (keywords.some(kw => ariaLabel.includes(kw))) {
      return input.value;
    }

    // 2. Audit parent container text (Google Forms wraps question text inside parent containers)
    let parent = input.parentElement;
    let depth = 0;
    while (parent && depth < 5) {
      const text = (parent.textContent || '').toLowerCase();
      // Ensure the label is close to the input
      if (keywords.some(kw => text.includes(kw)) && text.length < 150) {
        return input.value;
      }
      parent = parent.parentElement;
      depth++;
    }
  }
  return '';
};

// Listen globally for form submissions on placement pages
document.addEventListener('submit', (e) => {
  console.log('Form submission intercepted! Extracting variables...');

  // Match inputs dynamically using keyword fuzzy grids
  const companyName = findInputByKeywords(['company', 'organization', 'employer']);
  const role = findInputByKeywords(['role', 'job title', 'designation', 'position', 'profile']);
  const salaryText = findInputByKeywords(['salary', 'ctc', 'package', 'stipend', 'lpa']);
  const notes = findInputByKeywords(['notes', 'comment', 'other details', 'description', 'remarks']);

  // Convert salary text to standard number values if present
  let salary = null;
  if (salaryText) {
    const parsed = Number(salaryText.replace(/[^0-9.]/g, ''));
    if (!isNaN(parsed) && parsed > 0) {
      salary = parsed;
    }
  }

  // Verify we extracted at least the company name to create a valid tracker
  if (companyName) {
    chrome.runtime.sendMessage({
      action: 'track_campus_drive',
      payload: {
        companyName,
        role: role || 'Campus Applicant',
        salary,
        jobDescriptionUrl: window.location.href,
        notes: notes ? `Campus Drive Scraped: ${notes}` : 'Auto-scraped from Google Placement Form.'
      }
    });
  } else {
    console.warn('Campus Drive sync skipped: Could not parse Company Name from form DOM.');
  }
});
