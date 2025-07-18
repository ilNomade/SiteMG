document.addEventListener('DOMContentLoaded', () => {
    // --- Selettori DOM ---
    const homeContainer = document.getElementById('home-container');
    const progettiContainer = document.getElementById('progetti-container');
    const projectDetailContainer = document.getElementById('project-detail-container');
    const draggables = document.querySelectorAll('.draggable');
    const iconsToSave = document.querySelectorAll('.draggable-icon');
    const bioPage = document.getElementById('page-bio');
    const closeButton = bioPage.querySelector('.close-button');
    const homeLinks = document.querySelectorAll('.home-link');
    const projectLinks = document.querySelectorAll('.project-item');
    const backToProjectsLink = document.querySelector('.back-to-projects');
    const articlePlaceholder = document.getElementById('article-content-placeholder');
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxCloseButton = document.querySelector('.lightbox-close-button');


    // --- Logica di Trascinamento ---
    let activeElement = null;
    let offsetX = 0, offsetY = 0, isDragging = false, startX, startY;

    function savePositions() {
        const positions = {};
        iconsToSave.forEach(icon => {
            positions[icon.id] = { left: icon.style.left, top: icon.style.top };
        });
        localStorage.setItem('iconPositions', JSON.stringify(positions));
    }

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

    draggables.forEach(elem => {
        elem.addEventListener('mousedown', startDrag);
        elem.addEventListener('touchstart', startDrag, { passive: false });
    });

    function startDrag(e) {
        activeElement = e.currentTarget;
        isDragging = false;

        // NUOVA LOGICA: Cambia l'immagine della cartella all'inizio del trascinamento
        if (activeElement.id === 'icon1') {
            const iconImage = activeElement.querySelector('img');
            if (iconImage) {
                iconImage.src = 'folderopen.png';
            }
        }

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
        const isTouchEvent = e.type === 'touchmove';
        const clientX = isTouchEvent ? e.touches[0].clientX : e.clientX;
        const clientY = isTouchEvent ? e.touches[0].clientY : e.clientY;
        if (!isDragging && (Math.abs(clientX - startX) > 5 || Math.abs(clientY - startY) > 5)) {
            isDragging = true;
            activeElement.classList.add('dragging');
        }
        if (isDragging) {
            activeElement.style.left = `${clientX - offsetX}px`;
            activeElement.style.top = `${clientY - offsetY}px`;
        }
    }

    function endDrag() {
        if (!activeElement) return;

        // NUOVA LOGICA: Ripristina l'immagine della cartella alla fine del trascinamento
        if (activeElement.id === 'icon1') {
            const iconImage = activeElement.querySelector('img');
            if (iconImage) {
                iconImage.src = 'folder.png';
            }
        }

        const isIcon = activeElement.classList.contains('draggable-icon');
        if (isIcon && !isDragging) {
            handleIconClick(activeElement.id);
        } else if (isIcon && isDragging) {
            savePositions();
        }
        activeElement.classList.remove('dragging');
        activeElement = null;
        document.removeEventListener('mousemove', drag);
        document.removeEventListener('mouseup', endDrag);
        document.removeEventListener('touchmove', drag);
        document.removeEventListener('touchend', endDrag);
    }

    // --- Logica di Navigazione ---
    function handleIconClick(iconId) {
        if (iconId === 'icon1') {
            showPage(progettiContainer);
        } else if (iconId === 'icon2') {
            bioPage.classList.add('visible');
        }
    }

    function showPage(pageToShow) {
        [homeContainer, progettiContainer, projectDetailContainer].forEach(p => p.classList.add('hidden'));
        pageToShow.classList.remove('hidden');
        pageToShow.scrollTop = 0;
    }

    closeButton.addEventListener('click', () => bioPage.classList.remove('visible'));

    homeLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            showPage(homeContainer);
        });
    });

    projectLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const projectId = link.dataset.projectId;
            loadProjectArticle(projectId);
        });
    });
    
    backToProjectsLink.addEventListener('click', (e) => {
        e.preventDefault();
        showPage(progettiContainer);
    });

    async function loadProjectArticle(projectId) {
        const filePath = `projects/${projectId}/index.html`;
        try {
            const response = await fetch(filePath);
            if (!response.ok) throw new Error('Network response was not ok.');
            
            const articleHtml = await response.text();
            articlePlaceholder.innerHTML = articleHtml;
            
            articlePlaceholder.querySelectorAll('img').forEach(img => {
                img.addEventListener('click', () => {
                    lightbox.classList.add('visible');
                    lightboxImg.src = img.src;
                });
            });

            showPage(projectDetailContainer);
        } catch (error) {
            console.error('Error fetching project article:', error);
            articlePlaceholder.innerHTML = `<p>Spiacenti, non è stato possibile caricare il progetto.</p>`;
            showPage(projectDetailContainer);
        }
    }

    // Logica per chiudere il Lightbox
    lightboxCloseButton.addEventListener('click', () => {
        lightbox.classList.remove('visible');
    });

    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) {
            lightbox.classList.remove('visible');
        }
    });


    // --- Inizializzazione ---
    loadPositions();
    const dragHint = document.getElementById('drag-hint');
    if (dragHint) {
        setTimeout(() => {
            dragHint.classList.add('fade-out');
        }, 5000);
    }
});
