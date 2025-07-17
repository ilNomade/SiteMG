// Seleziona gli elementi dal DOM
const homeContainer = document.getElementById('home-container');
const progettiContainer = document.getElementById('progetti-container');
const draggables = document.querySelectorAll('.draggable');
const iconsToSave = document.querySelectorAll('.draggable-icon');
const bioPage = document.getElementById('page-bio');
const closeButton = bioPage.querySelector('.close-button');
const homeLinks = document.querySelectorAll('.home-link');

// Variabili per la logica di trascinamento
let activeElement = null;
let offsetX = 0;
let offsetY = 0;
let isDragging = false;
let startX, startY;

// Funzione per salvare le posizioni
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

// Funzione per caricare le posizioni
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

function drag(e) {
    if (!activeElement) return;
    activeElement.classList.add('dragging');

    const isTouchEvent = e.type === 'touchmove';
    const clientX = isTouchEvent ? e.touches[0].clientX : e.clientX;
    const clientY = isTouchEvent ? e.touches[0].clientY : e.clientY;

    if (Math.abs(clientX - startX) > 5 || Math.abs(clientY - startY) > 5) {
        isDragging = true;
    }

    let newX = clientX - offsetX;
    let newY = clientY - offsetY;

    activeElement.style.left = `${newX}px`;
    activeElement.style.top = `${newY}px`;
}

function endDrag() {
    if (!activeElement) return;

    const isIcon = activeElement.classList.contains('draggable-icon');

    // Logica per il click (solo per le icone)
    if (isIcon && !isDragging) {
        if (activeElement.id === 'icon1') { // Click su Progetti
            homeContainer.classList.add('hidden');
            progettiContainer.classList.remove('hidden');
        } else if (activeElement.id === 'icon2') { // Click su Bio
            bioPage.classList.add('visible');
        }
    }
    // Logica per il salvataggio della posizione (solo per le icone persistenti)
    else if (isIcon && isDragging) {
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

// Aggiunge l'evento per i link "home"
homeLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        progettiContainer.classList.add('hidden');
        homeContainer.classList.remove('hidden');
    });
});

// Esegue il codice quando il contenuto della pagina è stato caricato
document.addEventListener('DOMContentLoaded', () => {
    loadPositions();

    const dragHint = document.getElementById('drag-hint');
    if (dragHint) {
        setTimeout(() => {
            dragHint.classList.add('fade-out');
        }, 5000);
    }
});
