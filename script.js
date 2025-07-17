// Seleziona gli elementi dal DOM
const draggables = document.querySelectorAll('.draggable');
const iconsToSave = document.querySelectorAll('.draggable-icon');
const bioPage = document.getElementById('page-bio');
const closeButton = bioPage.querySelector('.close-button');

// Variabili per la logica di trascinamento
let activeElement = null;
let offsetX = 0;
let offsetY = 0;

let isDragging = false;
let startX, startY;

// Funzione per salvare le posizioni solo delle icone persistenti
function savePositions() {
    const positions = {};
    iconsToSave.forEach(icon => {
        positions[icon.id] = {
            left: icon.style.left,
            top: icon.style.top
        };
    });
    localStorage.setItem('iconPositions', JSON.stringify(positions));
}

// Funzione per caricare le posizioni solo delle icone persistenti
function loadPositions() {
    const savedPositions = JSON.parse(localStorage.getItem('iconPositions'));
    if (savedPositions) {
        iconsToSave.forEach(icon => {
            if (savedPositions[icon.id]) {
                icon.style.left = savedPositions[icon.id].left;
                icon.style.top = savedPositions[icon.id].top;
            }
        });
    }
}

// Aggiunge gli event listener a ogni elemento trascinabile
draggables.forEach(elem => {
    elem.addEventListener('mousedown', startDrag);
    elem.addEventListener('touchstart', startDrag, { passive: false });
});

// Funzione che si attiva all'inizio del trascinamento
function startDrag(e) {
    activeElement = e.currentTarget;
    isDragging = false;

    const isTouchEvent = e.type === 'touchstart';
    const clientX = isTouchEvent ? e.touches[0].clientX : e.clientX;
    const clientY = isTouchEvent ? e.touches[0].clientY : e.clientY;

    startX = clientX;
    startY = clientY;

    offsetX = clientX - activeElement.offsetLeft;
    offsetY = clientY - activeElement.offsetTop;

    document.addEventListener('mousemove', drag);
    document.addEventListener('mouseup', endDrag);
    document.addEventListener('touchmove', drag, { passive: false });
    document.addEventListener('touchend', endDrag);
}

// Funzione che gestisce il movimento durante il trascinamento
function drag(e) {
    if (!activeElement) return;
    activeElement.classList.add('dragging');

    const isTouchEvent = e.type === 'touchmove';
    const clientX = isTouchEvent ? e.touches[0].clientX : e.clientX;
    const clientY = isTouchEvent ? e.touches[0].clientY : e.clientY;

    // Controlla se il movimento è abbastanza ampio da essere considerato un trascinamento
    if (Math.abs(clientX - startX) > 5 || Math.abs(clientY - startY) > 5) {
        isDragging = true;
    }

    let newX = clientX - offsetX;
    let newY = clientY - offsetY;

    activeElement.style.left = `${newX}px`;
    activeElement.style.top = `${newY}px`;
}

// Funzione che si attiva alla fine del trascinamento
function endDrag() {
    if (!activeElement) return;

    // Logica per il click (solo per le icone, non per il logo)
    if (!isDragging && activeElement.classList.contains('draggable-icon')) {
        if (activeElement.id === 'icon2') {
            bioPage.classList.add('visible');
        }
    }
    // Logica per il salvataggio della posizione (solo per le icone, non per il logo)
    else if (isDragging && activeElement.classList.contains('draggable-icon')) {
        savePositions();
    }

    activeElement.classList.remove('dragging');
    activeElement = null;

    document.removeEventListener('mousemove', drag);
    document.removeEventListener('mouseup', endDrag);
    document.removeEventListener('touchmove', drag);
    document.removeEventListener('touchend', endDrag);
}

// Aggiunge l'evento per chiudere la pagina della bio
closeButton.addEventListener('click', () => {
    bioPage.classList.remove('visible');
});

// Esegue il codice quando il contenuto della pagina è stato caricato
document.addEventListener('DOMContentLoaded', () => {
    // Carica le posizioni salvate
    loadPositions();

    // Gestisce l'indicazione "drag & drop"
    const dragHint = document.getElementById('drag-hint');
    if (dragHint) {
        // Imposta un timer per far scomparire l'indicazione dopo 5 secondi
        setTimeout(() => {
            dragHint.classList.add('fade-out');
        }, 5000); 
    }
});
