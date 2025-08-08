let modal, backdrop;
let buttonInjected = false;
let lastTaskId = null;

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
            <h1 style="margin-left: 10px; font-size: 1.2rem; margin-right: auto;">Timma</h1>
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
                </div>
                <div class="timma-form-row">
                    <div class="timma-form-group timma-task-group">
                        <select id="task-select" class="timma-select" required><option value="" disabled selected>Select a Task</option><option value="Meetings">Meetings</option></select>
                    </div>
                    <div class="timma-form-group timma-date-group">
                        <input type="date" id="date-modal" name="date">
                    </div>
                    <div class="timma-form-group timma-time-group">
                        <input type="text" id="time-modal" name="time" placeholder="0:00">
                    </div>
                </div>
                <div class="timma-form-group">
                    <div class="timma-notes-group">
                        <textarea id="notes-modal" name="notes" class="timma-textarea" placeholder="Description" rows="1"></textarea>
                    </div>
                </div>
            </form>
        </div>
        <div class="timma-modal-footer">
             <div class="timma-error-message"></div>
             <button type="submit" form="time-form-modal" class="timma-submit-btn">Save entry</button>
             <button type="button" class="timma-cancel-btn">Cancel</button>
        </div>
    `;

    const form = modal.querySelector('#time-form-modal');
    const cancelButton = modal.querySelector('.timma-cancel-btn');
    const timeInput = modal.querySelector('#time-modal');
    const notesInput = modal.querySelector('#notes-modal');
    const dateInput = modal.querySelector('#date-modal');

    cancelButton.addEventListener('click', closeModal);
    form.addEventListener('submit', handleFormSubmit);
    
    timeInput.addEventListener('blur', formatTimeInput);
    timeInput.addEventListener('keydown', allowNumericInput);

    notesInput.addEventListener('input', autoResizeTextarea);

    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    dateInput.value = `${yyyy}-${mm}-${dd}`;

    form.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
        }
    });

    modal.querySelectorAll('.timma-select, #time-modal, #notes-modal, #date-modal').forEach(el => {
        el.addEventListener('change', () => el.classList.remove('timma-input-error'));
        el.addEventListener('input', () => el.classList.remove('timma-input-error'));
    });
}

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

    const dateInput = modal.querySelector('#date-modal');
    if (!dateInput.value) {
        dateInput.classList.add('timma-input-error');
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

function formatTimeInput(event) {
    const input = event.target;
    let value = input.value.trim();

    if (!isNaN(value) && value.includes('.')) {
        const hoursDecimal = parseFloat(value);
        const totalMinutes = Math.round(hoursDecimal * 60);
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;
        input.value = `${hours}:${minutes.toString().padStart(2, '0')}`;
    } 
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
    const date = document.getElementById('date-modal').value;
    let time = document.getElementById('time-modal').value;

    const data = { project, task, notes, date, time };

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

// --- Button Injection Logic ---
function getTaskIdFromUrl() {
    const match = window.location.href.match(/app\.clickup\.com\/t\/([^/]+)/);
    return match ? match[1] : null;
}

function removeTimmaSection() {
    const existingSection = document.getElementById('timma-tracker-container');
    if (existingSection) {
        existingSection.remove();
        buttonInjected = false;
    }
}

function injectTimmaButton() {
    if (buttonInjected) {
        return; // Prevent multiple injections
    }

    const targetElement = document.querySelector('cu-task-hero-section');

    if (targetElement) {
        const containerDiv = document.createElement('div');
        containerDiv.id = 'timma-tracker-container';
        containerDiv.classList.add('timma-tracker-container');

        const textContentDiv = document.createElement('div');
        textContentDiv.classList.add('timma-text-content');

        const appLabel = document.createElement('span');
        appLabel.textContent = "Broken Rubik's Timma Timer Tracker";
        appLabel.classList.add('timma-app-label');

        const trackedTimeText = document.createElement('span');
        trackedTimeText.textContent = 'Total Tracked: 0:00'; // Dummy text
        trackedTimeText.classList.add('timma-tracked-time');

        const trackMoreButton = document.createElement('button');
        trackMoreButton.title = 'Track Time'; // Hover text
        trackMoreButton.classList.add('timma-track-button');

        trackMoreButton.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-clock">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
        `;
        trackMoreButton.onmouseover = () => { 
            trackMoreButton.style.backgroundColor = '#0056b3'; 
            showTooltip(trackMoreButton, 'Track Time');
        };
        trackMoreButton.onmouseout = () => { 
            trackMoreButton.style.backgroundColor = '#007bff'; 
            hideTooltip();
        };

        trackMoreButton.addEventListener('click', (e) => {
            e.stopPropagation();
            openModal();
        });

        textContentDiv.appendChild(appLabel);
        textContentDiv.appendChild(trackedTimeText);
        containerDiv.appendChild(textContentDiv);
        containerDiv.appendChild(trackMoreButton);

        targetElement.parentNode.insertBefore(containerDiv, targetElement.nextSibling);
        buttonInjected = true;
    }
}

// --- Custom Tooltip Functions ---
let currentTooltip = null;

function showTooltip(element, text) {
    if (currentTooltip) hideTooltip();

    const tooltip = document.createElement('div');
    tooltip.className = 'timma-custom-tooltip';
    tooltip.textContent = text;
    document.body.appendChild(tooltip);
    currentTooltip = tooltip;

    const rect = element.getBoundingClientRect();
    tooltip.style.left = `${rect.left + (rect.width / 2) - (tooltip.offsetWidth / 2)}px`;
    tooltip.style.top = `${rect.top - tooltip.offsetHeight - 5}px`; // 5px above the element
    tooltip.style.opacity = '1';
}

function hideTooltip() {
    if (currentTooltip) {
        currentTooltip.style.opacity = '0';
        currentTooltip.remove();
        currentTooltip = null;
    }
}

// --- Main Logic for SPA Navigation --- 
// This function will be called by the MutationObserver and history API overrides
function handleUrlChange() {
    const currentTaskId = getTaskIdFromUrl();

    // Case 1: Navigated to a new task page
    if (currentTaskId && currentTaskId !== lastTaskId) {
        removeTimmaSection();
        lastTaskId = currentTaskId;
        injectTimmaButton();
    } 
    // Case 2: Navigated away from a task page
    else if (!currentTaskId && lastTaskId) {
        removeTimmaSection();
        lastTaskId = null;
    }
    // Case 3: On a task page, but button not injected (e.g., initial load or element re-render)
    else if (currentTaskId && !buttonInjected) {
        injectTimmaButton();
    }
}

// Initial check on script load
lastTaskId = getTaskIdFromUrl();
injectTimmaButton();

// Use MutationObserver to watch for DOM changes (e.g., when ClickUp loads task details dynamically)
const observer = new MutationObserver((mutationsList, observer) => {
    // Check if the target element is added or removed
    const targetElementExists = document.querySelector('cu-task-hero-section');
    if (targetElementExists && !buttonInjected) {
        injectTimmaButton();
    } else if (!targetElementExists && buttonInjected) {
        // If the target element is removed, and our button was injected, remove it.
        removeTimmaSection();
    }
    // Also call handleUrlChange to catch any URL changes that might not involve target element removal/re-addition
    handleUrlChange();
});

// Observe the document body for changes to its children and descendants
observer.observe(document.body, { childList: true, subtree: true });

// Additionally, listen for pushState/replaceState to catch URL changes more directly
// This is a common pattern for SPAs that don't trigger full page loads
window.addEventListener('popstate', handleUrlChange);
window.addEventListener('hashchange', handleUrlChange);

// Override pushState and replaceState to trigger our handler
(function(history){
    const pushState = history.pushState;
    history.pushState = function() {
        pushState.apply(history, arguments);
        handleUrlChange();
    };

    const replaceState = history.replaceState;
    history.replaceState = function() {
        replaceState.apply(history, arguments);
        handleUrlChange();
    };
})(window.history);