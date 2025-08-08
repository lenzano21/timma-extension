let modal, backdrop;

// Listen for messages from the background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "openModal") {
        openModal();
    }
});

function createModal() {
    backdrop = document.createElement('div');
    backdrop.className = 'timma-modal-backdrop';
    document.body.appendChild(backdrop);

    modal = document.createElement('div');
    modal.className = 'timma-modal-content';
    document.body.appendChild(modal);

    modal.innerHTML = `
        <div class="timma-modal-header">
            <svg xmlns="http://www.w3.org/2000/svg" class="timma-logo" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="2"></circle><polyline points="12 6 12 12 16 14" fill="none" stroke="currentColor" stroke-width="2"></polyline></svg>
            <div>
                <a href="#" class="timma-header-link">My timesheet</a>
                <a href="#" class="timma-header-link">Sign out</a>
            </div>
        </div>
        <div class="timma-modal-body">
            <form id="time-form-modal" novalidate>
                <div class="timma-form-group">
                    <label>Project / Task</label>
                    <select id="project-select" class="timma-select" required><option value="" disabled selected>Select a Project</option><option value="BrokenLabs">BrokenLabs - Yello! Blog</option></select>
                    <select id="task-select" class="timma-select" required><option value="" disabled selected>Select a Task</option><option value="Meetings">Meetings</option></select>
                </div>
                <div class="timma-form-row">
                    <div class="timma-form-group timma-notes-group">
                        <textarea id="notes-modal" name="notes" class="timma-textarea" placeholder="Description" rows="1"></textarea>
                    </div>
                    <div class="timma-form-group timma-time-group">
                        <input type="text" id="time-modal" name="time" placeholder="0:00">
                    </div>
                </div>
            </form>
        </div>
        <div class="timma-modal-footer">
             <div class="timma-error-message"></div>
             <button type="submit" form="time-form-modal" class="timma-submit-btn">Save Entry</button>
             <button type="button" class="timma-cancel-btn">Cancel</button>
        </div>
    `;

    const form = modal.querySelector('#time-form-modal');
    const cancelButton = modal.querySelector('.timma-cancel-btn');
    const timeInput = modal.querySelector('#time-modal');
    const notesInput = modal.querySelector('#notes-modal');

    cancelButton.addEventListener('click', closeModal);
    form.addEventListener('submit', handleFormSubmit);
    
    timeInput.addEventListener('blur', formatTimeInput);
    timeInput.addEventListener('keydown', allowNumericInput);

    notesInput.addEventListener('input', autoResizeTextarea);

    form.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
        }
    });

    modal.querySelectorAll('.timma-select, #time-modal, #notes-modal').forEach(el => {
        el.addEventListener('change', () => el.classList.remove('timma-input-error'));
        el.addEventListener('input', () => el.classList.remove('timma-input-error'));
    });
}

function allowNumericInput(event) { /* ... same as before ... */ }
function autoResizeTextarea(event) { /* ... same as before ... */ }

function validateForm() {
    let isValid = true;
    const errorMessage = modal.querySelector('.timma-error-message');
    errorMessage.textContent = '';
    modal.querySelectorAll('.timma-input-error').forEach(el => el.classList.remove('timma-input-error'));

    modal.querySelectorAll('.timma-select').forEach(select => {
        if (!select.value) {
            select.classList.add('timma-input-error');
            isValid = false;
        }
    });

    const notesInput = modal.querySelector('#notes-modal');
    if (!notesInput.value.trim()) {
        notesInput.classList.add('timma-input-error');
        isValid = false;
    }

    const timeInput = modal.querySelector('#time-modal');
    if (!timeInput.value || timeInput.value.trim() === '0:00' || timeInput.value.trim() === '0') {
        timeInput.classList.add('timma-input-error');
        isValid = false;
    }

    if (!isValid) {
        errorMessage.textContent = 'Please fill out all required fields.';
    }
    return isValid;
}

function formatTimeInput(event) { /* ... same as before ... */ }
function openModal() { /* ... same as before ... */ }
function closeModal() { /* ... same as before ... */ }
function handleFormSubmit(event) { /* ... same as before ... */ }

// Full script with all functions included
function allowNumericInput(event) {
    if ([46, 8, 9, 27, 13, 190, 186, 58].indexOf(event.keyCode) !== -1 || (event.key === ':') || (event.keyCode === 65 && (event.ctrlKey === true || event.metaKey === true)) || (event.keyCode >= 35 && event.keyCode <= 40)) { return; }
    if ((event.shiftKey || (event.keyCode < 48 || event.keyCode > 57)) && (event.keyCode < 96 || event.keyCode > 105)) { event.preventDefault(); }
}

function autoResizeTextarea(event) {
    const textarea = event.target;
    textarea.style.height = 'auto';
    const computedStyle = getComputedStyle(textarea);
    const lineHeight = parseInt(computedStyle.lineHeight) || 20;
    const maxLines = 5;
    const maxHeight = lineHeight * maxLines;
    const scrollHeight = textarea.scrollHeight;
    if (scrollHeight > maxHeight) {
        textarea.style.height = `${maxHeight}px`;
        textarea.style.overflowY = 'auto';
    } else {
        textarea.style.height = `${scrollHeight}px`;
        textarea.style.overflowY = 'hidden';
    }
}

function formatTimeInput(event) {
    const input = event.target;
    let value = input.value.trim();

    // If it's a decimal number (e.g., 0.5), convert to HH:MM
    if (!isNaN(value) && value.includes('.')) {
        const hoursDecimal = parseFloat(value);
        const totalMinutes = Math.round(hoursDecimal * 60);
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;
        input.value = `${hours}:${minutes.toString().padStart(2, '0')}`;
    } 
    // If it's a whole number (e.g., 4), convert to HH:00
    else if (!isNaN(value) && !value.includes(':') && value !== '') {
        const hours = parseInt(value, 10);
        input.value = `${hours}:00`;
    }
}

function openModal() {
    if (!modal) createModal();
    backdrop.style.display = 'block';
    modal.style.display = 'block';
    setTimeout(() => {
        backdrop.style.opacity = '1';
        modal.style.opacity = '1';
        modal.style.transform = 'translate(-50%, -50%) scale(1)';
    }, 10);
}

function closeModal() {
    backdrop.style.opacity = '0';
    modal.style.opacity = '0';
    modal.style.transform = 'translate(-50%, -50%) scale(0.95)';
    setTimeout(() => {
        backdrop.style.display = 'none';
        modal.style.display = 'none';
    }, 300);
}

function handleFormSubmit(event) {
    event.preventDefault();
    if (!validateForm()) return;

    const project = modal.querySelector('#project-select').value;
    const task = modal.querySelector('#task-select').value;
    const notes = document.getElementById('notes-modal').value;
    let time = document.getElementById('time-modal').value;

    const data = { project, task, notes, time };

    chrome.runtime.sendMessage({ action: "sendData", data: data }, (response) => {
        if (chrome.runtime.lastError) {
            console.error('Connection error:', chrome.runtime.lastError.message);
            alert("Could not connect to the extension. Please reload this page and try again.");
            return;
        }
        if (response && response.status === 'success') {
            console.log('Data sent successfully');
            closeModal();
        } else {
            console.error('Failed to send data. Response:', response);
        }
    });
}