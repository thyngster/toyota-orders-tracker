(function() {
    console.log("Toyota Tracker: Script v3.0");

    // ==========================================
    // 1. ESTILOS Y UTILIDADES
    // ==========================================
    let isMinimized = false;
    let savedOrderData = null;

    // Estilos CSS inyectados para simular el look original pero dentro de nuestro panel
    const TABLE_STYLE = 'width:100%; border-collapse:collapse; border:1px solid #777; font-family:Arial, sans-serif; font-size:12px; margin-bottom:10px;';
    const TD_KEY_STYLE = 'background-color:#e0e0e0; padding:4px; font-weight:bold; width:20%; border:1px solid #777;';
    const TD_VAL_STYLE = 'background-color:#fff; padding:4px; border:1px solid #777; width:30%;';
    const HEADER_STYLE = 'margin:10px 0 5px 0; font-size:14px; font-weight:bold; color:#333; text-transform:uppercase; border-bottom:1px solid #eb0a1e;';

    function clearExistingPanel() {
        if (document.getElementById('toyota-tracker-panel')) document.getElementById('toyota-tracker-panel').remove();
        if (document.getElementById('toyota-tracker-minimized')) document.getElementById('toyota-tracker-minimized').remove();
    }

    // ==========================================
    // 2. INTERCEPTOR 
    // ==========================================
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
        const response = await originalFetch(...args);
        const clone = response.clone();
        const url = args[0] ? args[0].toString() : "";
        
        // AÑADIDO: Soporte para 'leads/v2/ordered'
        if (url && (
            url.includes("vehicleOrderTracker") || 
            url.includes("/ordered/details/") || 
            url.includes("/my-toyota/api/") || 
            url.includes("/leads/v2/ordered")
        )) {
            clone.json().then(data => {
                let targetOrder = null;
                // Lógica de extracción robusta
                if (Array.isArray(data) && data.length > 0) targetOrder = data[0];
                else if (data.payload) targetOrder = Array.isArray(data.payload) ? data.payload[0] : data.payload;
                else if (data.currentStatus || data.orderDetails || data.id) targetOrder = data; // data.id para el nuevo formato

                if (targetOrder) {
                    processOrderData(targetOrder, data);
                }
            }).catch(e => console.error("Toyota Tracker: JSON Error", e));
        }
        return response;
    };

    // ==========================================
    // 3. PROCESAMIENTO
    // ==========================================
    function processOrderData(order, rawFull) {
        
        // 1. Inicializar estructura base si es la primera vez (Estado Global)
        if (!savedOrderData) {
            savedOrderData = {
                orderId: "N/A", orderDate: "No disponible",
                orderStatus: "Desconocido", isComplete: false, isDelayed: false, damageCode: "Sin Daños",
                callOffStatus: "-", currentStatus: "-", etaAvailable: false, estimatedDelivery: "No disponible",
                brand: "Toyota", vehicleModel: "Modelo Desconocido", modelCode: "-", engine: "-",
                suffix: "-", transmission: "-", color: "-", imageUrl: "", vin: "No disponible",
                urn: "No disponible", katashiki: "No disponible", ssn: "No disponible", nmsc: "No disponible",
                dealerName: "No disponible", dealerAddress1: "-", dealerAddress2: "-", dealerCountry: "-",
                dealerCode: "-", dealerEmail: "-", dealerPhone: "-",
                intermediateDeliveries: [], convertedSteps: [], raw: {}
            };
        }

        const status = order.currentStatus || {};
        const dealer = order.dealerDetails || {};
        const details = order.orderDetails || {};
        const vehicle = order.vehicle || {};

        // 2. Función de Merge Inteligente
        // Solo sobrescribe si el nuevo valor es "bueno" y diferente de los valores por defecto "malos"
        const merge = (key, newVal, invalidList = [null, undefined, "", "N/A", "No disponible", "-", "Modelo Desconocido", "Desconocido"]) => {
             if (newVal && !invalidList.includes(newVal)) {
                 savedOrderData[key] = newVal;
             }
        };

        // 3. Mapeo de campos (Merge incremental)
        merge('orderId', details.orderId || order.orderId || order.id);
        // Aquí viene el fix principal: 'createdOn' suele venir en la llamada ligera, no lo borramos si la siguiente llamada no lo trae
        merge('orderDate', order.orderDate || order.associationDate || order.creationDate || order.createdOn); 
        
        merge('orderStatus', order.orderStatus || status.status);
        if (order.isComplete !== undefined) savedOrderData.isComplete = order.isComplete;
        if (status.status === "handover") savedOrderData.isComplete = true;

        if (status.isDelayed !== undefined) savedOrderData.isDelayed = status.isDelayed;
        merge('damageCode', status.damageCode);
        merge('callOffStatus', status.callOffStatus);
        merge('currentStatus', status.currentStatus || status.status);
        
        if (order.etaToFinalDestination || order.estimatedDeliveryToCustomer) savedOrderData.etaAvailable = true;
        merge('estimatedDelivery', order.estimatedDeliveryToCustomer || (order.eta && order.eta.estimatedDeliveryDate));

        merge('brand', details.brand || order.brand);
        merge('vehicleModel', details.vehicleModel || order.modelName || vehicle.modelName || order.alias);
        merge('modelCode', details.modelCode || vehicle.modelCode);
        merge('engine', details.engine || order.engine || order.hp);
        merge('suffix', details.suffix);
        merge('transmission', details.transmission);
        merge('color', details.vehicleExternalColor || vehicle.exteriorColor || order.color);
        merge('imageUrl', details.imageUrl || vehicle.imageUrl || order.imageUrl);
        merge('vin', details.vin || order.vin || order.displayVin || vehicle.vin);
        merge('urn', details.urn || order.urn);
        merge('katashiki', details.fullKatashiki || order.katashiki);
        merge('ssn', details.ssn || order.ssn);
        merge('nmsc', details.nmsc || order.nmsc);

        merge('dealerName', dealer.name);
        merge('dealerAddress1', dealer.address1);
        merge('dealerAddress2', dealer.address2);
        merge('dealerCountry', dealer.countryCode);
        merge('dealerCode', dealer.dealerCode);
        merge('dealerEmail', dealer.email);
        merge('dealerPhone', dealer.phone);
        
        // Merge Arrays (Solo si el nuevo tiene datos)
        if (order.intermediateDeliveries && order.intermediateDeliveries.length > 0) {
            savedOrderData.intermediateDeliveries = order.intermediateDeliveries;
        }

        // --- LÓGICA DE FUSIÓN (MAP + STEPS) ---
        // El usuario indica que 'map' y 'steps' son arrays paralelos (índice 0 con 0, 1 con 1...)
        let modernMap = [];
        if (order.preprocessed && order.preprocessed.map) modernMap = order.preprocessed.map;
        else if (status.map) modernMap = status.map;
        else if (order.map) modernMap = order.map;

        let stepsObj = {};
        if (order.preprocessed && order.preprocessed.steps) stepsObj = order.preprocessed.steps;
        else if (status.steps) stepsObj = status.steps;

        if (modernMap.length > 0) {
             const stepsValues = Object.values(stepsObj);
             const stepsKeys = Object.keys(stepsObj);
             
             const STEP_TRANSLATIONS = {
                "processedOrder": "Pedido Procesado",
                "buildInProgress": "En Fabricación",
                "leftTheFactory": "Salida de Fábrica",
                "inTransit": "En Tránsito",
                "arrivedAtRetailer": "En Concesionario",
                "handover": "Entregado"
             };

             savedOrderData.convertedSteps = modernMap.map((pt, index) => {
                    // 1. Datos GPS (vienen del objeto map)
                    const lat = pt.location ? pt.location.lat : pt.lat;
                    const lng = pt.location ? pt.location.lng : pt.lng;
                    
                    // 2. Datos Descriptivos (vienen del objeto steps por índice)
                    const stepData = stepsValues[index] || {};
                    const stepKey = stepsKeys[index] || pt.status;

                    // Nombre: Traducción o clave cruda
                    const displayName = STEP_TRANSLATIONS[stepKey] || stepKey;
                    
                    // Ubicación: Texto del step > Texto del map > "-"
                    const locationText = stepData.location || (typeof pt.location === 'string' ? pt.location : "-");

                    // Estado: Del step > Del map
                    const currentStatus = stepData.status || pt.status;
                    const isVisited = (currentStatus === 'completed' || currentStatus === 'current');

                    return {
                        locationCode: displayName, // Mostramos "En Fabricación" en la columna código
                        locationName: locationText, // "Toyota City..."
                        destinationType: pt.iconKey || stepData.iconKey || "-",
                        countryCode: "-",
                        estimatedArrivalDate: pt.eventDate || pt.date || "-",
                        leftLocationOn: "-",
                        transportMethod: pt.iconKey || "-",
                        locationLatitude: lat,
                        locationLongitude: lng,
                        isVisited: isVisited ? 'Si' : 'No'
                    };
             });
        }

        savedOrderData.raw = rawFull; // Actualizar último RAW para debug

        if (!isMinimized) renderClassicPanel(savedOrderData);
    }

    // ==========================================
    // 4. GENERACIÓN DE HTML 
    // ==========================================
    function renderClassicPanel(data) {
        clearExistingPanel();
        isMinimized = false;

        const container = document.createElement('div');
        container.id = 'toyota-tracker-panel';
        container.style.cssText = `
            position: fixed; 
            top: 50px; 
            left: 50%;
            transform: translateX(-50%);
            width: 800px; 
            background: white; 
            border: 2px solid #eb0a1e; 
            box-shadow: 0 0 50px rgba(0,0,0,0.5);
            z-index: 99999; 
            max-height: 90vh; 
            overflow-y: auto;
            color: #333;
            font-family: Arial, sans-serif;
        `;

        // Construcción de la Hora Actual
        const d = new Date();
        const ahora = `${d.getDate()}/${d.getMonth()+1}/${d.getFullYear()} @ ${d.getHours()}:${d.getMinutes()}:${d.getSeconds()}`;

        // Header con Botones
        let html = `
            <div style="background:#f4f4f4; padding:5px 10px; border-bottom:1px solid #ccc; display:flex; justify-content:space-between; align-items:center; position:sticky; top:0;">
                <span style="font-weight:bold; color:#eb0a1e;">Toyota Tracker v3.0</span>
                <div>
                    <button id="tt-min" style="cursor:pointer; padding:2px 8px;">_</button>
                    <button id="tt-close" style="cursor:pointer; padding:2px 8px;">X</button>
                </div>
            </div>
            <div style="padding:20px;">
        `;

        html += `
            <p style="color:red; font-size:12px; margin-top:0;"><strong>¡Atención! Esta pantalla es generada por la extensión (No oficial).</strong></p>
            <h2 style="${HEADER_STYLE}">Datos Pedido a fecha ${ahora}</h2>
            
            <table style="${TABLE_STYLE}">
                <tr>
                    <td style="${TD_KEY_STYLE}">ID Pedido</td>
                    <td style="${TD_VAL_STYLE}">${data.orderId}</td>
                </tr>
                <tr>
                    <td style="${TD_KEY_STYLE}">Fecha Formalización</td>
                    <td style="${TD_VAL_STYLE}">${data.orderDate}</td>
                </tr>
            </table>

            <hr style="border:0; border-top:1px solid #ccc; margin:15px 0;">

            <!-- ESTADO PEDIDO -->
            <table style="${TABLE_STYLE}">
                <tr>
                    <td style="${TD_KEY_STYLE}">Estado Pedido</td>
                    <td style="${TD_VAL_STYLE}">${data.orderStatus}</td>
                    <td style="${TD_KEY_STYLE}">Pedido Finalizado</td>
                    <td style="${TD_VAL_STYLE}">${data.isComplete ? "Si" : "No"}</td>
                </tr>
                <tr>
                    <td style="${TD_KEY_STYLE}">¿Está retrasado?</td>
                    <td style="${TD_VAL_STYLE}">${data.isDelayed ? "Si" : "No"}</td>
                    <td style="${TD_KEY_STYLE}">Código de daño</td>
                    <td style="${TD_VAL_STYLE}">${data.damageCode}</td>
                </tr>
                <tr>
                    <td style="${TD_KEY_STYLE}">callOffStatus</td>
                    <td style="${TD_VAL_STYLE}">${data.callOffStatus}</td>
                    <td style="${TD_KEY_STYLE}">Estado Actual</td>
                    <td style="${TD_VAL_STYLE}">${data.currentStatus}</td>
                </tr>
                <tr>
                    <td style="${TD_KEY_STYLE}">¿Entrega Asignada?</td>
                    <td style="${TD_VAL_STYLE}">${data.etaAvailable ? "Si" : "No"}</td>
                    <td style="${TD_KEY_STYLE}">Fecha Estimada</td>
                    <td style="${TD_VAL_STYLE} font-weight:bold; color:#d32f2f;">${data.estimatedDelivery}</td>
                </tr>
            </table>

            <hr style="border:0; border-top:1px solid #ccc; margin:15px 0;">

            <!-- VEHICULO -->
            <h2 style="${HEADER_STYLE}">Datos del Vehículo</h2>
            <table style="${TABLE_STYLE}">
                <tr>
                    <td style="${TD_KEY_STYLE}">Brand</td>
                    <td style="${TD_VAL_STYLE}">${data.brand}</td>
                    <td style="${TD_KEY_STYLE}">Modelo</td>
                    <td style="${TD_VAL_STYLE} font-weight:bold;">${data.vehicleModel}</td>
                </tr>
                <tr>
                    <td style="${TD_KEY_STYLE}">Codigo Modelo</td>
                    <td style="${TD_VAL_STYLE}">${data.modelCode}</td>
                    <td style="${TD_KEY_STYLE}">Motor</td>
                    <td style="${TD_VAL_STYLE}">${data.engine}</td>
                </tr>
                <tr>
                    <td style="${TD_KEY_STYLE}">Suffix / Puertas</td>
                    <td style="${TD_VAL_STYLE}">${data.suffix}</td>
                    <td style="${TD_KEY_STYLE}">Transmision</td>
                    <td style="${TD_VAL_STYLE}">${data.transmission}</td>
                </tr>
                <tr>
                    <td style="${TD_KEY_STYLE}">Color</td>
                    <td style="${TD_VAL_STYLE}">${data.color} ${data.imageUrl ? `<a href="${data.imageUrl}" target="_blank" style="color:blue;">[Ver Foto]</a>` : ''}</td>
                    <td style="${TD_KEY_STYLE}">VIN</td>
                    <td style="${TD_VAL_STYLE} font-weight:bold;">${data.vin}</td>
                </tr>
                <tr>
                    <td style="${TD_KEY_STYLE}">URN</td>
                    <td style="${TD_VAL_STYLE}">${data.urn}</td>
                    <td style="${TD_KEY_STYLE}">Katashiki</td>
                    <td style="${TD_VAL_STYLE}">${data.katashiki}</td>
                </tr>
                <tr>
                    <td style="${TD_KEY_STYLE}">SSN</td>
                    <td style="${TD_VAL_STYLE}">${data.ssn}</td>
                    <td style="${TD_KEY_STYLE}">NMSC</td>
                    <td style="${TD_VAL_STYLE}">${data.nmsc}</td>
                </tr>
            </table>

            <hr style="border:0; border-top:1px solid #ccc; margin:15px 0;">

            <!-- CONCESIONARIO -->
            <h2 style="${HEADER_STYLE}">Datos Concesionario</h2>
            <table style="${TABLE_STYLE}">
                <tr>
                    <td style="${TD_KEY_STYLE}">Nombre</td>
                    <td colspan="3" style="${TD_VAL_STYLE}">${data.dealerName}</td>
                </tr>
                <tr>
                    <td style="${TD_KEY_STYLE}">Direccion</td>
                    <td style="${TD_VAL_STYLE}">${data.dealerAddress1} ${data.dealerAddress2}</td>
                    <td style="${TD_KEY_STYLE}">Pais</td>
                    <td style="${TD_VAL_STYLE}">${data.dealerCountry}</td>
                </tr>
                <tr>
                    <td style="${TD_KEY_STYLE}">Dealer Code</td>
                    <td style="${TD_VAL_STYLE}">${data.dealerCode}</td>
                    <td style="${TD_KEY_STYLE}">Contacto</td>
                    <td style="${TD_VAL_STYLE}">${data.dealerEmail} <br> ${data.dealerPhone}</td>
                </tr>
            </table>

            <hr style="border:0; border-top:1px solid #ccc; margin:15px 0;">
        `;

        // TABLA DE PASOS (Steps)
        const stepsToRender = (data.intermediateDeliveries && data.intermediateDeliveries.length > 0) 
            ? data.intermediateDeliveries 
            : (data.convertedSteps || []);

        if (stepsToRender.length === 0) {
            html += `<h2 style="${HEADER_STYLE}">El pedido aún no tiene pasos registrados.</h2>`;
        } else {
            html += `
                <h2 style="${HEADER_STYLE}">Pasos del Pedido (Ruta Logística)</h2>
                <table style="width:100%; border-collapse:collapse; font-size:11px; border:1px solid #ccc;">
                    <tr style="background-color:LightGray; font-weight:bold; text-align:left;">
                        <th style="padding:5px; border:1px solid #999;">Código</th>
                        <th style="padding:5px; border:1px solid #999;">Nombre / Ubicación</th>
                        <th style="padding:5px; border:1px solid #999;">Tipo</th>
                        <th style="padding:5px; border:1px solid #999;">Fecha</th>
                        <th style="padding:5px; border:1px solid #999;">Transp.</th>
                        <th style="padding:5px; border:1px solid #999;">Lat</th>
                        <th style="padding:5px; border:1px solid #999;">Long</th>
                        <th style="padding:5px; border:1px solid #999;">Visitado</th>
                    </tr>
            `;

            stepsToRender.forEach(e => {
                // Preparamos enlace a mapas si hay coordenadas
                const lat = e.locationLatitude || e.lat || 0;
                const lng = e.locationLongitude || e.lng || 0;
                const hasMap = (lat !== 0 && lng !== 0);
                const googleMapLink = hasMap ? `https://www.google.com/maps/search/?api=1&query=${lat},${lng}` : null;
                
                const latDisplay = hasMap && googleMapLink ? `<a href="${googleMapLink}" target="_blank" style="color:blue;">${lat}</a>` : (lat || "-");
                const lngDisplay = hasMap && googleMapLink ? `<a href="${googleMapLink}" target="_blank" style="color:blue;">${lng}</a>` : (lng || "-");

                html += `
                    <tr>
                        <td style="padding:4px; border:1px solid #ccc;">${e.locationCode || e.status || "-"}</td>
                        <td style="padding:4px; border:1px solid #ccc;">${e.locationName || e.location || "-"}</td>
                        <td style="padding:4px; border:1px solid #ccc;">${e.destinationType || "-"}</td>
                        <td style="padding:4px; border:1px solid #ccc;">${e.estimatedArrivalDate || e.eventDate || "-"}</td>
                        <td style="padding:4px; border:1px solid #ccc;">${e.transportMethod || "-"}</td>
                        <td style="padding:4px; border:1px solid #ccc;">${latDisplay}</td>
                        <td style="padding:4px; border:1px solid #ccc;">${lngDisplay}</td>
                        <td style="padding:4px; border:1px solid #ccc;">${e.isVisited}</td>
                    </tr>
                `;
            });
            html += '</table>';
        }

        html += `
            <div style="margin-top:20px; text-align:right;">
                <button onclick="(() => { const el = document.getElementById('tt-debug-ta'); el.style.display = el.style.display==='none'?'block':'none'; })()" style="font-size:10px;">🔍 DEBUG JSON</button>
                <textarea id="tt-debug-ta" style="display:none; width:100%; height:150px; font-size:10px; font-family:monospace; margin-top:5px;">${JSON.stringify(data.raw, null, 2)}</textarea>
            </div>
            </div>`;

        container.innerHTML = html;
        document.body.appendChild(container);

        // Handlers
        document.getElementById('tt-close').onclick = () => container.remove();
        document.getElementById('tt-min').onclick = () => showMinimizedPanel();
    }

    function showMinimizedPanel() {
        clearExistingPanel();
        isMinimized = true;

        const min = document.createElement('div');
        min.id = 'toyota-tracker-minimized';
        min.style.cssText = `
            position: fixed; top: 10px; right: 10px;
            background: #eb0a1e; color: white;
            padding: 10px 20px; font-weight:bold; cursor:pointer;
            z-index:99999; border-radius:4px; box-shadow:0 2px 5px rgba(0,0,0,0.3);
        `;
        min.innerText = "🚗 Abrir Toyota Tracker";
        min.onclick = () => { if(savedOrderData) renderClassicPanel(savedOrderData); };
        document.body.appendChild(min);
    }
    
})();