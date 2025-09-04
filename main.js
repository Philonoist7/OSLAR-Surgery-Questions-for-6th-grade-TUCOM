// --- START FIREBASE SETUP ---
// --- START FIREBASE SETUP ---

// This is your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCyj9Ee8DhYADbgzS6S4QnHKRUorW4B2Rk",
  authDomain: "osler-surgery-questions.firebaseapp.com",
  projectId: "osler-surgery-questions",
  storageBucket: "osler-surgery-questions.firebasestorage.app",
  messagingSenderId: "797027462113",
  appId: "1:797027462113:web:afa40bcf4b0d87cf6b00a0"
  // measurementId is optional and not needed for this app
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();
let currentUser = null; // Variable to hold the current user object
let userNotes = {};     // In-memory cache of the user's notes

// --- Utility: Local Storage for notes ---
// Local storage functions are no longer needed and have been removed.

// --- END FIREBASE SETUP ---
// --- END FIREBASE SETUP ---

function autoResizeNoteBox(textarea) {
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, textarea.scrollHeight) + 'px';
}

document.addEventListener('DOMContentLoaded', function () {
    // Get references
    const questionsContainer = document.getElementById('questionsContainer');
    const searchInput = document.getElementById('searchInput');
    const backToTopBtn = document.getElementById('backToTopBtn');
    const toggleAllBtn = document.getElementById('toggleAllBtn');
    const importFileInput = document.getElementById('importFileInput');
    const menuToggle = document.getElementById('menuToggle');
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.getElementById('overlay');
    const sidebarNav = document.querySelector('.sidebar-nav');
    
    // Get references to Auth elements
    const signInBtn = document.getElementById('signInBtn');
    const signOutBtn = document.getElementById('signOutBtn');
    const userInfo = document.getElementById('userInfo');
    const userName = document.getElementById('userName');

    // Get references to Data Management buttons
    const clearNotesBtn = document.getElementById('clearNotesBtn');
    const exportAllBtn = document.getElementById('exportAllBtn');
    const importAllBtn = document.getElementById('importAllBtn');
    
    let currentTopicForImport = null;

    // --- Core Page Building Function ---
    function populatePage() {
        // ... (This function remains unchanged, it correctly builds the page structure)
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

            section.querySelectorAll('.question-card').forEach(card => {
                card.dataset.originalHtml = card.querySelector('.question-header').innerHTML;
            });
        }
    }
    
    function buildQuestionHTML(q) {
        let questionTextHTML = Array.isArray(q.text)
            ? q.text.map(line => `<p class="question-text">${line}</p>`).join('')
            : `<p class="question-text">${q.text}</p>`;
    
        return `<div class="question-card" data-question-id="${q.id}">
            <div class="question-header">
                ${q.caseHeader ? `<p class="case-header">${q.caseHeader}</p>` : ''}
                ${questionTextHTML}
                ${q.doctors ? `<p class="doctors">${q.doctors}</p>` : ''}
                <button class="copy-question-btn" title="Copy question" style="margin-left:auto;">Copy</button>
            </div>
            <div class="answer-content">
            
            <div class="editor-toolbar">
                   
                    <button class="format-btn" data-command="insertUnorderedList" title="Bulleted List">Bullet •••</button>
                    <button class="format-btn" data-command="insertOrderedList" title="Numbered List">Numbering</button>
                </div>

                <div class="note-box" contenteditable="false" data-placeholder="Sign in to save notes..."></div>
            </div>
        </div>`;
    }

    //  <button class="format-btn" data-command="bold" title="Bold"><b>Bold</b></button>
    // <button class="format-btn" data-command="italic" title="Italic"><i>Italic</i></button>

    // --- Firebase Auth & Firestore Functions ---
    auth.onAuthStateChanged(async user => {
        if (user) {
            currentUser = user;
            userInfo.style.display = 'flex';
            userName.textContent = currentUser.displayName;
            signInBtn.style.display = 'none';
            document.querySelectorAll('.note-box').forEach(box => {
                box.disabled = false;
                box.placeholder = "Your answer and notes here...";
            });
            await loadNotesFromFirestore();
        } else {
            currentUser = null;
            userNotes = {};
            userInfo.style.display = 'none';
            signInBtn.style.display = 'block';
            document.querySelectorAll('.note-box').forEach(box => {
                box.innerHTML = '';
                box.setAttribute('contenteditable', 'false');
                box.dataset.placeholder = "Sign in to save notes...";
            });
        }
    });

    signInBtn.addEventListener('click', () => {
        const provider = new firebase.auth.GoogleAuthProvider();
        auth.signInWithPopup(provider).catch(error => {
            console.error("Sign-in error", error);
            alert("Could not sign in. Please check the console for errors.");
        });
    });

    signOutBtn.addEventListener('click', () => auth.signOut());

    async function loadNotesFromFirestore() {
        if (!currentUser) return;
        try {
            const userNotesRef = db.collection('users').doc(currentUser.uid);
            const doc = await userNotesRef.get();
            userNotes = (doc.exists && doc.data().notes) ? doc.data().notes : {};
            document.querySelectorAll('.note-box').forEach(box => {
                const id = box.closest('.question-card').dataset.questionId;
                box.innerHTML = userNotes[id] || '';
                autoResizeNoteBox(box);
            });
        } catch (error) {
            console.error("Error loading notes:", error);
        }
    }

    async function saveNote(element) {
        if (!currentUser) return;
        const questionId = element.closest('.question-card').dataset.questionId;
        const noteText = element.innerHTML;
        userNotes[questionId] = noteText;
        try {
            const userNotesRef = db.collection('users').doc(currentUser.uid);
            await userNotesRef.set({ notes: { [questionId]: noteText } }, { merge: true });
        } catch (error) {
            console.error("Error saving note:", error);
        }
    }

    function clearAllNotes() {
        if (!currentUser) return alert("You must be signed in to clear notes.");
        if (confirm('Are you sure you want to delete ALL your saved notes from the cloud? This action cannot be undone.')) {
            const userNotesRef = db.collection('users').doc(currentUser.uid);
            userNotesRef.set({ notes: {} })
                .then(() => {
                    userNotes = {};
                    document.querySelectorAll('.note-box').forEach(box => {
                        box.value = '';
                        autoResizeNoteBox(box);
                    });
                    alert('All your notes have been cleared.');
                })
                .catch(error => console.error("Error clearing notes:", error));
        }
    }

    // --- Run Page Setup ---
    populatePage();

// Setup rich text editor functionality
document.addEventListener('click', function(e) {
    if (e.target.matches('.format-btn')) {
        e.preventDefault();
        const command = e.target.dataset.command;
        const noteBox = e.target.closest('.answer-content').querySelector('.note-box');
        
        if (noteBox.getAttribute('contenteditable') === 'true') {
            document.execCommand(command, false, null);
            noteBox.focus();
            autoResizeNoteBox(noteBox);
            saveNote(noteBox);
        }
    }
});

// Handle input events for auto-resize
document.addEventListener('input', function(e) {
    if (e.target.matches('.note-box[contenteditable="true"]')) {
        autoResizeNoteBox(e.target);
        saveNote(e.target);
    }
});

// Handle paste events to preserve formatting
document.addEventListener('paste', function(e) {
    if (!e.target.matches('.note-box[contenteditable="true"]')) return;
    
    e.preventDefault();
    const text = e.clipboardData.getData('text/html') || e.clipboardData.getData('text/plain');
    
    if (e.clipboardData.types.includes('text/html')) {
        // Create a temporary div to sanitize HTML
        const temp = document.createElement('div');
        temp.innerHTML = text;
        
        // Remove potentially dangerous elements and attributes
        const safe = sanitizeHTML(temp);
        document.execCommand('insertHTML', false, safe);
    } else {
        document.execCommand('insertText', false, text);
    }
    
    // Force all text to be white after paste
    const noteBox = e.target;
    Array.from(noteBox.getElementsByTagName('*')).forEach(el => {
        el.style.color = 'var(--primary-text-color)';
    });
    
    // Add auto-resize after paste
    setTimeout(() => autoResizeNoteBox(e.target), 0);
    saveNote(e.target);
});

function sanitizeHTML(element) {
    // Remove script tags and on* attributes
    const scripts = element.getElementsByTagName('script');
    while (scripts[0]) scripts[0].parentNode.removeChild(scripts[0]);
    
    // Remove style tags
    const styles = element.getElementsByTagName('style');
    while (styles[0]) styles[0].parentNode.removeChild(styles[0]);
    
    // Clean all elements
    const all = element.getElementsByTagName('*');
    for (let i = 0; i < all.length; i++) {
        const el = all[i];
        // Remove all attributes except basic formatting
        const attrs = Array.from(el.attributes);
        attrs.forEach(attr => {
            if (!['href', 'target'].includes(attr.name)) {
                el.removeAttribute(attr.name);
            }
        });
        // Force white color
        el.style.color = 'var(--primary-text-color)';
    }
    
    return element.innerHTML;
}

// Update auth state change handler
auth.onAuthStateChanged(async user => {
    if (user) {
        currentUser = user;
        userInfo.style.display = 'flex';
        userName.textContent = currentUser.displayName;
        signInBtn.style.display = 'none';
        document.querySelectorAll('.note-box').forEach(box => {
            box.disabled = false;
            box.setAttribute('contenteditable', 'true');
            box.dataset.placeholder = "Your answer and notes here...";
        });
        await loadNotesFromFirestore();
    } else {
        currentUser = null;
        userNotes = {};
        userInfo.style.display = 'none';
        signInBtn.style.display = 'block';
        document.querySelectorAll('.note-box').forEach(box => {
            box.innerHTML = '';
            box.setAttribute('contenteditable', 'false');
            box.dataset.placeholder = "Sign in to save notes...";
        });
    }
});

// --- Dynamic Content Event Listener ---
questionsContainer.addEventListener('click', (e) => {
        const target = e.target;
        // Copy button handler
        if (target.classList.contains('copy-question-btn')) {
            const header = target.closest('.question-header');
            // Get all question text inside this header
            let text = '';
            header.querySelectorAll('.question-text, .case-header, .doctors').forEach(el => {
                text += el.textContent + '\n';
            });
            // Copy to clipboard
            navigator.clipboard.writeText(text.trim()).then(() => {
                target.textContent = '✅ Copied!';
                setTimeout(() => { target.textContent = 'Copy'; }, 1200);
            });
            e.stopPropagation();
            return;
        }
        const questionHeader = target.closest('.question-header');
        if (questionHeader) {
            questionHeader.closest('.question-card').classList.toggle('active');
            return;
        }
        const topicHeader = target.closest('.topic-header');
        if (topicHeader) {
            if (target.classList.contains('topic-export-btn')) {
                handleTopicExport(target.dataset.topicId);
            } else if (target.classList.contains('topic-import-btn')) {
                if (!currentUser) return alert("Please sign in to import notes.");
                currentTopicForImport = target.dataset.topicId;
                importFileInput.click();
            } else {
                topicHeader.closest('.specialty-section').classList.toggle('active');
            }
        }
    });

    // --- Mobile Menu ---
    function closeMenu() { sidebar.classList.remove('active'); overlay.classList.remove('active'); }
    menuToggle.addEventListener('click', () => { sidebar.classList.toggle('active'); overlay.classList.toggle('active'); });
    overlay.addEventListener('click', closeMenu);
    sidebarNav.addEventListener('click', (e) => { if (e.target.tagName === 'A') { setTimeout(closeMenu, 100); } });

    // --- Header Button Functionality ---
    clearNotesBtn.addEventListener('click', clearAllNotes);
    exportAllBtn.addEventListener('click', handleGlobalExport);
    importAllBtn.addEventListener('click', () => {
        if (!currentUser) return alert("Please sign in to import notes.");
        currentTopicForImport = null;
        importFileInput.click();
    });

    function handleGlobalExport() {
        if (!currentUser) return alert("Please sign in to export your notes.");
        if (Object.keys(userNotes).length === 0) return alert('No notes found to export.');

        const jsonString = JSON.stringify(userNotes, null, 2);
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
        if (!currentUser) return alert("Please sign in to export your notes.");
        if (!topicId || !allQuestionsData[topicId]) return;

        const topicData = allQuestionsData[topicId];
        const notes = {};
        let notesFound = false;

        topicData.questions.forEach(q => {
            if (userNotes[q.id] && userNotes[q.id].trim() !== '') {
                notes[q.id] = userNotes[q.id];
                notesFound = true;
            }
        });

        if (!notesFound) return alert(`No notes found in "${topicData.title}" to export.`);
        
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
        if (!file || !currentUser) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const importedData = JSON.parse(e.target.result);
                
                if (currentTopicForImport) {
                    if (importedData.topicId !== currentTopicForImport) {
                        return alert(`Import failed. This file is for "${importedData.topicTitle}", not the selected topic.`);
                    }
                }
                if (confirm('This will import notes and overwrite any conflicting notes in your account. Continue?')) {
                    const notesToImport = importedData.notes || importedData;
                    const userNotesRef = db.collection('users').doc(currentUser.uid);
                    userNotesRef.set({ notes: notesToImport }, { merge: true }).then(() => {
                        alert('Notes imported successfully! Reloading to show changes.');
                        location.reload();
                    }).catch(error => {
                        alert('Failed to import notes to the cloud.');
                        console.error(error);
                    });
                }
            } catch (error) {
                alert('Failed to import notes. Please use a valid JSON file.');
                console.error('Import error:', error);
            } finally {
                currentTopicForImport = null;
                event.target.value = null; // Reset file input
            }
        };
        reader.readAsText(file);
    });

    toggleAllBtn.addEventListener('click', () => {
        const sections = document.querySelectorAll('.specialty-section');
        const isAnyCollapsed = document.querySelector('.specialty-section:not(.active)');
        sections.forEach(section => section.classList.toggle('active', !!isAnyCollapsed));
    });

    // --- Search Functionality ---
    function performSearch() {
        // ... (This function is correct and does not need changes)
        const searchTerm = searchInput.value.toLowerCase().trim();
        const searchRegex = new RegExp(searchInput.value.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'gi');
        document.querySelectorAll('.specialty-section').forEach(section => {
            let sectionHasMatch = false;
            const titleElement = section.querySelector('.topic-title');
            titleElement.innerHTML = titleElement.dataset.originalHtml;
            if (searchTerm !== '' && titleElement.textContent.toLowerCase().includes(searchTerm)) {
                sectionHasMatch = true;
                titleElement.innerHTML = titleElement.dataset.originalHtml.replace(searchRegex, match => `<mark>${match}</mark>`);
            }
            section.querySelectorAll('.question-card').forEach(card => {
                const header = card.querySelector('.question-header');
                header.innerHTML = card.dataset.originalHtml;
                const isMatch = searchTerm === '' || card.textContent.toLowerCase().includes(searchTerm);
                card.style.display = isMatch ? 'block' : 'none';
                if (isMatch) {
                    sectionHasMatch = true;
                    if (searchTerm !== '') {
                        header.innerHTML = card.dataset.originalHtml.replace(searchRegex, match => `<mark>${match}</mark>`);
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

    // FIXED: Removed the old loadNotes() call from here.
});