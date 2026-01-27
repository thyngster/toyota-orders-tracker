(function() {
    // Toyota Tracker Extension
    
    let isMinimized = false;
    let savedOrderData = null;

    // DEBUG: Expose internal data for inspection
    window._toyotaTrackerDebug = {
        rawResponses: [],
        mergedData: null
    };
    
    console.log("%c Toyota Tracker: Debug Mode Ready. Check window._toyotaTrackerDebug", "color: #eb0a1e; font-weight: bold;");

    // CSS Constants
    const COLORS = {
        primary: '#eb0a1e', // Toyota Red
        dark: '#333333',
        light: '#f4f4f4',
        border: '#dddddd',
        white: '#ffffff',
        accent: '#e0e0e0'
    };

    const STYLES = {
        panel: `
            position: fixed; top: 60px; left: 50%; transform: translateX(-50%);
            width: 800px; max-height: 85vh; overflow-y: auto;
            background: ${COLORS.white}; border: 1px solid ${COLORS.border};
            box-shadow: 0 10px 40px rgba(0,0,0,0.2); border-radius: 8px;
            z-index: 99999; font-family: 'Toyota Type', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            color: ${COLORS.dark}; font-size: 13px; line-height: 1.5;
        `,
        header: `
            background: ${COLORS.light}; padding: 12px 20px; border-bottom: 1px solid ${COLORS.border};
            display: flex; justify-content: space-between; align-items: center;
            position: sticky; top: 0; z-index: 10; border-radius: 8px 8px 0 0;
        `,
        sectionHeader: `
            margin: 20px 0 10px 0; font-size: 14px; font-weight: 700;
            color: ${COLORS.dark}; text-transform: uppercase; border-bottom: 2px solid ${COLORS.primary}; padding-bottom: 4px;
        `,
        table: `width: 100%; border-collapse: collapse; margin-bottom: 15px;`,
        tdLabel: `
            background-color: ${COLORS.light}; width: 20%; font-weight: 600;
            padding: 8px; border: 1px solid ${COLORS.border}; color: #555;
        `,
        tdValue: `
            background-color: ${COLORS.white}; width: 30%;
            padding: 8px; border: 1px solid ${COLORS.border};
        `,
        btn: `
            cursor: pointer; border: none; background: transparent; 
            font-weight: bold; font-size: 16px; padding: 0 8px; color: #555;
        `
    };

    function clearExistingPanel() {
        const panel = document.getElementById('toyota-tracker-panel');
        const min = document.getElementById('toyota-tracker-minimized');
        if (panel) panel.remove();
        if (min) min.remove();
    }

    // Network Interceptor (Fetch API)
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
        const response = await originalFetch(...args);
        const clone = response.clone();
        const url = args[0] ? args[0].toString() : "";
        
        // Detects various API endpoints used by Toyota in different regions/versions
        if (url && (
            url.includes("vehicleOrderTracker") || 
            url.includes("/ordered/details/") || 
            url.includes("/my-toyota/api/") || 
            url.includes("/leads/v2/ordered")
        )) {
            clone.json().then(data => {
                let targetOrder = null;
                
                // Robust extraction logic for different API response shapes
                if (Array.isArray(data) && data.length > 0) targetOrder = data[0];
                else if (data.payload) targetOrder = Array.isArray(data.payload) ? data.payload[0] : data.payload;
                else if (data.currentStatus || data.orderDetails || data.id) targetOrder = data;

                if (targetOrder) {
                    processOrderData(targetOrder, data);
                }
            }).catch(() => {}); // Silent catch to prevent console spam
        }
        return response;
    };

    function processOrderData(order, rawFull) {
        // DEBUG: Capture raw data before processing
        window._toyotaTrackerDebug.rawResponses.push({
            timestamp: new Date().toISOString(),
            payload: rawFull
        });
        
        console.groupCollapsed("Toyota Tracker: New Data Intercepted");
        console.log("RAW Full Response:", rawFull);
        console.log("Extracted Order Object:", order);
        console.groupEnd();

        // Initialize state to prevent data loss on partial updates
        if (!savedOrderData) {
            savedOrderData = {
                orderId: "N/A", orderDate: "-", orderStatus: "-", 
                isComplete: false, isDelayed: false, damageCode: "-",
                callOffStatus: "-", currentStatus: "-", etaAvailable: false, estimatedDelivery: "-",
                brand: "-", vehicleModel: "-", modelCode: "-", engine: "-",
                suffix: "-", transmission: "-", color: "-", imageUrl: "", vin: "-",
                urn: "-", katashiki: "-", ssn: "-", nmsc: "-",
                dealerName: "-", dealerAddress1: "-", dealerAddress2: "", dealerCountry: "-",
                dealerCode: "-", dealerEmail: "-", dealerPhone: "-",
                intermediateDeliveries: [], convertedSteps: []
            };
        }

        const status = order.currentStatus || {};
        const dealer = order.dealerDetails || {};
        const details = order.orderDetails || {};
        const vehicle = order.vehicle || {};

        // Helper to only merge valid values
        const merge = (key, newVal) => {
            const invalid = [null, undefined, "", "N/A", "No disponible", "-", "Modelo Desconocido", "Desconocido"];
             if (newVal && !invalid.includes(newVal)) {
                 savedOrderData[key] = newVal;
             }
        };

        // Data Mapping
        merge('orderId', details.orderId || order.orderId || order.id);
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
        
        if (order.intermediateDeliveries && order.intermediateDeliveries.length > 0) {
            savedOrderData.intermediateDeliveries = order.intermediateDeliveries;
        }

        // Processing Map/Step logic for newer API versions
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
                "processedOrder": "Processed",
                "buildInProgress": "In Build",
                "leftTheFactory": "Left Factory",
                "inTransit": "In Transit",
                "arrivedAtRetailer": "At Dealer",
                "handover": "Handover"
             };

             savedOrderData.convertedSteps = modernMap.map((pt, index) => {
                    const stepData = stepsValues[index] || {};
                    const stepKey = stepsKeys[index] || pt.status;

                    return {
                        locationCode: STEP_TRANSLATIONS[stepKey] || stepKey,
                        locationName: stepData.location || (typeof pt.location === 'string' ? pt.location : "-"),
                        destinationType: pt.iconKey || stepData.iconKey || "-",
                        estimatedArrivalDate: pt.eventDate || pt.date || "-",
                        transportMethod: pt.iconKey || "-",
                        locationLatitude: pt.location ? pt.location.lat : pt.lat,
                        locationLongitude: pt.location ? pt.location.lng : pt.lng,
                        isVisited: (stepData.status || pt.status) === 'completed' || (stepData.status || pt.status) === 'current' ? 'Yes' : 'No'
                    };
             });
        }

        // Update global debug state with merged result
        window._toyotaTrackerDebug.mergedData = savedOrderData;

        if (!isMinimized) renderPanel(savedOrderData);
    }

    function renderPanel(data) {
        clearExistingPanel();
        isMinimized = false;

        const container = document.createElement('div');
        container.id = 'toyota-tracker-panel';
        container.style.cssText = STYLES.panel;

        const d = new Date();
        const timestamp = `${d.getDate()}/${d.getMonth()+1} @ ${d.getHours()}:${d.getMinutes()}`;

        let html = `
            <div style="${STYLES.header}">
                <span style="font-weight:700; color:${COLORS.primary};">TOYOTA TRACKER (Unofficial)</span>
                <div>
                    <button id="tt-min" style="${STYLES.btn}">&#8211;</button>
                    <button id="tt-close" style="${STYLES.btn}">&times;</button>
                </div>
            </div>
            <div style="padding: 20px;">
                <div style="font-size:11px; color:#888; margin-bottom:15px; text-align:right;">Last updated: ${timestamp}</div>
                
                <h2 style="${STYLES.sectionHeader}">Order Details</h2>
                <table style="${STYLES.table}">
                    <tr>
                        <td style="${STYLES.tdLabel}">Order ID</td>
                        <td style="${STYLES.tdValue}">${data.orderId}</td>
                        <td style="${STYLES.tdLabel}">Order Date</td>
                        <td style="${STYLES.tdValue}">${data.orderDate}</td>
                    </tr>
                    <tr>
                        <td style="${STYLES.tdLabel}">Order Status</td>
                        <td style="${STYLES.tdValue}"><strong>${data.orderStatus}</strong></td>
                        <td style="${STYLES.tdLabel}">Complete</td>
                        <td style="${STYLES.tdValue}">${data.isComplete ? "Yes" : "No"}</td>
                    </tr>
                    <tr>
                        <td style="${STYLES.tdLabel}">Estimated Delivery</td>
                        <td style="${STYLES.tdValue}" colspan="3">
                            <span style="color:${COLORS.primary}; font-weight:bold; font-size:1.1em;">
                                ${data.estimatedDelivery}
                            </span>
                        </td>
                    </tr>
                </table>

                <h2 style="${STYLES.sectionHeader}">Vehicle Information</h2>
                <table style="${STYLES.table}">
                    <tr>
                        <td style="${STYLES.tdLabel}">Model</td>
                        <td style="${STYLES.tdValue} font-weight:bold;">${data.vehicleModel}</td>
                        <td style="${STYLES.tdLabel}">Engine</td>
                        <td style="${STYLES.tdValue}">${data.engine}</td>
                    </tr>
                    <tr>
                        <td style="${STYLES.tdLabel}">Color</td>
                        <td style="${STYLES.tdValue}">
                            ${data.color} 
                            ${data.imageUrl ? `<a href="${data.imageUrl}" target="_blank" style="float:right; text-decoration:none;">📷</a>` : ''}
                        </td>
                        <td style="${STYLES.tdLabel}">VIN</td>
                        <td style="${STYLES.tdValue}">${data.vin}</td>
                    </tr>
                </table>

                <h2 style="${STYLES.sectionHeader}">Dealer</h2>
                <table style="${STYLES.table}">
                    <tr>
                        <td style="${STYLES.tdLabel}">Name</td>
                        <td style="${STYLES.tdValue}" colspan="3">${data.dealerName}</td>
                    </tr>
                    <tr>
                        <td style="${STYLES.tdLabel}">Contact</td>
                        <td style="${STYLES.tdValue}" colspan="3">
                            ${data.dealerPhone ? `📞 ${data.dealerPhone}` : ''} 
                            ${data.dealerEmail ? `✉️ ${data.dealerEmail}` : ''}
                        </td>
                    </tr>
                </table>
        `;

        // Logistics Map
        const stepsToRender = (data.intermediateDeliveries && data.intermediateDeliveries.length > 0) 
            ? data.intermediateDeliveries 
            : (data.convertedSteps || []);

        if (stepsToRender.length > 0) {
            html += `
                <h2 style="${STYLES.sectionHeader}">Logistics Journey</h2>
                <table style="width:100%; border-collapse:collapse; font-size:12px; border:1px solid #ccc;">
                    <thead style="background:#f9f9f9; text-align:left;">
                        <tr>
                            <th style="padding:8px; border-bottom:2px solid #ddd;">Status</th>
                            <th style="padding:8px; border-bottom:2px solid #ddd;">Location</th>
                            <th style="padding:8px; border-bottom:2px solid #ddd;">Date</th>
                            <th style="padding:8px; border-bottom:2px solid #ddd; text-align:center;">Map</th>
                        </tr>
                    </thead>
                    <tbody>
            `;

            stepsToRender.forEach(e => {
                const lat = e.locationLatitude || e.lat || 0;
                const lng = e.locationLongitude || e.lng || 0;
                const hasMap = (lat !== 0 && lng !== 0);
                const googleMapLink = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
                const rowStyle = e.isVisited === 'Yes' || e.isVisited === true ? '' : 'color:#999;';

                html += `
                    <tr style="border-bottom:1px solid #eee; ${rowStyle}">
                        <td style="padding:8px;">${e.locationCode || e.status || "-"}</td>
                        <td style="padding:8px;">${e.locationName || e.location || "-"}</td>
                        <td style="padding:8px;">${e.estimatedArrivalDate || e.eventDate || "-"}</td>
                        <td style="padding:8px; text-align:center;">
                            ${hasMap ? `<a href="${googleMapLink}" target="_blank" style="text-decoration:none;">📍</a>` : '-'}
                        </td>
                    </tr>
                `;
            });
            html += '</tbody></table>';
        }

        html += `
            <div style="margin-top: 20px; padding-top: 10px; border-top: 1px dashed #eee; text-align: right;">
                 <button id="tt-debug-btn" style="${STYLES.btn}; font-size:11px; color:#999;" title="Log raw JSON and merged data to console">🛠 Debug Data</button>
            </div>
        </div>`; // Close padding div
        container.innerHTML = html;
        document.body.appendChild(container);

        document.getElementById('tt-close').onclick = () => container.remove();
        document.getElementById('tt-min').onclick = () => showMinimizedPanel();
        
        document.getElementById('tt-debug-btn').onclick = () => {
             console.log("== TOYOTA TRACKER DEBUG ==");
             console.log("MERGED DATA (Displayed):", savedOrderData);
             console.log("RAW HISTORY:", window._toyotaTrackerDebug.rawResponses);
             alert("Data logged to console. Press F12 to view.");
        };
    }

    function showMinimizedPanel() {
        clearExistingPanel();
        isMinimized = true;

        const min = document.createElement('div');
        min.id = 'toyota-tracker-minimized';
        min.style.cssText = `
            position: fixed; top: 80px; right: 0;
            background: ${COLORS.primary}; color: white;
            padding: 12px 15px 12px 20px; font-weight:bold; cursor:pointer;
            z-index:99999; border-radius: 20px 0 0 20px; 
            box-shadow: -2px 2px 10px rgba(0,0,0,0.2); 
            font-family: sans-serif;
            transition: transform 0.2s;
        `;
        min.innerHTML = "🚗";
        min.title = "Open Toyota Tracker";
        min.onmouseover = () => min.style.transform = "translateX(-5px)";
        min.onmouseout = () => min.style.transform = "translateX(0)";
        min.onclick = () => { if(savedOrderData) renderPanel(savedOrderData); };
        document.body.appendChild(min);
    }
})();
