console.log("YapinPlus chargé avec succès ! 🚀");

// Fonction pour injecter le bouton dans la barre du haut
function injectYapinPlusButton() {
    // Évite de dupliquer le bouton si la page recharge certains éléments
    if (document.getElementById("yapin-plus-menu-btn")) return;

    // On cherche un conteneur adapté dans la barre du haut (près de la recherche)
    // Sur Discord-like, la barre supérieure contient souvent les icônes à droite
    const topBarRight = document.querySelector('div[class*="toolbar"]') || document.querySelector('header') || document.querySelector('input[placeholder*="Search"]')?.parentElement?.parentElement;

    if (!topBarRight) return;

    // Création du bouton aux couleurs de l'interface
    const menuBtn = document.createElement("button");
    menuBtn.id = "yapin-plus-menu-btn";
    menuBtn.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
        </svg>
        <span>YapinPlus</span>
    `;
    
    // Style pour qu'il s'intègre parfaitement avec le thème sombre du site
    menuBtn.style.cssText = `
        display: flex;
        align-items: center;
        gap: 6px;
        background-color: #5865F2;
        color: white;
        border: none;
        padding: 6px 12px;
        border-radius: 4px;
        font-size: 13px;
        font-weight: 500;
        cursor: pointer;
        margin-right: 10px;
        transition: background 0.2s;
    `;

    menuBtn.onmouseover = () => menuBtn.style.backgroundColor = '#4752C4';
    menuBtn.onmouseout = () => menuBtn.style.backgroundColor = '#5865F2';

    // Action au clic sur le bouton de l'extension
    menuBtn.onclick = () => {
        alert("Menu YapinPlus ouvert ! ⚙️");
        // Tu pourras ouvrir une modale ou un panneau ici plus tard
    };

    // Insertion du bouton avant la barre de recherche ou au début de la zone de droite
    const searchInput = document.querySelector('input[placeholder*="Search"]');
    if (searchInput && searchInput.parentElement) {
        searchInput.parentElement.before(menuBtn);
    } else {
        topBarRight.prepend(menuBtn);
    }
}

// Observer pour s'adapter aux changements de pages (les SPA chargent dynamiquement le contenu)
const observer = new MutationObserver(() => {
    injectYapinPlusButton();
});

observer.observe(document.body, { childList: true, subtree: true });

// Tentative immédiate au chargement
window.addEventListener("DOMContentLoaded", injectYapinPlusButton);
