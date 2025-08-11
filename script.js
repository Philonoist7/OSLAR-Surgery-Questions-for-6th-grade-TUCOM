// --- Data: Raw questions from user input ---
const allQuestionsData = {
    "gen-surg": { title: "🚀 1.0 General Surgery (40%)", groups: [
        { subHeader: "⚠️ 1.1 Basic Surgical Principles", questions: [
            { id: "types-of-shock", text: "What are the types of shock? Define them and their management.", doctors: "[👨‍⚕️ Dr. Awni, Dr. Firas]" },
            { id: "septic-shock", text: "What is the management for a patient in septic shock?", doctors: "[👨‍⚕️ Dr. Firas]" },
            { id: "post-op-fever", text: "What are the causes of post-operative fever, categorized by day (Day 0, Day 1, Day 2)?", doctors: "[👨‍⚕️ Dr. Awni]" },
            { id: "wound-infection-start", text: "When does a wound infection typically start?", doctors: "[👨‍⚕️ Dr. Awni]" },
            { id: "internal-hemorrhage", text: "How do you manage a patient with internal hemorrhage after surgery?", doctors: "[👨‍⚕️ General Question]" },
            { id: "sterile-contaminated-wounds", text: "How do you define sterile and contaminated wounds, with examples?", doctors: "[👨‍⚕️ Dr. Omar]" }
        ]},
        { subHeader: "⚠️ 1.3 Peri-operative Care", questions: [
            { id: "obstructive-jaundice-prep", text: "How do you prepare a patient with obstructive jaundice for surgery?", doctors: "[👨‍⚕️ Dr. Jamal, Dr. Awni]" },
            { id: "thyroidectomy-prep", text: "How do you prepare a patient for a thyroidectomy?", doctors: "[👨‍⚕️ Dr. Salih]" },
            { id: "cholecystectomy-prep", text: "How do you prepare a patient for a cholecystectomy?", doctors: "[👨‍⚕️ Dr. Yassir]" },
            { id: "post-op-fluids", text: "What fluids and electrolytes do you give a patient after surgery (including management of hypokalemia)?", doctors: "[👨‍⚕️ Dr. Fawzi, Dr. Jamal]" },
            { id: "blood-transfusion-start", text: "When do you start a blood transfusion (based on PCV, Hb level)?", doctors: "[👨‍⚕️ Dr. Jamal]" }
        ]},
        { subHeader: "🔹 1.4 Abdominal Wall, Hernia & Umbilicus", questions: [
            { id: "hernia-boundaries", text: "What are the boundaries of femoral and inguinal hernia?", doctors: "[👨‍⚕️ Dr. Awni, Dr. Omar]" },
            { id: "post-appendectomy-hernia", text: "Your patient developed a hernia after appendectomy, what type is it and why?", doctors: "[👨‍⚕️ Dr. Abdul Naser]" },
            { id: "umbilicus-bulging", text: "What are the causes of bulging or nodules of the umbilicus?", doctors: "[👨‍⚕️ General Question]" }
        ]},
        { subHeader: "🚀 1.5 Diabetic Foot, Ulcer, Sinus, Fistula & Cyst", questions: [
            { id: "diabetic-foot-case", caseHeader: "Case: Diabetic Foot", text: ["How do you take a history and examine the lower limb of a patient with a diabetic foot?", "What is the benefit of a general exam in a patient with a diabetic foot?", "What is the difference between the base and floor of an ulcer?", "How do you differentiate if an infection is in soft tissue vs. reaching the bone (osteomyelitis)?", "What antibiotics should be used for a diabetic foot?"], doctors: "[👨‍⚕️ Dr. Khalid Khairy, Dr. Khadeer, Dr. Yassir]" },
            { id: "neuropathic-vs-arterial-ulcer", text: "What is the difference between a neuropathic ulcer and an arterial ulcer?", doctors: "[👨‍⚕️ Dr. Ghasaq]" }
        ]},
        { subHeader: "🚀 1.6 GIT (Gastrointestinal)", questions: [], subGroups: [
            { subSubHeader: "1.6.9 The Gall Bladder and Bile Ducts", questions: [
                { id: "acute-cholecystitis", text: "What is the workup and management for a patient with acute cholecystitis?", doctors: "[👨‍⚕️ Dr. Jameel, Dr. Awni, Dr. Yassir]" },
                { id: "gallstone-complications", text: "What are the complications of gallstones? What is the fate of a gallstone?", doctors: "[👨‍⚕️ Dr. Hamed, Dr. Awni]" }
            ]},
            { subSubHeader: "1.6.10 The Pancreas", questions: [
                { id: "acute-pancreatitis", text: "What are the causes and management of acute pancreatitis?", doctors: "[👨‍⚕️ Dr. Thair, Dr. Salih, Dr. Jamal]" }
            ]},
            { subSubHeader: "1.6.14 The Appendix", questions: [
                { id: "acute-appendicitis-case", caseHeader: "Case: Acute Appendicitis (Long Case)", text: ["What are the neurological and urological differential diagnoses for acute appendicitis?", "Why does the pain shift from peri-umbilical to the RIF?", "What are the features of appendicitis on X-ray and Ultrasound?", "If all investigations are negative but the patient is in pain, what do you do? (Laparotomy)."], doctors: "[👨‍⚕️ Dr. Khadeer, Dr. Abdul Naser, Dr. Saighen, Dr. Thair, Dr. Mazin, Dr. Awni, Dr. Mohanad]" }
            ]},
            { subSubHeader: "1.6.16 Intestinal Obstruction", questions: [
                { id: "io-cardinal-features", text: "What are the cardinal features of intestinal obstruction (IO)?", doctors: "[👨‍⚕️ Dr. Khadeer]" },
                { id: "post-appendectomy-io", text: "What are the causes of intestinal obstruction in a patient post-appendectomy?", doctors: "[👨‍⚕️ Dr. Khadeer]" },
                { id: "anastomosis-vs-colostomy", text: "Why in small bowel obstruction do we do direct anastomosis, while in large bowel we often do a colostomy?", doctors: "[👨‍⚕️ Dr. Khadeer]" }
            ]}
        ]},
        { subHeader: "🚀 1.7 ATLS Principles", questions: [
            { id: "unconscious-trauma", text: "How do you manage an unconscious young male who presented to the ER after a trauma? (Focus on ABCs, cervical collar).", doctors: "[👨‍⚕️ Dr. Omar, Dr. Awni]" },
            { id: "gcs7-rta", text: "How do you manage a patient with a GCS of 7 after an RTA?", doctors: "[👨‍⚕️ Dr. Saleh]" },
            { id: "lucid-interval", text: "What is a 'lucid interval' and what does it signify?", doctors: "[👨‍⚕️ Dr. Fawzi]" }
        ]},
        { subHeader: "🚀 1.8 Breast", questions: [
            { id: "breast-cancer-case", caseHeader: "Case: Breast lump / Breast Cancer (Long Case)", text: ["What is the 'triple assessment'?", "How do you diagnose breast cancer by inspection and palpation?", "What are the complications of a modified radical mastectomy (e.g., nerve injuries, lymphedema)?", "How do you manage a case with metastases?", "Which stage is breast cancer with metastasis to the lung?"], doctors: "[👨‍⚕️ Dr. Awni, Dr. Mohanad, Dr. Nashwan]" }
        ]},
        { subHeader: "⚠️ 1.9 Thyroid/Endocrine Diseases", questions: [
            { id: "thyroidectomy-complications", text: "What are the complications of a thyroidectomy (hypocalcemia, hematoma, nerve injury)?", doctors: "[👨‍⚕️ Dr. Jamal, Dr. Firas Tariq]" },
            { id: "post-thyroidectomy-distress", text: "How do you manage a post-thyroidectomy patient with sudden respiratory distress or dyspnea?", doctors: "[👨‍⚕️ Dr. Jamal, Dr. Salih]" },
            { id: "ecg-hypo", text: "What are the ECG features of hypokalemia and hypocalcemia?", doctors: "[👨‍⚕️ Dr. Firas Tariq]" }
        ]},
        { subHeader: "🔹 1.10 Head and Neck", questions: [
            { id: "neck-lump-ddx", text: "What are the differential diagnoses and investigations for a neck lump?", doctors: "[👨‍⚕️ Dr. Basim]" },
            { id: "thyroglossal-cyst", text: "What is the embryology and operation for a thyroglossal cyst?", doctors: "[👨‍⚕️ Dr. Basim]" }
        ]}
    ]},
    "ortho": { title: "🚀 4.0 Orthopedics (25%)", groups: [
        { subHeader: "4.1-4.14 Fractures & Dislocations", questions: [
            { id: "compartment-syndrome", text: "What is compartment syndrome? What are its signs and detailed management?", doctors: "[👨‍⚕️ Dr. Firas Abdul Hameed, Dr. Firas Tariq]" },
            { id: "femoral-neck-fracture", text: "What is the classification and management of a femoral neck fracture?", doctors: "[👨‍⚕️ Dr. Firas Abdul Hameed]" },
            { id: "hip-dislocation", text: "What are the types of hip dislocation and which is most common?", doctors: "[👨‍⚕️ Dr. Firas Abdul Hameed]" },
            { id: "gustilo-classification", text: "Describe the Gustilo classification for open fractures.", doctors: "[👨‍⚕️ Dr. Omar]" }
        ]},
        { subHeader: "4.15 Nerve Injuries", questions: [
            { id: "sciatic-nerve-injury", text: "What are the signs of a sciatic nerve injury?", doctors: "[👨‍⚕️ Dr. Firas Abdul Hameed]" },
            { id: "long-thoracic-nerve-injury", text: "How do you test for a long thoracic nerve injury?", doctors: "[👨‍⚕️ Dr. Mohanad]" }
        ]}
    ]},
    "cardio": { title: "⚠️ 5.0 Cardiothoracic/Vascular Surgery (6%)", groups: [ { questions: [
        { id: "vascular-injury-management", text: "How do you manage a patient with a vascular injury? What are the 'hard signs'?", doctors: "[👨‍⚕️ Dr. Salih]" },
        { id: "limb-ischemia", text: "What are the signs of limb ischemia and its management?", doctors: "[👨‍⚕️ Dr. Saighen]" }
    ]}]},
    "neuro": { title: "⚠️ 6.0 Neurosurgery (3%)", groups: [ { questions: [
        { id: "icp-signs", text: "What are the signs and symptoms of increased intracranial pressure (ICP) and how is it managed?", doctors: "[👨‍⚕️ Dr. Jamal]" },
        { id: "depressed-skull-fracture", text: "What is the management for a patient with a depressed skull fracture and a lucid interval?", doctors: "[👨‍⚕️ Dr. Abdul Naser]" },
        { id: "trigeminal-sciatica", text: "Define trigeminal neuralgia and sciatica.", doctors: "[👨‍⚕️ Dr. Abdul Naser]" }
    ]}]},
    "plastic": { title: "⚠️ 8.0 Plastic and Reconstructive Surgery (2%)", groups: [ { questions: [
        { id: "burn-prognostic-factors", text: "What are the prognostic factors in a burn patient?", doctors: "[👨‍⚕️ Dr. Saighen]" },
        { id: "hemorrhagic-ovarian-cyst", text: "What is the management of a patient with a ruptured hemorrhagic ovarian cyst?", doctors: "[👨‍⚕️ Dr. Fawzi]" },
        { id: "cleft-lip-palate", text: "What are the types and management of cleft lip and palate?", doctors: "[👨‍⚕️ Dr. Saighen]" }
    ]}]},
    "urology": { title: "🔹 9.0 Urology (12%)", groups: [ { questions: [
        { id: "urological-appendicitis-mimic", text: "What are the urological causes that mimic appendicitis pain?", doctors: "[👨‍⚕️ Dr. Awni, Dr. Mohanad]" },
        { id: "blood-per-meatus-rta", text: "What is the management of a patient with blood per meatus who can't void after RTA?", doctors: "[👨‍⚕️ Dr. Mohanad]" },
        { id: "varicocele-grades", text: "Define varicocele, its grades, and its effect on fertility.", doctors: "[👨‍⚕️ Dr. Mohanad]" }
    ]}]}
};

document.addEventListener('DOMContentLoaded', function () {
    
    function buildQuestionHTML(q) {
        let questionTextHTML = Array.isArray(q.text)
            ? q.text.map(line => `<p class="question-text">${line}</p>`).join('')
            : `<p class="question-text">${q.text}</p>`;

        return `
            <div class="question-card" data-question-id="${q.id}">
                <div class="question-header">
                    ${q.caseHeader ? `<p class="case-header">${q.caseHeader}</p>` : ''}
                    ${questionTextHTML}
                    <p class="doctors">${q.doctors}</p>
                </div>
                <div class="answer-content">
                    <textarea class="note-box" placeholder="Your answer and notes here..."></textarea>
                </div>
            </div>`;
    }
    
    function populatePage() {
        for (const specialtyId in allQuestionsData) {
            const specialtyData = allQuestionsData[specialtyId];
            const section = document.getElementById(specialtyId);
            
            let sectionHTML = `<h2>${specialtyData.title}</h2>`;
            
            specialtyData.groups.forEach(group => {
                if (group.subHeader) sectionHTML += `<h3>${group.subHeader}</h3>`;
                group.questions.forEach(q => sectionHTML += buildQuestionHTML(q));
                
                if (group.subGroups) {
                    group.subGroups.forEach(subGroup => {
                        if (subGroup.subSubHeader) sectionHTML += `<h4>${subGroup.subSubHeader}</h4>`;
                        subGroup.questions.forEach(q => sectionHTML += buildQuestionHTML(q));
                    });
                }
            });
            section.innerHTML = sectionHTML;
        }
    }

    populatePage();

    // --- Core Application Logic ---
    const searchInput = document.getElementById('searchInput');
    const allCards = document.querySelectorAll('.question-card');
    const allNoteBoxes = document.querySelectorAll('.note-box');
    const clearNotesBtn = document.getElementById('clearNotesBtn');
    const backToTopBtn = document.getElementById('backToTopBtn');

    allCards.forEach(card => {
        card.dataset.originalHtml = card.querySelector('.question-header').innerHTML;
    });

    allCards.forEach(card => {
        card.querySelector('.question-header').addEventListener('click', () => {
            card.classList.toggle('active');
        });
    });

    function saveNote(element) {
        const id = element.closest('.question-card').dataset.questionId;
        if (id) localStorage.setItem(id, element.value);
    }

    function loadNotes() {
        allNoteBoxes.forEach(box => {
            const id = box.closest('.question-card').dataset.questionId;
            const savedNote = localStorage.getItem(id);
            if (savedNote) box.value = savedNote;
        });
    }

    allNoteBoxes.forEach(box => {
        box.addEventListener('input', () => saveNote(box));
    });

    clearNotesBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to delete ALL your saved notes? This action cannot be undone.')) {
            localStorage.clear();
            location.reload();
        }
    });

    function escapeRegex(string) {
        return string.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    }

    function performSearch() {
        const searchTerm = searchInput.value.toLowerCase().trim();
        const searchRegex = new RegExp(escapeRegex(searchTerm), 'gi');

        // Stage 1: Filter individual question cards and apply highlighting
        allCards.forEach(card => {
            const header = card.querySelector('.question-header');
            header.innerHTML = card.dataset.originalHtml; // Reset highlighting

            const cardText = card.textContent.toLowerCase();
            const isMatch = searchTerm === '' || cardText.includes(searchTerm);
            
            card.style.display = isMatch ? 'block' : 'none';

            if (isMatch && searchTerm !== '') {
                const newHtml = card.dataset.originalHtml.replace(searchRegex, match => `<mark>${match}</mark>`);
                header.innerHTML = newHtml;
            }
        });

        // Stage 2: Filter sub-headers (h3, h4) based on visible cards below them
        const subHeaders = document.querySelectorAll('.specialty-section h3, .specialty-section h4');
        subHeaders.forEach(header => {
            let element = header.nextElementSibling;
            let hasVisibleCard = false;
            while (element && !element.matches('h2, h3, h4')) {
                if (element.classList.contains('question-card') && element.style.display !== 'none') {
                    hasVisibleCard = true;
                    break;
                }
                element = element.nextElementSibling;
            }
            header.style.display = hasVisibleCard ? 'block' : 'none';
        });

        // Stage 3: Filter main specialty sections based on any visible content
        document.querySelectorAll('.specialty-section').forEach(section => {
            const isAnyCardVisible = section.querySelector('.question-card[style*="display: block"]');
            section.style.display = isAnyCardVisible ? 'block' : 'none';
        });
    }
    
    searchInput.addEventListener('input', performSearch);

    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            backToTopBtn.classList.add('show');
        } else {
            backToTopBtn.classList.remove('show');
        }
    });

    backToTopBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    loadNotes();
});