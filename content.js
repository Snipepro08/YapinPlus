console.log("YapinPlus loaded successfully! 🚀");

// Configuration par défaut de l'extension
const DEFAULT_SETTINGS = {
    btnText: "YapinPlus",
    btnIcon: "⭐",
    useGradient: true,
    customColor: "#5865F2"
};

// Charger les paramètres sauvegardés ou utiliser les défauts
async function loadSettings() {
    return new Promise((resolve) => {
        chrome.storage.sync.get(DEFAULT_SETTINGS, (items) => {
            resolve(items);
        });
    });
}

// Injecter le bouton et les panneaux dans l'interface
async function initYapinPlus() {
    if (document.getElementById("yapin-plus-container")) return;

    const topBarRight = document.querySelector('div[class*="toolbar"]') || 
                        document.querySelector('header') || 
                        document.querySelector('input[placeholder*="Search"]')?.parentElement?.parentElement;

    if (!topBarRight) return;

    let settings = await loadSettings();

    // Conteneur principal pour le bouton et ses menus
    const container = document.createElement("div");
    container.id = "yapin-plus-container";
    container.style.cssText = `
        position: relative;
        display: flex;
        align-items: center;
        margin-right: 10px;
        font-family: inherit;
    `;

    // Création du bouton principal
    const menuBtn = document.createElement("button");
    menuBtn.id = "yapin-plus-menu-btn";
    
    function updateButtonStyle() {
        menuBtn.innerHTML = `<span style="font-size: 14px;">${settings.btnIcon}</span> <span>${settings.btnText}</span>`;
        if (settings.useGradient) {
            menuBtn.style.background = "linear-gradient(135deg, #ff7eb3, #ff758c, #ffb199, #4facfe, #00f2fe)";
            menuBtn.style.backgroundSize = "300% 300%";
            menuBtn.style.animation = "rainbowGradient 6s ease infinite";
        } else {
            menuBtn.style.background = settings.customColor;
            menuBtn.style.animation = "none";
        }
    }

    menuBtn.style.cssText = `
        display: flex;
        align-items: center;
        gap: 6px;
        color: white;
        border: none;
        padding: 6px 12px;
        border-radius: 6px;
        font-size: 13px;
        font-weight: 600;
        cursor: pointer;
        box-shadow: 0 2px 5px rgba(0,0,0,0.2);
        transition: transform 0.1s ease;
    `;
    updateButtonStyle();

    menuBtn.onmousedown = () => menuBtn.style.transform = "scale(0.96)";
    menuBtn.onmouseup = () => menuBtn.style.transform = "scale(1)";

    // Animation CSS pour le dégradé arc-en-ciel
    if (!document.getElementById("yapin-plus-styles")) {
        const styleSheet = document.createElement("style");
        styleSheet.id = "yapin-plus-styles";
        styleSheet.innerHTML = `
            @keyframes rainbowGradient {
                0% { background-position: 0% 50%; }
                50% { background-position: 100% 50%; }
                100% { background-position: 0% 50%; }
            }
            .yp-dropdown-menu {
                position: absolute;
                top: 40px;
                right: 0;
                width: 260px;
                background-color: #2f3136;
                color: #dcddde;
                border-radius: 8px;
                box-shadow: 0 8px 24px rgba(0,0,0,0.4);
                padding: 12px;
                display: none;
                flex-direction: column;
                gap: 10px;
                z-index: 9999;
                font-size: 13px;
                border: 1px solid #40444b;
            }
            .yp-dropdown-menu.open { display: flex; }
            .yp-dropdown-menu h4 { margin: 0 0 4px 0; color: #fff; font-size: 14px; border-bottom: 1px solid #40444b; padding-bottom: 4px; }
            .yp-dropdown-menu label { display: flex; justify-content: space-between; align-items: center; gap: 8px; cursor: pointer; }
            .yp-dropdown-menu input[type="text"], .yp-dropdown-menu input[type="color"] { background: #202225; border: 1px solid #4f545c; color: #fff; border-radius: 4px; padding: 4px 8px; width: 100px; }
            .yp-dropdown-menu button.yp-action-btn { background: #5865F2; color: white; border: none; padding: 6px; border-radius: 4px; cursor: pointer; font-weight: 500; text-align: center; }
            .yp-dropdown-menu button.yp-action-btn:hover { background: #4752C4; }
            .yp-dropdown-menu button.yp-reset-btn { background: #ed4245; }
            .yp-dropdown-menu button.yp-reset-btn:hover { background: #c03537; }
            .yp-debug-box { background: #202225; padding: 6px; border-radius: 4px; font-family: monospace; font-size: 11px; max-height: 80px; overflow-y: auto; color: #00ffcc; }
        `;
        document.head.appendChild(styleSheet);
    }

    // Création du Menu déroulant (Customisation & Debug)
    const dropdown = document.createElement("div");
    dropdown.className = "yp-dropdown-menu";
    dropdown.innerHTML = `
        <h4>⚙️ YapinPlus Settings</h4>
        
        <label>Text: <input type="text" id="yp-set-text" value="${settings.btnText}"></label>
        <label>Icon: <input type="text" id="yp-set-icon" value="${settings.btnIcon}"></label>
        <label>Rainbow Gradient: <input type="checkbox" id="yp-set-gradient" ${settings.useGradient ? "checked" : ""}></label>
        <label>Solid Color: <input type="color" id="yp-set-color" value="${settings.customColor}"></label>
        
        <button class="yp-action-btn" id="yp-save-btn">Save Changes</button>
        
        <h4>🛠️ Debug Menu</h4>
        <div class="yp-debug-box" id="yp-debug-info">
            URL: ${window.location.href}<br>
            Status: Active<br>
            UserAgent: ${navigator.userAgent.slice(0, 30)}...
        </div>

        <button class="yp-action-btn yp-reset-btn" id="yp-reset-btn">Reset Defaults</button>
    `;

    // Ouverture / Fermeture du menu au clic sur le bouton principal
    menuBtn.onclick = (e) => {
        e.stopPropagation();
        dropdown.classList.toggle("open");
    };

    // Fermer le menu si on clique en dehors
    document.addEventListener("click", (e) => {
        if (!container.contains(e.target)) {
            dropdown.classList.remove("open");
        }
    });

    container.appendChild(menuBtn);
    container.appendChild(dropdown);

    // Insertion dans la page
    const searchInput = document.querySelector('input[placeholder*="Search"]');
    if (searchInput && searchInput.parentElement) {
        searchInput.parentElement.before(container);
    } else {
        topBarRight.prepend(container);
    }

    // --- LOGIQUE DE SAUVEGARDE AUTOMATIQUE & BOUTONS ---
    
    const txtInput = dropdown.querySelector("#yp-set-text");
    const iconInput = dropdown.querySelector("#yp-set-icon");
    const gradCheckbox = dropdown.querySelector("#yp-set-gradient");
    const colorPicker = dropdown.querySelector("#yp-set-color");
    const saveBtn = dropdown.querySelector("#yp-save-btn");
    const resetBtn = dropdown.querySelector("#yp-reset-btn");
    const debugInfo = dropdown.querySelector("#yp-debug-info");

    // Fonction de sauvegarde synchrone/persistante
    function saveCurrentSettings() {
        settings.btnText = txtInput.value || "YapinPlus";
        settings.btnIcon = iconInput.value || "⭐";
        settings.useGradient = gradCheckbox.checked;
        settings.customColor = colorPicker.value;

        chrome.storage.sync.set(settings, () => {
            updateButtonStyle();
            debugInfo.innerHTML += `<br>[${new Date().toLocaleTimeString()}] Settings saved!`;
            debugInfo.scrollTop = debugInfo.scrollHeight;
        });
    }

    // Sauvegarde automatique lors des modifications des inputs
    txtInput.addEventListener("input", saveCurrentSettings);
    iconInput.addEventListener("input", saveCurrentSettings);
    gradCheckbox.addEventListener("change", saveCurrentSettings);
    colorPicker.addEventListener("input", saveCurrentSettings);

    // Bouton de sauvegarde explicite
    saveBtn.onclick = () => {
        saveCurrentSettings();
        alert("Settings saved successfully!");
    };

    // Bouton Reset (Remise à zéro)
    resetBtn.onclick = () => {
        if (confirm("Are you sure you want to reset settings to default?")) {
            chrome.storage.sync.set(DEFAULT_SETTINGS, () => {
                settings = { ...DEFAULT_SETTINGS };
                txtInput.value = settings.btnText;
                iconInput.value = settings.btnIcon;
                gradCheckbox.checked = settings.useGradient;
                colorPicker.value = settings.customColor;
                updateButtonStyle();
                alert("Settings have been reset.");
            });
        }
    };
}

// Observer pour maintenir le bouton même lors de la navigation interne (SPA)
const observer = new MutationObserver(() => {
    initYapinPlus();
});

observer.observe(document.body, { childList: true, subtree: true });

// Lancement initial
window.addEventListener("DOMContentLoaded", initYapinPlus);
setTimeout(initYapinPlus, 1500); // Sécurité supplémentaire au chargement complet
