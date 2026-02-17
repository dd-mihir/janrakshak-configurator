/* ============================================================
   SECTION 1: IMAGE MAPPING
   ============================================================ */
    const IMAGE_MAP = {
        'sos_standard': { layerId: 'layer-sos', fileName: 'layer_sos.png' },

        'emergency_siren': { layerId: 'layer-siren', fileName: 'layer_siren_beacon.png' },
        'fire_ex_service': { layerId: 'layer-fire-ex', fileName: 'layer_fire_extinguisher.png' },
        'first_aid_service': { layerId: 'layer-first-aid', fileName: 'layer_first_aid_kit.png' },
        'common_request_btn': { layerId: 'layer-medical', fileName: 'layer_medical.png' },
        'aed_kit': { layerId: 'layer-aed', fileName: 'layer_aed_box.png' },
        'sos_extra': { layerId: 'layer-extra', fileName: 'layer_extra.png' },
        // Updated Advertising Mapping
        'led_28': { layerId: 'layer-led-28', fileName: 'layer_led_28in.png' },
        'led_56_dual': { layerId: 'layer-led-56', fileName: 'layer_led_56in_dual.png' },
        'backlight_boards': { layerId: 'layer-backlight', fileName: 'layer_backlight_board.png' },
        
        // CCTV Mapping (from previous step)
        'front_dome': { layerId: 'layer-cctv-front', fileName: 'layer_cctv_front_dome.png' },
        'side_domes': { layerId: 'layer-cctv-side', fileName: 'layer_cctv_side_domes.png' },
        'ptz_camera': { layerId: 'layer-cctv-ptz', fileName: 'layer_cctv_ptz.png' }
};


/* ============================================================
   SECTION 2: CORE STATE
   ============================================================ */

    const SHOW_PRICES = false; // Master Switch

    const VERSION_DATA = {
        'V4': { basePrice: 250000, imageFolder: 'v4/img/', baseImage: 'kiosk_base_v4.png' },
        'V5': { basePrice: 450000, imageFolder: 'v5/img/', baseImage: 'kiosk_base_v5.png' }
    };

    let currentBasePrice = 0;
    let currentImageFolder = '';

    const versionDependentGroups = document.querySelectorAll('.version-dependent');
    const visualPlaceholder = document.getElementById('visual-placeholder');
    const summaryDetails = document.getElementById('summary-details');
    const optionsTotalElement = document.getElementById('options-total');
    const totalPriceElement = document.getElementById('total-price');
    const basePriceElement = document.getElementById('base-price');
    const layerBase = document.getElementById('layer-base');
    const configurableElements = document.querySelectorAll('.selection-panel input, .selection-panel select');

/* ============================================================
   SECTION 3: LOGIC FUNCTIONS
   ============================================================ */

function handleVersionChange(version) {
    const mainContainer = document.querySelector('.selection-panel'); // Or your main wrapper
    
    // 1. Clean up existing classes
    mainContainer.classList.remove('state-v4', 'state-v5', 'state-none');

    if (!version) {
        // STATE: No version selected
        mainContainer.classList.add('state-none');
        visualPlaceholder.style.display = 'block';
        document.getElementById('kiosk-layers').style.display = 'none';
    } else {
        // STATE: Version selected (V4 or V5)
        mainContainer.classList.add(`state-${version.toLowerCase()}`);
        visualPlaceholder.style.display = 'none';
        document.getElementById('kiosk-layers').style.display = 'block';
        layerBase.style.display = 'block';

        // Update data
        currentBasePrice = VERSION_DATA[version].basePrice;
        updateLayerSources(VERSION_DATA[version].imageFolder, version);
        
        // Reset PTZ if switching to V5
        if (version === 'V5') {
            const ptzCheck = document.getElementById('ptz_camera');
            if (ptzCheck) ptzCheck.checked = false;
        }
    }
    
    updateConfiguration();
}


function updateLayerSources(folder, version) {
    currentImageFolder = folder;
    layerBase.src = folder + VERSION_DATA[version].baseImage;
    for (const key in IMAGE_MAP) {
        const mapEntry = IMAGE_MAP[key];
        const layerElement = document.getElementById(mapEntry.layerId);
        if (layerElement) layerElement.src = folder + mapEntry.fileName;
    }
}

function updateImageLayers() {
    // 1. Determine if any version (V4 or V5) is selected
    const anyVersionSelected = document.querySelector('input[name="kiosk_version"]:checked');
    
    // 2. Hide all optional layers first (Reset state)
    document.querySelectorAll('#kiosk-layers img:not(#layer-base)').forEach(img => {
        img.style.display = 'none';
    });

    // 3. If a version is selected, process the optional layers
    if (anyVersionSelected) {
        
        // --- HANDLE ALL CHECKBOXES (SOS, Medical, CCTV, Backlight) ---
        // This loops through all checkboxes and shows the corresponding IMAGE_MAP layer
        document.querySelectorAll('.selection-panel input[type="checkbox"]').forEach(input => {
            if (input.checked && IMAGE_MAP[input.id]) {
                const layer = document.getElementById(IMAGE_MAP[input.id].layerId);
                if (layer) {
                    layer.style.display = 'block';
                }
            }
        });

        // --- HANDLE SCREEN LOGIC (Select Dropdown) ---
        const ledScreenSelect = document.getElementById('led_screen_size');
        if (ledScreenSelect) {
            const ledValue = ledScreenSelect.value;
            if (ledValue === '24' && IMAGE_MAP.led_screen_24) {
                document.getElementById(IMAGE_MAP.led_screen_24.layerId).style.display = 'block';
            } else if (ledValue === '42' && IMAGE_MAP.led_screen_42) {
                document.getElementById(IMAGE_MAP.led_screen_42.layerId).style.display = 'block';
            }
        }
    }
}

function updateConfiguration() {
    let optionsTotal = 0;

    // 1. Get the selected version value
    const activeVersionRadio = document.querySelector('input[name="kiosk_version"]:checked');
    const activeVersion = activeVersionRadio ? activeVersionRadio.value : null;

    // --- FIX STARTS HERE ---
    // Define the Display Name (Example: Janrakshak V4)
    let displayName = activeVersion && VERSION_DATA[activeVersion] 
                      ? `Janrakshak ${activeVersion}` 
                      : "Janrakshak Kiosk";

    // Initialize HTML with a Header and the Version Name
    let summaryHTML = `<h3>${displayName}</h3>`;
    summaryHTML += '<ul>';
    // --- FIX ENDS HERE ---

    if (activeVersion && VERSION_DATA[activeVersion]) {
        currentBasePrice = VERSION_DATA[activeVersion].basePrice;
        
        // Add the Base Model as the first item in the list so it's visible
        summaryHTML += `<li><strong>Base Model (${activeVersion}):</strong> <span class="price-val">₹${currentBasePrice.toLocaleString()}</span></li>`;
    } else {
        currentBasePrice = 0;
    }

    if (activeVersion) {
        configurableElements.forEach(element => {
            if (element.type === 'checkbox' && element.checked) {
                const parentSection = element.closest('.version-dependent');
                
                if (!parentSection || parentSection.style.display !== 'none') {
                    const itemPrice = parseInt(element.dataset.price) || 0;
                    const itemLabel = element.labels[0] ? element.labels[0].textContent.split('+₹')[0].trim() : "Option";

                    optionsTotal += itemPrice;
                    summaryHTML += `<li>${itemLabel}: <span class="price-val">₹${itemPrice.toLocaleString()}</span></li>`;
                    
                    if (IMAGE_MAP[element.id]) {
                        const layer = document.getElementById(IMAGE_MAP[element.id].layerId);
                        if (layer) layer.style.display = 'block';
                    }
                }
            }
        });
        summaryHTML += '</ul>';
    } else {
        summaryHTML = '<p>Select a Kiosk Version to begin configuration.</p>';
    }
    /* --- UI UPDATES --- */

    // Update Price Visibility
    if (!SHOW_PRICES) {
        document.body.classList.add('hide-prices');
    } else {
        document.body.classList.remove('hide-prices');
    }
    
    // Update Summary List
    summaryDetails.innerHTML = (summaryHTML === '<ul></ul>' && activeVersion) 
        ? '<p>No options selected.</p>' 
        : summaryHTML;

        
    // CRITICAL: Update the display elements
    if (basePriceElement) {
        basePriceElement.textContent = `₹${currentBasePrice.toLocaleString()}`;
    }
    
    if (optionsTotalElement) {
        optionsTotalElement.textContent = `₹${optionsTotal.toLocaleString()}`;
    }
    
    const grandTotal = currentBasePrice + optionsTotal;
    if (totalPriceElement) {
        totalPriceElement.textContent = `₹${grandTotal.toLocaleString()}`;
    }
    
    // Sync Visuals
    updateImageLayers();
}

// Listeners
document.querySelectorAll('input[name="kiosk_version"]').forEach(radio => {
    radio.addEventListener('change', (e) => handleVersionChange(e.target.value));
});

configurableElements.forEach(el => {
    el.addEventListener('change', updateConfiguration);
    el.addEventListener('input', updateConfiguration);
});

document.addEventListener('DOMContentLoaded', () => handleVersionChange(null));


function downloadPDF() {
    // 1. Target the content DIV (this avoids printing the 'Summary' title if you want, 
    // or change to '.summary-panel' to include the title)
    const element = document.getElementById('summary-content'); 
    const btn = element.querySelector('.btn-primary');

    if (!element) {
        alert("Summary content not found!");
        return;
    }

    // 2. Hide the button so it doesn't show up in the PDF
    btn.style.display = 'none';

    const opt = {
        margin:       [10, 10],
        filename:     'Kiosk_Quote.pdf',
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2, letterRendering: true },
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    // 3. Generate PDF then show the button again
    html2pdf().set(opt).from(element).save().then(() => {
        btn.style.display = 'block';
    });
}

console.log("Groups found:", versionDependentGroups.length);


function open3D() {
    const modal = document.getElementById('modal-3d');
    const viewer = document.getElementById('kiosk-3d');
    const title = document.getElementById('modal-title');
    
    // 1. Find the radio button that is currently checked
    const selectedRadio = document.querySelector('input[name="kiosk_version"]:checked');
    
    if (selectedRadio) {
        const folder = selectedRadio.value; // Result: "v4" or "v5"
        
        // 2. Construct the path: folder/model.glb
        // Example: v4/model.glb
        const modelPath = folder + "/model.glb";
        
        // 3. Update the viewer and the text
        viewer.setAttribute('src', modelPath);
        title.innerText = "Janrakshak " + folder.toUpperCase();
        
        // 4. Show the overlay using flex (to keep everything centered)
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden'; 
        
        console.log("Loading 3D Model from: " + modelPath);
    } else {
        alert("Please select a version first.");
    }
}

function close3D() {
    const modal = document.getElementById('modal-3d');
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
}
