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
function loadNotesFromLocalStorage() {
    try {
        const notes = localStorage.getItem('osler_notes');
        return notes ? JSON.parse(notes) : {};
    } catch {
        return {};
    }
}
function saveNotesToLocalStorage(notes) {
    localStorage.setItem('osler_notes', JSON.stringify(notes));
}

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
        // Add a copy button beside the question header
        return `<div class="question-card" data-question-id="${q.id}">
            <div class="question-header">
                ${q.caseHeader ? `<p class="case-header">${q.caseHeader}</p>` : ''}
                ${questionTextHTML}
                ${q.doctors ? `<p class="doctors">${q.doctors}</p>` : ''}
                <button class="copy-question-btn" title="Copy question" style="margin-left:auto;">Copy</button>
            </div>
            <div class="answer-content">
                <textarea class="note-box" placeholder="Your answer and notes here..."></textarea>
            </div>
        </div>`;
    }

    // --- Firebase Auth & Firestore Functions ---
    auth.onAuthStateChanged(async user => {
        if (user) {
            currentUser = user;
            userInfo.style.display = 'flex';
            userName.textContent = currentUser.displayName;
            signInBtn.style.display = 'none';

            // Load notes from Firestore and merge with local notes
            const cloudNotes = await getNotesFromFirestore();
            const localNotes = loadNotesFromLocalStorage();
            // Merge: local notes overwrite cloud notes if present
            userNotes = { ...cloudNotes, ...localNotes };
            // Save merged notes to Firestore
            await saveAllNotesToFirestore(userNotes);
            // Save merged notes to localStorage
            saveNotesToLocalStorage(userNotes);

            document.querySelectorAll('.note-box').forEach(box => {
                box.disabled = false;
                box.placeholder = "Your answer and notes here...";
                const id = box.closest('.question-card').dataset.questionId;
                box.value = userNotes[id] || '';
                autoResizeNoteBox(box); // <-- Ensure correct height after value set
            });
        } else {
            currentUser = null;
            userInfo.style.display = 'none';
            signInBtn.style.display = 'block';
            // Load notes from localStorage
            userNotes = loadNotesFromLocalStorage();
            document.querySelectorAll('.note-box').forEach(box => {
                box.disabled = false;
                box.placeholder = "Your answer and notes here...";
                const id = box.closest('.question-card').dataset.questionId;
                box.value = userNotes[id] || '';
                autoResizeNoteBox(box); // <-- Ensure correct height after value set
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

    async function getNotesFromFirestore() {
        if (!currentUser) return {};
        try {
            const userNotesRef = db.collection('users').doc(currentUser.uid);
            const doc = await userNotesRef.get();
            return (doc.exists && doc.data().notes) ? doc.data().notes : {};
        } catch {
            return {};
        }
    }

    async function saveAllNotesToFirestore(notes) {
        if (!currentUser) return;
        try {
            const userNotesRef = db.collection('users').doc(currentUser.uid);
            await userNotesRef.set({ notes }, { merge: true });
        } catch (error) {
            console.error("Error saving notes:", error);
        }
    }

    async function saveNote(element) {
        const questionId = element.closest('.question-card').dataset.questionId;
        const noteText = element.value;
        userNotes[questionId] = noteText;
        saveNotesToLocalStorage(userNotes);
        if (currentUser) {
            await saveAllNotesToFirestore(userNotes);
        }
    }

    function clearAllNotes() {
        // Clear both localStorage and Firestore
        if (confirm('Are you sure you want to delete ALL your saved notes? This action cannot be undone.')) {
            userNotes = {};
            saveNotesToLocalStorage(userNotes);
            document.querySelectorAll('.note-box').forEach(box => box.value = '');
            if (currentUser) {
                const userNotesRef = db.collection('users').doc(currentUser.uid);
                userNotesRef.set({ notes: {} })
                    .then(() => {
                        alert('All your notes have been cleared.');
                    })
                    .catch(error => console.error("Error clearing notes:", error));
            } else {
                alert('All your notes have been cleared.');
            }
        }
    }

    // --- Run Page Setup ---
    populatePage();
    const allNoteBoxes = document.querySelectorAll('.note-box');
    allNoteBoxes.forEach(box => {
        box.addEventListener('input', (e) => {
            saveNote(e.target);
            autoResizeNoteBox(e.target);
        });
        autoResizeNoteBox(box); // <-- Initial resize for pre-filled notes
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
        // FIXED: Use the 'userNotes' object instead of localStorage.
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
        // FIXED: Use the 'userNotes' object instead of localStorage.
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
        // ... (rest of the export logic is fine)
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
                // FIXED: This line was missing. It's crucial.
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