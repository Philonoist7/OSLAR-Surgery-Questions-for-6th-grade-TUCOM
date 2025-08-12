document.addEventListener('DOMContentLoaded', function () {
    let currentTopicForImport = null;

    function buildQuestionHTML(q) {
        let questionTextHTML = Array.isArray(q.text) ? q.text.map(line => `<p class="question-text">${line}</p>`).join('') : `<p class="question-text">${q.text}</p>`;
        return `<div class="question-card" data-question-id="${q.id}"><div class="question-header">${q.caseHeader ? `<p class="case-header">${q.caseHeader}</p>` : ''}${questionTextHTML}${q.doctors ? `<p class="doctors">${q.doctors}</p>` : ''}</div><div class="answer-content"><textarea class="note-box" placeholder="Your answer and notes here..."></textarea></div></div>`;
    }
    
    function populatePage() {
        const questionsContainer = document.getElementById('questionsContainer');
        const sidebarNav = document.querySelector('.sidebar-nav ul');
        questionsContainer.innerHTML = '';
        sidebarNav.innerHTML = '';

        for (const topicId in allQuestionsData) {
            const topicData = allQuestionsData[topicId];
            
            const listItem = document.createElement('li');
            listItem.innerHTML = `<a href="#${topicId}">${topicData.title}</a>`;
            sidebarNav.appendChild(listItem);

            const section = document.createElement('section');
            section.id = topicId;
            section.className = 'specialty-section';
            
            let questionsHTML = '';
            if (topicData.questions) {
                topicData.questions.forEach(q => { questionsHTML += buildQuestionHTML(q); });
            }

            // *** MODIFIED: New HTML structure for the topic header ***
            const headerHTML = `
                <div class="topic-header">
                    <h2 class="topic-title">${topicData.title}</h2>
                    <div class="topic-actions">
                        <button class="topic-toggle-btn" aria-label="Toggle topic content">▼</button>
                        <div class="action-buttons">
                            <button class="topic-export-btn" title="Export this topic's notes" data-topic-id="${topicId}">Export</button>
                            <button class="topic-import-btn" title="Import notes for this topic" data-topic-id="${topicId}">Import</button>
                        </div>
                    </div>
                </div>
            `;

            section.innerHTML = `
                ${headerHTML}
                <div class="topic-content">
                    ${questionsHTML}
                </div>
            `;
            questionsContainer.appendChild(section);

            const titleElement = section.querySelector('.topic-title');
            titleElement.dataset.originalHtml = titleElement.innerHTML;
        }
    }

    populatePage();

    // Get references
    const questionsContainer = document.getElementById('questionsContainer');
    const searchInput = document.getElementById('searchInput');
    const clearNotesBtn = document.getElementById('clearNotesBtn');
    const backToTopBtn = document.getElementById('backToTopBtn');
    const toggleAllBtn = document.getElementById('toggleAllBtn');
    const exportAllBtn = document.getElementById('exportAllBtn');
    const importAllBtn = document.getElementById('importAllBtn');
    const importFileInput = document.getElementById('importFileInput');
    const menuToggle = document.getElementById('menuToggle');
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.getElementById('overlay');
    const sidebarNav = document.querySelector('.sidebar-nav');
    const allNoteBoxes = document.querySelectorAll('.note-box');

    // *** MODIFIED: Simplified event delegation for dynamic content ***
    questionsContainer.addEventListener('click', (e) => {
        const target = e.target;

        // Handle question card expansion/collapse
        if (target.closest('.question-header')) {
            target.closest('.question-card').classList.toggle('active');
            return; // Prevent other handlers from firing
        }

        // Handle clicks within the topic header
        const header = target.closest('.topic-header');
        if (header) {
            if (target.classList.contains('topic-export-btn')) {
                const topicId = target.dataset.topicId;
                handleTopicExport(topicId);
            } else if (target.classList.contains('topic-import-btn')) {
                currentTopicForImport = target.dataset.topicId;
                importFileInput.click();
            } else {
                // If anything else in the header is clicked, toggle the section
                header.closest('.specialty-section').classList.toggle('active');
            }
        }
    });

    // --- Mobile Menu Functionality (Unchanged) ---
    function closeMenu() { sidebar.classList.remove('active'); overlay.classList.remove('active'); }
    menuToggle.addEventListener('click', () => { sidebar.classList.toggle('active'); overlay.classList.toggle('active'); });
    overlay.addEventListener('click', closeMenu);
    sidebarNav.addEventListener('click', (e) => { if (e.target.tagName === 'A') { setTimeout(closeMenu, 100); } });

    // --- Note Saving & Loading (Unchanged) ---
    function saveNote(element) { const id = element.closest('.question-card').dataset.questionId; if (id) localStorage.setItem(id, element.value); }
    function loadNotes() { allNoteBoxes.forEach(box => { const id = box.closest('.question-card').dataset.questionId; const savedNote = localStorage.getItem(id); if (savedNote) box.value = savedNote; }); }
    allNoteBoxes.forEach(box => { box.addEventListener('input', (e) => saveNote(e.target)); });

    // --- Header Button & Data Management Functionality (Unchanged) ---
    clearNotesBtn.addEventListener('click', () => { if (confirm('Are you sure you want to delete ALL your saved notes? This action cannot be undone.')) { localStorage.clear(); location.reload(); } });
    exportAllBtn.addEventListener('click', handleGlobalExport);
    importAllBtn.addEventListener('click', () => { currentTopicForImport = null; importFileInput.click(); });
    function handleGlobalExport() { /* ... unchanged ... */ }
    function handleTopicExport(topicId) { /* ... unchanged ... */ }
    importFileInput.addEventListener('change', (event) => { /* ... unchanged ... */ });
    toggleAllBtn.addEventListener('click', () => { const sections = document.querySelectorAll('.specialty-section'); const isAnyCollapsed = document.querySelector('.specialty-section:not(.active)'); sections.forEach(section => { section.classList.toggle('active', !!isAnyCollapsed); }); });

    // --- Search Functionality (Unchanged) ---
    function escapeRegex(string) { return string.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'); }
    function performSearch() { /* ... unchanged ... */ }
    searchInput.addEventListener('input', performSearch);
    
    // --- Back to Top Button (Unchanged) ---
    window.addEventListener('scroll', () => { backToTopBtn.classList.toggle('show', window.scrollY > 300); });
    backToTopBtn.addEventListener('click', () => { window.scrollTo({ top: 0, behavior: 'smooth' }); });

    loadNotes(); // Initial load
});
