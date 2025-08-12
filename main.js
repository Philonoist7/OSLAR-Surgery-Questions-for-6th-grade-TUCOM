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

            // Store original HTML for question cards
            section.querySelectorAll('.question-card').forEach(card => {
                card.dataset.originalHtml = card.querySelector('.question-header').innerHTML;
            });
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

    // *** FIXED: Single, robust event listener for all dynamic content ***
    questionsContainer.addEventListener('click', (e) => {
        const target = e.target;

        // Handle clicks on question headers
        const questionHeader = target.closest('.question-header');
        if (questionHeader) {
            questionHeader.closest('.question-card').classList.toggle('active');
            return; // Stop further processing
        }
        
        // Handle clicks within the topic header
        const topicHeader = target.closest('.topic-header');
        if (topicHeader) {
            if (target.classList.contains('topic-export-btn')) {
                const topicId = target.dataset.topicId;
                handleTopicExport(topicId);
            } else if (target.classList.contains('topic-import-btn')) {
                currentTopicForImport = target.dataset.topicId;
                importFileInput.click();
            } else {
                // If anything else in the header is clicked (title, toggle button, empty space), toggle the section
                topicHeader.closest('.specialty-section').classList.toggle('active');
            }
        }
    });


    // --- Mobile Menu Functionality ---
    function closeMenu() { sidebar.classList.remove('active'); overlay.classList.remove('active'); }
    menuToggle.addEventListener('click', () => { sidebar.classList.toggle('active'); overlay.classList.toggle('active'); });
    overlay.addEventListener('click', closeMenu);
    sidebarNav.addEventListener('click', (e) => { if (e.target.tagName === 'A') { setTimeout(closeMenu, 100); } });

    // --- Note Saving & Loading ---
    function saveNote(element) { const id = element.closest('.question-card').dataset.questionId; if (id) localStorage.setItem(id, element.value); }
    function loadNotes() { allNoteBoxes.forEach(box => { const id = box.closest('.question-card').dataset.questionId; const savedNote = localStorage.getItem(id); if (savedNote) box.value = savedNote; }); }
    allNoteBoxes.forEach(box => { box.addEventListener('input', (e) => saveNote(e.target)); });

    // --- Header Button & Data Management Functionality ---
    clearNotesBtn.addEventListener('click', () => { if (confirm('Are you sure you want to delete ALL your saved notes? This action cannot be undone.')) { localStorage.clear(); location.reload(); } });
    
    exportAllBtn.addEventListener('click', handleGlobalExport);
    
    importAllBtn.addEventListener('click', () => { currentTopicForImport = null; importFileInput.click(); });

    function handleGlobalExport() {
        const notesToExport = {};
        let notesFound = false;
        Object.keys(localStorage).forEach(key => {
            if(localStorage.getItem(key)) { // Only export non-empty notes
               notesToExport[key] = localStorage.getItem(key);
               notesFound = true;
            }
        });

        if (!notesFound) {
            alert('No notes found to export.');
            return;
        }

        const jsonString = JSON.stringify(notesToExport, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `osler-notes-ALL_${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
    
    function handleTopicExport(topicId) {
        if (!topicId || !allQuestionsData[topicId]) return;

        const topicData = allQuestionsData[topicId];
        const notes = {};
        let notesFound = false;

        topicData.questions.forEach(q => {
            const note = localStorage.getItem(q.id);
            if (note && note.trim() !== '') {
                notes[q.id] = note;
                notesFound = true;
            }
        });

        if (!notesFound) {
            alert(`No notes found in "${topicData.title}" to export.`);
            return;
        }
        
        const dataToExport = { topicId: topicId, topicTitle: topicData.title, notes: notes };
        const jsonString = JSON.stringify(dataToExport, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const safeFilename = topicData.title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
        a.download = `osler-notes_${safeFilename}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    importFileInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const importedData = JSON.parse(e.target.result);
                if (typeof importedData !== 'object' || importedData === null) {
                    throw new Error('Invalid JSON structure.');
                }

                if (currentTopicForImport) {
                    if (importedData.topicId !== currentTopicForImport) {
                        alert(`Import failed. This file is for "${importedData.topicTitle}", not "${allQuestionsData[currentTopicForImport].title}".`);
                        return;
                    }
                    if (confirm(`This will overwrite existing notes in the topic "${importedData.topicTitle}". Continue?`)) {
                        for (const id in importedData.notes) {
                            localStorage.setItem(id, importedData.notes[id]);
                        }
                        alert('Topic notes imported successfully! The page will reload.');
                        location.reload();
                    }
                } else {
                    if (confirm('This will import all notes from the file and overwrite any existing ones. Are you sure?')) {
                        const notesToImport = importedData.notes || importedData;
                        for (const id in notesToImport) {
                            localStorage.setItem(id, notesToImport[id]);
                        }
                        alert('All notes imported successfully! The page will now reload.');
                        location.reload();
                    }
                }
            } catch (error) {
                alert('Failed to import notes. Please use a valid JSON file from this tool.');
                console.error('Import error:', error);
            } finally {
                currentTopicForImport = null;
                event.target.value = null;
            }
        };
        reader.readAsText(file);
    });

    toggleAllBtn.addEventListener('click', () => {
        const sections = document.querySelectorAll('.specialty-section');
        const isAnyCollapsed = document.querySelector('.specialty-section:not(.active)');
        sections.forEach(section => {
            section.classList.toggle('active', !!isAnyCollapsed);
        });
    });

    // --- Search Functionality ---
    function escapeRegex(string) { return string.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'); }
    
    function performSearch() {
        const searchTerm = searchInput.value.toLowerCase().trim();
        const searchRegex = new RegExp(escapeRegex(searchTerm), 'gi');
        
        document.querySelectorAll('.specialty-section').forEach(section => {
            let sectionHasMatch = false;
            const titleElement = section.querySelector('.topic-title');
            
            // Always reset title HTML from stored original
            titleElement.innerHTML = titleElement.dataset.originalHtml;

            if (searchTerm !== '' && titleElement.textContent.toLowerCase().includes(searchTerm)) {
                sectionHasMatch = true;
                const newTitleHtml = titleElement.dataset.originalHtml.replace(searchRegex, match => `<mark>${match}</mark>`);
                titleElement.innerHTML = newTitleHtml;
            }
            
            section.querySelectorAll('.question-card').forEach(card => {
                const header = card.querySelector('.question-header');
                // Always reset card HTML from stored original
                header.innerHTML = card.dataset.originalHtml; 

                const isMatch = searchTerm === '' || card.textContent.toLowerCase().includes(searchTerm);
                card.style.display = isMatch ? 'block' : 'none';

                if (isMatch) {
                    sectionHasMatch = true;
                    if (searchTerm !== '') {
                        const newHtml = card.dataset.originalHtml.replace(searchRegex, match => `<mark>${match}</mark>`);
                        header.innerHTML = newHtml;
                    }
                }
            });

            section.style.display = sectionHasMatch ? 'block' : 'none';

            if (sectionHasMatch && searchTerm !== '') {
                section.classList.add('active');
            }
        });
    }
    searchInput.addEventListener('input', performSearch);
    
    // --- Back to Top Button ---
    window.addEventListener('scroll', () => {
        backToTopBtn.classList.toggle('show', window.scrollY > 300);
    });
    backToTopBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    loadNotes(); // Initial load
});
