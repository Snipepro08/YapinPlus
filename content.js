console.log("YapinPlus: Script started 🚀");

async function loadSettings() {
    return new Promise((resolve) => {
        chrome.storage.sync.get({
            btnText: "YapinPlus",
            btnIcon: "⭐",
            useGradient: true,
            customColor: "#5865F2"
        }, (items) => resolve(items));
    });
}

async function injectButton() {
    // Évite les doublons
    if (document.getElementById("yapin-plus-container")) return;

    let settings = await loadSettings();

    // Conteneur principal de l'extension
    const container = document.createElement("div");
    container.id = "yapin-plus-container";
    container.style.cssText = `
        position: relative;
        display: inline-flex;
        align-items: center;
        margin-left: 8px;
        margin-right: 8px;
        z-index: 99999;
    `;

    // Le bouton principal
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
        box-shadow: 0 2px 5px rgba(0,0,0,0.3);
    `;
    updateButtonStyle();

    // Styles CSS pour le menu et l'animation
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
                top: 42px;
                right: 0;
                width: 260px;
                background-color: #2f3136;
                color: #dcddde;
                border-radius: 8px;
                box-shadow: 0 8px 24px rgba(0,0,0,0.5);
                padding: 12px;
                display: none;
                flex-direction: column;
                gap: 10px;
                z-index: 100000;
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

    // Le menu déroulant de configuration
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
            Loaded: ${new Date().toLocaleTimeString()}
        </div>

        <button class="yp-action-btn yp-reset-btn" id="yp-reset-btn">Reset Defaults</button>
    `;

    menuBtn.onclick = (e) => {
        e.stopPropagation();
        dropdown.classList.toggle("open");
    };

    document.addEventListener("click", (e) => {
        if (!container.contains(e.target)) {
            dropdown.classList.remove("open");
        }
    });

    container.appendChild(menuBtn);
    container.appendChild(dropdown);

    // Recherche de la barre du haut (en haut à droite près des icônes de recherche/profil)
    // On cible les éléments typiques d'une barre de navigation Discord-like
    const targetArea = document.querySelector('div[class*="toolbar"]') || 
                       document.querySelector('header') || 
                       document.querySelector('input[placeholder*="Search"]')?.closest('div') ||
                       document.querySelector('div[class*="children"]');

    if (targetArea) {
        targetArea.appendChild(container);
    } else {
        // Solution de secours ultime : s'accrocher en haut à droite de l'écran en position fixe si la barre n'est pas trouvée
        container.style.position = "fixed";
        container.style.top = "10px";
        container.style.right = "20px";
        document.body.appendChild(container);
    }

    // Sauvegarde automatique et gestion des inputs
    const txtInput = dropdown.querySelector("#yp-set-text");
    const iconInput = dropdown.querySelector("#yp-set-icon");
    const gradCheckbox = dropdown.querySelector("#yp-set-gradient");
    const colorPicker = dropdown.querySelector("#yp-set-color");
    const saveBtn = dropdown.querySelector("#yp-save-btn");
    const resetBtn = dropdown.querySelector("#yp-reset-btn");
    const debugInfo = dropdown.querySelector("#yp-debug-info");

    function saveCurrentSettings() {
        settings.btnText = txtInput.value || "YapinPlus";
        settings.btnIcon = iconInput.value || "⭐";
        settings.useGradient = gradCheckbox.checked;
        settings.customColor = colorPicker.value;

        chrome.storage.sync.set(settings, () => {
            updateButtonStyle();
            debugInfo.innerHTML += `<br>Saved at ${new Date().toLocaleTimeString()}`;
            debugInfo.scrollTop = debugInfo.scrollHeight;
        });
    }

    txtInput.addEventListener("input", saveCurrentSettings);
    iconInput.addEventListener("input", saveCurrentSettings);
    gradCheckbox.addEventListener("change", saveCurrentSettings);
    colorPicker.addEventListener("input", saveCurrentSettings);

    saveBtn.onclick = () => {
        saveCurrentSettings();
        alert("Settings saved successfully!");
    };

    resetBtn.onclick = () => {
        if (confirm("Reset settings to default?")) {
            const defaults = { btnText: "YapinPlus", btnIcon: "⭐", useGradient: true, customColor: "#5865F2" };
            chrome.storage.sync.set(defaults, () => {
                settings = defaults;
                txtInput.value = settings.btnText;
                iconInput.value = settings.btnIcon;
                gradCheckbox.checked = settings.useGradient;
                colorPicker.value = settings.customColor;
                updateButtonStyle();
                alert("Reset complete.");
            });
        }
    };
}

// Observer pour relancer si l'interface se recharge
const observer = new MutationObserver(() => {
    if (!document.getElementById("yapin-plus-container")) {
        injectButton();
    }
});

observer.observe(document.body, { childList: true, subtree: true });

// Lancement
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", injectButton);
} else {
    setTimeout(injectButton, 1000);
}
