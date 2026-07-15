document.addEventListener('DOMContentLoaded', async () => {
  const form = document.getElementById('tracker-form');
  const companyInput = document.getElementById('companyName');
  const roleInput = document.getElementById('role');
  const salaryInput = document.getElementById('salary');
  const urlInput = document.getElementById('jobUrl');
  const notesInput = document.getElementById('notes');
  const statusPanel = document.getElementById('status-panel');
  const submitBtn = document.getElementById('submit-btn');
  const exportBtn = document.getElementById('export-btn');

  let activeToken = '';

  // 1. Show message helper
  const showStatus = (msg, type) => {
    statusPanel.innerText = msg;
    statusPanel.className = `status ${type}`;
  };

  // 2. Fetch JWT cookie from backend localhost
  const getAuthToken = () => {
    return new Promise((resolve) => {
      chrome.cookies.get({ url: 'http://localhost', name: 'jwt' }, (cookie) => {
        if (cookie && cookie.value) {
          resolve(cookie.value);
        } else {
          chrome.cookies.get({ url: 'http://127.0.0.1', name: 'jwt' }, (cookie2) => {
            resolve(cookie2 ? cookie2.value : null);
          });
        }
      });
    });
  };

  // 3. Initialize popup by parsing the active tab details
  try {
    activeToken = await getAuthToken();
    if (!activeToken) {
      showStatus('Not Authenticated. Please log in to CareerVault first on http://localhost:5173', 'error');
      submitBtn.disabled = true;
      exportBtn.disabled = true;
    }

    // Capture tab details
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs.length === 0) return;
      const tab = tabs[0];
      
      urlInput.value = tab.url || '';

      // Extract Company and Role from Title metadata
      const title = tab.title || '';
      let company = '';
      let role = '';

      if (title.includes(' at ')) {
        const parts = title.split(' at ');
        role = parts[0].trim();
        company = parts[1].split('|')[0].split('-')[0].trim();
      } else if (title.includes(' hiring ')) {
        const parts = title.split(' hiring ');
        company = parts[0].trim();
        role = parts[1].split('|')[0].split('-')[0].trim();
      } else {
        company = title.split('|')[0].split('-')[0].trim();
      }

      companyInput.value = company.substring(0, 50);
      roleInput.value = role ? role.substring(0, 50) : '';
    });
  } catch (err) {
    showStatus('Failed to load extension context: ' + err.message, 'error');
  }

  // 4. Handle Save Form Submission
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    showStatus('', '');
    submitBtn.disabled = true;
    submitBtn.innerText = 'Saving...';

    const payload = {
      companyName: companyInput.value,
      role: roleInput.value,
      salary: salaryInput.value ? Number(salaryInput.value) : null,
      jobDescriptionUrl: urlInput.value,
      notes: notesInput.value,
      status: 'Applied'
    };

    try {
      const response = await fetch('http://localhost:5000/api/applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${activeToken}`
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Server error. Failed to track.');
      }

      showStatus('Application tracked successfully in CareerVault!', 'success');
      submitBtn.innerText = 'Saved!';
      setTimeout(() => window.close(), 1500); // Close popup automatically
    } catch (err) {
      showStatus(err.message, 'error');
      submitBtn.disabled = false;
      submitBtn.innerText = 'Save Application';
    }
  });

  // 5. Handle Excel / CSV Export
  exportBtn.addEventListener('click', async () => {
    showStatus('', '');
    exportBtn.disabled = true;
    exportBtn.innerText = 'Exporting...';

    try {
      const response = await fetch('http://localhost:5000/api/applications', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${activeToken}`
        }
      });

      const apps = await response.json();

      if (!response.ok) {
        throw new Error(apps.message || 'Failed to fetch application records.');
      }

      if (apps.length === 0) {
        showStatus('No applications tracked yet to export!', 'error');
        exportBtn.disabled = false;
        exportBtn.innerText = 'Export All to Excel (CSV)';
        return;
      }

      // Format as comma-separated values (CSV)
      const headers = ['Company Name', 'Job Role', 'Status', 'Salary (LPA)', 'Job URL', 'Notes', 'Applied Date'];
      const rows = apps.map(app => [
        `"${(app.companyName || '').replace(/"/g, '""')}"`,
        `"${(app.role || '').replace(/"/g, '""')}"`,
        `"${(app.status || '')}"`,
        app.salary || 'N/A',
        `"${(app.jobDescriptionUrl || '').replace(/"/g, '""')}"`,
        `"${(app.notes || '').replace(/"/g, '""').replace(/[\r\n]+/g, ' ')}"`,
        `"${app.appliedDate ? new Date(app.appliedDate).toLocaleDateString() : ''}"`
      ]);

      const csvContent = [
        headers.join(','),
        ...rows.map(r => r.join(','))
      ].join('\n');

      // Convert CSV string with UTF-8 BOM to Data URL and download via Chrome Extension API
      const blob = new Blob(["\ufeff", csvContent], { type: 'text/csv;charset=utf-8;' });
      const reader = new FileReader();
      
      reader.onload = function(event) {
        chrome.downloads.download({
          url: event.target.result,
          filename: 'careervault_placement_tracker.csv',
          saveAs: false // Download silently directly to the Downloads folder
        }, (downloadId) => {
          if (chrome.runtime.lastError) {
            showStatus('Download failed: ' + chrome.runtime.lastError.message, 'error');
          } else {
            showStatus('Excel/CSV downloaded to Downloads folder!', 'success');
          }
        });
      };
      
      reader.readAsDataURL(blob);
    } catch (err) {
      showStatus('Export failed: ' + err.message, 'error');
    } finally {
      exportBtn.disabled = false;
      exportBtn.innerText = 'Export All to Excel (CSV)';
    }
  });
});
