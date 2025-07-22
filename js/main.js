// ===== ESCENARIOS PARA APRENDER CON IA - JAVASCRIPT MEJORADO =====

// Variables globales
let currentProgress = 0;
let timerInterval = null;
let timeLeft = 300; // 5 minutos en segundos
let isTimerRunning = false;
let usedNumbers = [];
let currentPair = { slot1: null, slot2: null };

// ===== INICIALIZACIÓN =====
document.addEventListener('DOMContentLoaded', function() {
    // Ocultar loader después de 2 segundos
    setTimeout(() => {
        const loader = document.getElementById('loader');
        if (loader) {
            loader.classList.add('hidden');
        }
    }, 2000);

    // Inicializar funcionalidades
    initializeNavigation();
    initializeProgress();
    initializeSlotMachine();
    initializeTimer();
    initializeScrollEffects();
    
    // Cargar progreso guardado
    loadProgress();
});

// ===== NAVEGACIÓN PEGAJOSA =====
function initializeNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    
    // Manejar clics en navegación
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            scrollToSection(targetId);
            
            // Actualizar navegación activa
            updateActiveNavigation(this.dataset.section);
        });
    });

    // Detectar sección activa al hacer scroll
    window.addEventListener('scroll', throttle(updateNavigationOnScroll, 100));
}

function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        const navHeight = document.querySelector('.sticky-nav').offsetHeight;
        const targetPosition = section.offsetTop - navHeight - 20;
        
        window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
        });
    }
}

function updateActiveNavigation(activeSection) {
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.dataset.section === activeSection) {
            link.classList.add('active');
        }
    });
}

function updateNavigationOnScroll() {
    const sections = ['inicio', 'apertura', 'momento1', 'momento2', 'momento3', 'momento4'];
    const navHeight = document.querySelector('.sticky-nav').offsetHeight;
    const scrollPosition = window.scrollY + navHeight + 100;

    for (let i = sections.length - 1; i >= 0; i--) {
        const section = document.getElementById(sections[i]);
        if (section && section.offsetTop <= scrollPosition) {
            updateActiveNavigation(sections[i]);
            break;
        }
    }
}

// ===== SISTEMA DE PROGRESO =====
function initializeProgress() {
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', updateProgress);
    });
}

function updateProgress() {
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    const checkedBoxes = document.querySelectorAll('input[type="checkbox"]:checked');
    const progress = (checkedBoxes.length / checkboxes.length) * 100;
    
    // Actualizar barra de progreso
    const progressBar = document.getElementById('progressBar');
    const progressText = document.getElementById('progressText');
    
    if (progressBar) {
        progressBar.style.width = progress + '%';
    }
    
    if (progressText) {
        progressText.textContent = Math.round(progress) + '% completado';
    }
    
    // Guardar progreso
    saveProgress();
    
    // Mostrar notificación
    const lastChecked = document.querySelector('input[type="checkbox"]:checked:last-of-type');
    if (lastChecked) {
        const sectionName = getSectionName(lastChecked.id);
        showNotification(`¡${sectionName} completado!`, 'success');
    }
    
    // Confetti si se completa todo
    if (progress === 100) {
        triggerConfetti();
        showNotification('¡Felicitaciones! Has completado toda la experiencia', 'success');
    }
    
    currentProgress = progress;
}

function getSectionName(checkboxId) {
    const names = {
        'apertura-check': 'Apertura',
        'momento1-check': 'Momento 1',
        'momento2-check': 'Momento 2', 
        'momento3-check': 'Momento 3',
        'momento4-check': 'Momento 4'
    };
    return names[checkboxId] || 'Sección';
}

function saveProgress() {
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    const progressData = {};
    
    checkboxes.forEach(checkbox => {
        progressData[checkbox.id] = checkbox.checked;
    });
    
    localStorage.setItem('escenarios-ia-progress', JSON.stringify(progressData));
}

function loadProgress() {
    const savedProgress = localStorage.getItem('escenarios-ia-progress');
    if (savedProgress) {
        const progressData = JSON.parse(savedProgress);
        
        Object.keys(progressData).forEach(checkboxId => {
            const checkbox = document.getElementById(checkboxId);
            if (checkbox) {
                checkbox.checked = progressData[checkboxId];
            }
        });
        
        updateProgress();
    }
}

// ===== TRAGAMONEDAS ESTILO CASINO =====
function initializeSlotMachine() {
    // Cargar números usados del localStorage
    const savedUsedNumbers = localStorage.getItem('escenarios-ia-used-numbers');
    if (savedUsedNumbers) {
        usedNumbers = JSON.parse(savedUsedNumbers);
    }
    
    // Cargar pareja actual del localStorage
    const savedPair = localStorage.getItem('escenarios-ia-current-pair');
    if (savedPair) {
        currentPair = JSON.parse(savedPair);
        updateSlotDisplay();
        updateSelectedGroups();
    }
}

function spinSlot(slotNumber) {
    const slotElement = document.getElementById(`slot${slotNumber}`);
    const spinButton = document.getElementById(`spin${slotNumber}`);
    
    // Deshabilitar botón durante la animación
    spinButton.disabled = true;
    
    // Añadir animación de giro
    slotElement.classList.add('spinning');
    
    // Generar número aleatorio (excluyendo números usados)
    setTimeout(() => {
        const availableNumbers = [];
        for (let i = 1; i <= 18; i++) {
            if (!usedNumbers.includes(i)) {
                availableNumbers.push(i);
            }
        }
        
        if (availableNumbers.length === 0) {
            showNotification('¡Todos los grupos han sido utilizados!', 'warning');
            spinButton.disabled = false;
            slotElement.classList.remove('spinning');
            return;
        }
        
        const randomIndex = Math.floor(Math.random() * availableNumbers.length);
        const selectedNumber = availableNumbers[randomIndex];
        
        // Actualizar display
        currentPair[`slot${slotNumber}`] = selectedNumber;
        usedNumbers.push(selectedNumber);
        
        // Actualizar visual
        updateSlotDisplay();
        
        // Guardar estado
        saveSlotMachineState();
        
        // Verificar si se completó la pareja
        if (currentPair.slot1 !== null && currentPair.slot2 !== null) {
            updateSelectedGroups();
            showNotification(`¡Pareja formada: Grupo ${currentPair.slot1} - Grupo ${currentPair.slot2}!`, 'success');
            showReplacementControls();
        }
        
        // Remover animación y habilitar botón
        slotElement.classList.remove('spinning');
        spinButton.disabled = false;
        
    }, 500);
}

function updateSlotDisplay() {
    const slot1 = document.querySelector('#slot1 .slot-number');
    const slot2 = document.querySelector('#slot2 .slot-number');
    
    if (slot1) {
        slot1.textContent = currentPair.slot1 || '?';
    }
    
    if (slot2) {
        slot2.textContent = currentPair.slot2 || '?';
    }
}

function updateSelectedGroups() {
    const selectedGroupsContainer = document.getElementById('selectedGroups');
    
    if (currentPair.slot1 !== null && currentPair.slot2 !== null) {
        selectedGroupsContainer.innerHTML = `
            <div class="group-pair">
                <i class="fas fa-users"></i>
                Grupo ${currentPair.slot1} - Grupo ${currentPair.slot2}
            </div>
        `;
    } else {
        selectedGroupsContainer.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-dice"></i>
                <p>Gira los sectores para seleccionar grupos</p>
            </div>
        `;
    }
}

function showReplacementControls() {
    const replacementControls = document.getElementById('replacementControls');
    if (replacementControls) {
        replacementControls.style.display = 'block';
    }
}

function replaceGroup(slotNumber) {
    // Remover el número actual de los usados
    const currentNumber = currentPair[`slot${slotNumber}`];
    if (currentNumber !== null) {
        const index = usedNumbers.indexOf(currentNumber);
        if (index > -1) {
            usedNumbers.splice(index, 1);
        }
    }
    
    // Resetear el slot
    currentPair[`slot${slotNumber}`] = null;
    
    // Actualizar display
    updateSlotDisplay();
    updateSelectedGroups();
    
    // Ocultar controles de reemplazo
    const replacementControls = document.getElementById('replacementControls');
    if (replacementControls) {
        replacementControls.style.display = 'none';
    }
    
    // Guardar estado
    saveSlotMachineState();
    
    showNotification(`Grupo ${slotNumber} listo para nuevo sorteo`, 'info');
}

function saveSlotMachineState() {
    localStorage.setItem('escenarios-ia-used-numbers', JSON.stringify(usedNumbers));
    localStorage.setItem('escenarios-ia-current-pair', JSON.stringify(currentPair));
}

function resetSlotMachine() {
    usedNumbers = [];
    currentPair = { slot1: null, slot2: null };
    updateSlotDisplay();
    updateSelectedGroups();
    
    const replacementControls = document.getElementById('replacementControls');
    if (replacementControls) {
        replacementControls.style.display = 'none';
    }
    
    saveSlotMachineState();
    showNotification('Tragamonedas reiniciado', 'info');
}

// ===== CRONÓMETRO MEJORADO =====
function initializeTimer() {
    updateTimerDisplay();
}

function startTimer() {
    if (!isTimerRunning) {
        isTimerRunning = true;
        
        const startBtn = document.getElementById('startTimer');
        const pauseBtn = document.getElementById('pauseTimer');
        
        if (startBtn) startBtn.style.display = 'none';
        if (pauseBtn) pauseBtn.style.display = 'inline-flex';
        
        timerInterval = setInterval(() => {
            timeLeft--;
            updateTimerDisplay();
            updateTimerProgress();
            
            if (timeLeft <= 0) {
                completeTimer();
            }
        }, 1000);
        
        showNotification('Cronómetro iniciado', 'info');
    }
}

function pauseTimer() {
    if (isTimerRunning) {
        isTimerRunning = false;
        clearInterval(timerInterval);
        
        const startBtn = document.getElementById('startTimer');
        const pauseBtn = document.getElementById('pauseTimer');
        
        if (startBtn) startBtn.style.display = 'inline-flex';
        if (pauseBtn) pauseBtn.style.display = 'none';
        
        showNotification('Cronómetro pausado', 'warning');
    }
}

function resetTimer() {
    isTimerRunning = false;
    clearInterval(timerInterval);
    timeLeft = 300; // 5 minutos
    
    const startBtn = document.getElementById('startTimer');
    const pauseBtn = document.getElementById('pauseTimer');
    
    if (startBtn) startBtn.style.display = 'inline-flex';
    if (pauseBtn) pauseBtn.style.display = 'none';
    
    updateTimerDisplay();
    updateTimerProgress();
    
    showNotification('Cronómetro reiniciado', 'info');
}

function updateTimerDisplay() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    const display = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    
    const timerDisplay = document.getElementById('timerDisplay');
    if (timerDisplay) {
        timerDisplay.textContent = display;
    }
}

function updateTimerProgress() {
    const progress = ((300 - timeLeft) / 300) * 283; // 283 es la circunferencia del círculo
    const progressCircle = document.getElementById('timerProgress');
    
    if (progressCircle) {
        progressCircle.style.strokeDashoffset = 283 - progress;
        
        // Cambiar color según el tiempo restante
        if (timeLeft <= 60) {
            progressCircle.style.stroke = '#f44336'; // Rojo
        } else if (timeLeft <= 120) {
            progressCircle.style.stroke = '#ff9800'; // Naranja
        } else {
            progressCircle.style.stroke = '#4caf50'; // Verde
        }
    }
}

function completeTimer() {
    isTimerRunning = false;
    clearInterval(timerInterval);
    
    const startBtn = document.getElementById('startTimer');
    const pauseBtn = document.getElementById('pauseTimer');
    
    if (startBtn) startBtn.style.display = 'inline-flex';
    if (pauseBtn) pauseBtn.style.display = 'none';
    
    // Efectos de finalización
    triggerConfetti();
    showNotification('¡Tiempo completado! 🎉', 'success');
    
    // Sonido de finalización (opcional)
    playCompletionSound();
}

// ===== NOTIFICACIONES =====
function showNotification(message, type = 'info') {
    const notification = document.getElementById('notification');
    if (!notification) return;
    
    // Configurar colores según el tipo
    const colors = {
        success: '#4caf50',
        warning: '#ff9800',
        error: '#f44336',
        info: '#2196f3'
    };
    
    const icons = {
        success: 'fas fa-check-circle',
        warning: 'fas fa-exclamation-triangle',
        error: 'fas fa-times-circle',
        info: 'fas fa-info-circle'
    };
    
    notification.style.background = colors[type] || colors.info;
    notification.innerHTML = `
        <i class="${icons[type] || icons.info}"></i>
        ${message}
    `;
    
    // Mostrar notificación
    notification.classList.add('show');
    
    // Ocultar después de 3 segundos
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

// ===== CONFETTI =====
function triggerConfetti() {
    const canvas = document.getElementById('confetti-canvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    const confetti = [];
    const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7', '#dda0dd'];
    
    // Crear partículas de confetti
    for (let i = 0; i < 100; i++) {
        confetti.push({
            x: Math.random() * canvas.width,
            y: -10,
            vx: (Math.random() - 0.5) * 4,
            vy: Math.random() * 3 + 2,
            color: colors[Math.floor(Math.random() * colors.length)],
            size: Math.random() * 8 + 4,
            rotation: Math.random() * 360,
            rotationSpeed: (Math.random() - 0.5) * 10
        });
    }
    
    function animateConfetti() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        for (let i = confetti.length - 1; i >= 0; i--) {
            const particle = confetti[i];
            
            // Actualizar posición
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.rotation += particle.rotationSpeed;
            
            // Aplicar gravedad
            particle.vy += 0.1;
            
            // Dibujar partícula
            ctx.save();
            ctx.translate(particle.x, particle.y);
            ctx.rotate(particle.rotation * Math.PI / 180);
            ctx.fillStyle = particle.color;
            ctx.fillRect(-particle.size/2, -particle.size/2, particle.size, particle.size);
            ctx.restore();
            
            // Remover partículas que salen de la pantalla
            if (particle.y > canvas.height + 10) {
                confetti.splice(i, 1);
            }
        }
        
        if (confetti.length > 0) {
            requestAnimationFrame(animateConfetti);
        } else {
            // Limpiar canvas cuando termine
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
    }
    
    animateConfetti();
}

// ===== EFECTOS DE SCROLL =====
function initializeScrollEffects() {
    // Parallax suave para el hero
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const hero = document.querySelector('.hero');
        if (hero) {
            hero.style.transform = `translateY(${scrolled * 0.5}px)`;
        }
    });
    
    // Animaciones de entrada para las secciones
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // Observar todas las secciones
    document.querySelectorAll('.section').forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(30px)';
        section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(section);
    });
}

// ===== UTILIDADES =====
function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    }
}

function playCompletionSound() {
    // Crear un sonido simple usando Web Audio API
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime); // C5
        oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.1); // E5
        oscillator.frequency.setValueAtTime(783.99, audioContext.currentTime + 0.2); // G5
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);
    } catch (error) {
        console.log('Audio no disponible');
    }
}

// ===== FUNCIONES GLOBALES PARA HTML =====
window.scrollToSection = scrollToSection;
window.updateProgress = updateProgress;
window.spinSlot = spinSlot;
window.replaceGroup = replaceGroup;
window.resetSlotMachine = resetSlotMachine;
window.startTimer = startTimer;
window.pauseTimer = pauseTimer;
window.resetTimer = resetTimer;

// ===== MANEJO DE ERRORES =====
window.addEventListener('error', function(e) {
    console.error('Error en la aplicación:', e.error);
});

// ===== RESPONSIVE HELPERS =====
window.addEventListener('resize', () => {
    // Reajustar canvas de confetti
    const canvas = document.getElementById('confetti-canvas');
    if (canvas) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
});

// ===== DEBUG (solo en desarrollo) =====
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    window.debugFunctions = {
        resetProgress: () => {
            localStorage.removeItem('escenarios-ia-progress');
            localStorage.removeItem('escenarios-ia-used-numbers');
            localStorage.removeItem('escenarios-ia-current-pair');
            location.reload();
        },
        triggerConfetti: triggerConfetti,
        showNotification: showNotification
    };
    
    console.log('🎓 Escenarios para aprender con IA - Modo Debug');
    console.log('Funciones disponibles:', Object.keys(window.debugFunctions));
}

