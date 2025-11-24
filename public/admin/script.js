const API_BASE = '/admin/api';

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    setupTabs();
    loadSmtpConfigs();
    loadLandingPages();
    loadEmailLogs();
});

// Tab Navigation
function setupTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tab = btn.dataset.tab;
            
            // Update buttons
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Update content
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            document.getElementById(`${tab}-tab`).classList.add('active');
            
            // Load data if needed
            if (tab === 'smtp') loadSmtpConfigs();
            else if (tab === 'landing') loadLandingPages();
            else if (tab === 'logs') loadEmailLogs();
        });
    });
}

// SMTP Configs
async function loadSmtpConfigs() {
    try {
        const res = await fetch(`${API_BASE}/smtp-configs`);
        const data = await res.json();
        
        if (data.success) {
            renderSmtpConfigs(data.data);
        }
    } catch (error) {
        console.error('Error loading SMTP configs:', error);
        showNotification('Error loading SMTP configs', 'error');
    }
}

function renderSmtpConfigs(configs) {
    const container = document.getElementById('smtp-list');
    
    if (configs.length === 0) {
        container.innerHTML = '<div class="empty-state"><h3>No SMTP configs found</h3><p>Add your first SMTP configuration to get started</p></div>';
        return;
    }
    
    container.innerHTML = configs.map(config => {
        const configId = String(config.id || config._id || '');
        return `
        <div class="card">
            <div class="card-header">
                <div class="card-title">${config.name}</div>
                <span class="badge ${config.is_active ? 'badge-active' : 'badge-inactive'}">
                    ${config.is_active ? 'Active' : 'Inactive'}
                </span>
            </div>
            <div class="card-info">
                <strong>Provider:</strong> ${config.provider}
            </div>
            <div class="card-info">
                <strong>Host:</strong> ${config.host}:${config.port}
            </div>
            <div class="card-info">
                <strong>Username:</strong> ${config.username}
            </div>
            <div class="card-actions">
                <button class="btn btn-success btn-small" onclick="testSmtpConnectionById('${configId}')">Test</button>
                <button class="btn btn-primary btn-small" onclick="editSmtpConfig('${configId}')">Edit</button>
                <button class="btn btn-danger btn-small" onclick="deleteSmtpConfig('${configId}')">Delete</button>
            </div>
        </div>
    `;
    }).join('');
}

function openSmtpModal(id = null) {
    // Reset form first
    document.getElementById('smtp-form').reset();
    
    // Set modal title and test button visibility
    document.getElementById('smtp-modal-title').textContent = id ? 'Edit SMTP Configuration' : 'Add SMTP Configuration';
    document.getElementById('test-btn').style.display = id ? 'inline-block' : 'none';
    
    // Set ID AFTER reset to prevent it from being cleared
    document.getElementById('smtp-id').value = id || '';
    
    // Show modal
    document.getElementById('smtp-modal').style.display = 'block';
    
    // Load config data if editing
    if (id) {
        loadSmtpConfig(id);
    }
}

function editSmtpConfig(id) {
    if (!id || id === 'undefined' || id === 'null') {
        showNotification('Invalid SMTP config ID', 'error');
        console.error('Invalid SMTP config ID:', id);
        return;
    }
    openSmtpModal(id);
}

async function loadSmtpConfig(id) {
    try {
        // Show loading state
        const loadingText = document.getElementById('smtp-modal-title').textContent;
        document.getElementById('smtp-modal-title').textContent = 'Loading...';
        
        const res = await fetch(`${API_BASE}/smtp-configs/${id}`);
        const data = await res.json();
        
        if (data.success && data.data) {
            const config = data.data;
            
            // Populate form fields
            document.getElementById('smtp-name').value = config.name || '';
            document.getElementById('smtp-provider').value = config.provider || 'custom';
            document.getElementById('smtp-host').value = config.host || '';
            document.getElementById('smtp-port').value = config.port || 587;
            document.getElementById('smtp-secure').checked = config.secure || false;
            document.getElementById('smtp-username').value = config.username || '';
            // Password field left empty for security - user must enter new password to change
            document.getElementById('smtp-password').value = '';
            document.getElementById('smtp-password').placeholder = 'Leave empty to keep current password';
            
            // Restore title
            document.getElementById('smtp-modal-title').textContent = 'Edit SMTP Configuration';
        } else {
            document.getElementById('smtp-modal-title').textContent = 'Edit SMTP Configuration';
            showNotification('Failed to load SMTP config data', 'error');
        }
    } catch (error) {
        console.error('Error loading SMTP config:', error);
        document.getElementById('smtp-modal-title').textContent = 'Edit SMTP Configuration';
        showNotification('Error loading SMTP config: ' + (error.message || 'Unknown error'), 'error');
    }
}

async function saveSmtpConfig(event) {
    event.preventDefault();
    
    const id = document.getElementById('smtp-id').value;
    const isEdit = id && id.trim() !== '';
    
    // Validate required fields
    const name = document.getElementById('smtp-name').value.trim();
    const host = document.getElementById('smtp-host').value.trim();
    const username = document.getElementById('smtp-username').value.trim();
    const port = parseInt(document.getElementById('smtp-port').value);
    const password = document.getElementById('smtp-password').value;
    
    if (!name || !host || !username || !port) {
        showNotification('Please fill in all required fields', 'error');
        return;
    }
    
    const data = {
        name: name,
        provider: document.getElementById('smtp-provider').value || 'custom',
        host: host,
        port: port,
        secure: document.getElementById('smtp-secure').checked || false,
        username: username,
    };
    
    // Only include password if provided (for updates, empty means don't change)
    if (password && password.trim() !== '') {
        data.password = password;
    }
    
    // For new configs, password is required
    if (!isEdit && (!password || password.trim() === '')) {
        showNotification('Password is required for new SMTP config', 'error');
        return;
    }
    
    try {
        const url = isEdit ? `${API_BASE}/smtp-configs/${id}` : `${API_BASE}/smtp-configs`;
        const method = isEdit ? 'PUT' : 'POST';
        
        const res = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        
        const result = await res.json();
        
        if (result.success) {
            showNotification(result.message || (isEdit ? 'SMTP config updated successfully' : 'SMTP config created successfully'), 'success');
            closeModal('smtp-modal');
            loadSmtpConfigs();
        } else {
            const errorMsg = result.message || result.errors?.[0]?.msg || 'Failed to save';
            showNotification(errorMsg, 'error');
        }
    } catch (error) {
        console.error('Error saving SMTP config:', error);
        showNotification('Error saving SMTP config: ' + (error.message || 'Please check your connection'), 'error');
    }
}

async function deleteSmtpConfig(id) {
    if (!id || id === 'undefined' || id === 'null') {
        showNotification('Invalid SMTP config ID', 'error');
        console.error('Invalid SMTP config ID:', id);
        return;
    }
    
    if (!confirm('Are you sure you want to delete this SMTP config?')) return;
    
    try {
        const res = await fetch(`${API_BASE}/smtp-configs/${id}`, { 
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' }
        });
        
        const result = await res.json();
        
        if (result.success) {
            showNotification('SMTP config deleted successfully', 'success');
            loadSmtpConfigs();
        } else {
            showNotification(result.message || 'Failed to delete SMTP config', 'error');
        }
    } catch (error) {
        console.error('Error deleting SMTP config:', error);
        showNotification('Error deleting SMTP config. Please try again.', 'error');
    }
}

async function testSmtpConnection() {
    const id = document.getElementById('smtp-id').value;
    if (!id) {
        showNotification('Please save the config first', 'error');
        return;
    }
    await testSmtpConnectionById(id);
}

async function testSmtpConnectionById(id) {
    try {
        showNotification('Testing connection...', 'info');
        const res = await fetch(`${API_BASE}/smtp-configs/${id}/test`, { method: 'POST' });
        const result = await res.json();
        
        if (result.success) {
            showNotification('Connection successful!', 'success');
        } else {
            showNotification(result.message || 'Connection failed', 'error');
        }
    } catch (error) {
        showNotification('Error testing connection', 'error');
    }
}

function updateSmtpDefaults() {
    const provider = document.getElementById('smtp-provider').value;
    const defaults = {
        gmail: { host: 'smtp.gmail.com', port: 587, secure: false },
        sendgrid: { host: 'smtp.sendgrid.net', port: 587, secure: false },
        ses: { host: 'email-smtp.us-east-1.amazonaws.com', port: 587, secure: false },
    };
    
    if (defaults[provider]) {
        document.getElementById('smtp-host').value = defaults[provider].host;
        document.getElementById('smtp-port').value = defaults[provider].port;
        document.getElementById('smtp-secure').checked = defaults[provider].secure;
    }
}

// Landing Pages
async function loadLandingPages() {
    try {
        const res = await fetch(`${API_BASE}/landing-pages`);
        const data = await res.json();
        
        if (data.success) {
            renderLandingPages(data.data);
        }
    } catch (error) {
        console.error('Error loading landing pages:', error);
        showNotification('Error loading landing pages', 'error');
    }
}

function renderLandingPages(pages) {
    const container = document.getElementById('landing-list');
    
    if (pages.length === 0) {
        container.innerHTML = '<div class="empty-state"><h3>No landing pages found</h3><p>Add your first landing page to get started</p></div>';
        return;
    }
    
    container.innerHTML = pages.map(page => {
        const config = page.LandingPageConfig;
        const pageId = String(page.id || page._id || '');
        const smtpConfig = config && config.smtp_config_id ? (config.smtp_config_id.name || (config.SmtpConfig && config.SmtpConfig.name)) : null;
        
        return `
            <div class="card">
                <div class="card-header">
                    <div class="card-title">${page.name}</div>
                    <span class="badge ${page.is_active ? 'badge-active' : 'badge-inactive'}">
                        ${page.is_active ? 'Active' : 'Inactive'}
                    </span>
                </div>
                <div class="card-info">
                    <strong>Identifier:</strong> <code>${page.identifier}</code>
                </div>
                ${config ? `
                    <div class="card-info">
                        <strong>SMTP:</strong> ${smtpConfig || 'N/A'}
                    </div>
                    <div class="card-info">
                        <strong>From:</strong> ${config.from_name} &lt;${config.from_email}&gt;
                    </div>
                    <div class="card-info">
                        <strong>To:</strong> ${config.to_email}
                    </div>
                ` : '<div class="card-info" style="color: #dc3545;"><strong>⚠ Not configured</strong></div>'}
                <div class="card-actions">
                    <button class="btn btn-primary btn-small" onclick="configureLandingPage('${pageId}')">
                        ${config ? 'Reconfigure' : 'Configure'}
                    </button>
                    <button class="btn btn-danger btn-small" onclick="deleteLandingPage('${pageId}')">
                        Delete
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

function openLandingPageModal() {
    document.getElementById('landing-form').reset();
    document.getElementById('landing-id').value = '';
    document.getElementById('landing-modal').style.display = 'block';
}

async function saveLandingPage(event) {
    event.preventDefault();
    
    const data = {
        name: document.getElementById('landing-name').value,
        identifier: document.getElementById('landing-identifier').value,
    };
    
    try {
        const res = await fetch(`${API_BASE}/landing-pages`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        
        const result = await res.json();
        
        if (result.success) {
            showNotification('Landing page created', 'success');
            closeModal('landing-modal');
            loadLandingPages();
        } else {
            showNotification(result.message || 'Failed to create', 'error');
        }
    } catch (error) {
        showNotification('Error creating landing page', 'error');
    }
}

async function configureLandingPage(landingId) {
    if (!landingId || landingId === 'undefined' || landingId === 'null') {
        showNotification('Invalid landing page ID', 'error');
        console.error('Invalid landing page ID:', landingId);
        return;
    }
    
    try {
        // Load landing page data to get existing config
        const pageRes = await fetch(`${API_BASE}/landing-pages`);
        const pageData = await pageRes.json();
        
        let existingConfig = null;
        if (pageData.success) {
            const page = pageData.data.find(p => {
                const pageId = String(p.id || p._id || '');
                const searchId = String(landingId || '');
                return pageId === searchId;
            });
            if (page && page.LandingPageConfig) {
                existingConfig = page.LandingPageConfig;
            }
        }
        
        // Load SMTP configs for dropdown
        const res = await fetch(`${API_BASE}/smtp-configs`);
        const data = await res.json();
        
        if (data.success) {
            const select = document.getElementById('config-smtp-id');
            select.innerHTML = '<option value="">Select SMTP Config</option>' +
                data.data.map(config => {
                    const configId = String(config.id || config._id || '');
                    return `<option value="${configId}">${config.name} (${config.provider})</option>`;
                }).join('');
            
            // Pre-select existing SMTP config if reconfiguring
            if (existingConfig && existingConfig.smtp_config_id) {
                const smtpIdObj = existingConfig.smtp_config_id;
                const smtpId = String(smtpIdObj.id || smtpIdObj._id || smtpIdObj);
                select.value = smtpId;
            }
        }
        
        // Populate form with existing config if reconfiguring
        if (existingConfig) {
            document.getElementById('config-from-email').value = existingConfig.from_email || '';
            document.getElementById('config-from-name').value = existingConfig.from_name || '';
            document.getElementById('config-reply-to').value = existingConfig.reply_to_email || '';
            document.getElementById('config-to-email').value = existingConfig.to_email || '';
            document.getElementById('config-subject').value = existingConfig.subject_template || 'New Inquiry from {{landingPageName}}';
        } else {
            // Reset form for new configuration
            document.getElementById('config-from-email').value = '';
            document.getElementById('config-from-name').value = '';
            document.getElementById('config-reply-to').value = '';
            document.getElementById('config-to-email').value = '';
            document.getElementById('config-subject').value = 'New Inquiry from {{landingPageName}}';
            document.getElementById('config-smtp-id').value = '';
        }
        
        document.getElementById('config-landing-id').value = landingId;
        document.getElementById('landing-config-modal').style.display = 'block';
    } catch (error) {
        console.error('Error loading configuration data:', error);
        showNotification('Error loading configuration data', 'error');
    }
}

async function deleteLandingPage(id) {
    if (!id || id === 'undefined' || id === 'null') {
        showNotification('Invalid landing page ID', 'error');
        console.error('Invalid landing page ID:', id);
        return;
    }
    
    if (!confirm('Are you sure you want to delete this landing page? This will also delete its configuration.')) {
        return;
    }
    
    try {
        const res = await fetch(`${API_BASE}/landing-pages/${id}`, { 
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' }
        });
        
        const result = await res.json();
        
        if (result.success) {
            showNotification('Landing page deleted successfully', 'success');
            loadLandingPages();
        } else {
            showNotification(result.message || 'Failed to delete landing page', 'error');
        }
    } catch (error) {
        console.error('Error deleting landing page:', error);
        showNotification('Error deleting landing page. Please try again.', 'error');
    }
}

async function saveLandingPageConfig(event) {
    event.preventDefault();
    
    const landingId = document.getElementById('config-landing-id').value;
    const data = {
        smtp_config_id: document.getElementById('config-smtp-id').value, // MongoDB uses ObjectId strings, not integers
        from_email: document.getElementById('config-from-email').value,
        from_name: document.getElementById('config-from-name').value,
        reply_to_email: document.getElementById('config-reply-to').value || null,
        to_email: document.getElementById('config-to-email').value,
        subject_template: document.getElementById('config-subject').value || null,
    };
    
    try {
        const res = await fetch(`${API_BASE}/landing-pages/${landingId}/config`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        
        const result = await res.json();
        
        if (result.success) {
            showNotification('Landing page configured successfully', 'success');
            closeModal('landing-config-modal');
            loadLandingPages();
        } else {
            showNotification(result.message || 'Failed to configure', 'error');
        }
    } catch (error) {
        showNotification('Error configuring landing page', 'error');
    }
}

// Email Logs
async function loadEmailLogs() {
    try {
        const res = await fetch(`${API_BASE}/email-logs?limit=50`);
        const data = await res.json();
        
        if (data.success) {
            renderEmailLogs(data.data);
        }
    } catch (error) {
        console.error('Error loading email logs:', error);
        showNotification('Error loading email logs', 'error');
    }
}

function renderEmailLogs(logs) {
    const tbody = document.getElementById('logs-table-body');
    
    if (logs.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="empty-state">No email logs found</td></tr>';
        return;
    }
    
    tbody.innerHTML = logs.map(log => {
        // Use sent_at if available, otherwise use created_at
        const dateValue = log.sent_at || log.created_at;
        
        // Format date and time properly
        let dateDisplay = 'N/A';
        if (dateValue) {
            try {
                const date = new Date(dateValue);
                if (!isNaN(date.getTime())) {
                    // Format as: MM/DD/YYYY, HH:MM:SS AM/PM
                    dateDisplay = date.toLocaleString('en-US', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                        hour12: true
                    });
                }
            } catch (e) {
                console.error('Error formatting date:', e, dateValue);
                dateDisplay = dateValue ? String(dateValue) : 'N/A';
            }
        }
        
        const statusClass = `status-${log.status}`;
        const landingPageName = log.landing_page_id && log.landing_page_id.name 
            ? log.landing_page_id.name 
            : 'N/A';
        
        return `
            <tr>
                <td>${dateDisplay}</td>
                <td>${landingPageName}</td>
                <td>${log.recipient}</td>
                <td>${log.subject}</td>
                <td class="${statusClass}">${log.status}</td>
            </tr>
        `;
    }).join('');
}

// Modal Functions
function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

window.onclick = function(event) {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
};

// Notification
function showNotification(message, type = 'info') {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.className = `notification ${type}`;
    notification.style.display = 'block';
    
    setTimeout(() => {
        notification.style.display = 'none';
    }, 3000);
}

