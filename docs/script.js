/* ------------------------------------------------------------------------
 * DEMO AUTH LAYER (mockup only, for a competition prototype).
 *
 * There is no server, no database, and no real authentication anywhere in
 * this project. "Logging in" only checks the email against two hardcoded
 * demo addresses (see login.html) and stores which tier that maps to
 * ("free" or "premium") in sessionStorage under "ibis_role". Any code that
 * reads this value, whether it's the nav, dashboard.html's access gate, or
 * the map popups, is trusting the browser's own sessionStorage, which any visitor
 * can edit via devtools. That's fine for a demo; it must never be treated
 * as a security boundary in a real deployment.
 * ------------------------------------------------------------------------ */

function getDemoRole() {
    return sessionStorage.getItem('ibis_role');
}

function initNavAuth() {
    const guestLinks = document.querySelectorAll('.nav-auth--guest');
    const userLinks = document.querySelectorAll('.nav-auth--user');
    const role = getDemoRole();

    guestLinks.forEach(li => { li.hidden = Boolean(role); });
    userLinks.forEach(li => { li.hidden = !role; });

    const logoutLink = document.getElementById('nav-logout');
    if (logoutLink) {
        logoutLink.addEventListener('click', (e) => {
            e.preventDefault();
            sessionStorage.removeItem('ibis_role');
            location.href = 'index.html';
        });
    }
}

function initNavbar() {
    const hamburger = document.querySelector('.hamburger');
    const menu = document.querySelector('.menu');
    const navbar = document.querySelector('.navbar');

    hamburger.addEventListener('click', () => {
        const isOpen = menu.classList.toggle('open');
        hamburger.classList.toggle('active');
        hamburger.setAttribute('aria-expanded', String(isOpen));
    })

    document.querySelectorAll('.menu a').forEach(link => {
        link.addEventListener('click', () => {
            menu.classList.remove('open');
            hamburger.classList.remove('active');
            hamburger.setAttribute('aria-expanded', 'false');
        })
    })

    window.addEventListener('scroll', () => {
        navbar.classList.toggle('scrolled', window.scrollY > 10);
    })

    const currentPage = location.pathname.split('/').pop() || 'index.html';

    document.querySelectorAll('.menu a').forEach(link => {
        if (link.getAttribute('href') === currentPage) {
            link.classList.add('active');
        }
    })

    initNavAuth();
}

fetch('nav.html')
    .then(response => response.text())
    .then(html => {
        document.getElementById('navbar-placeholder').innerHTML = html;
        initNavbar();
    });

fetch('footer.html')
    .then(response => response.text())
    .then(html => {
        document.getElementById('footer-placeholder').innerHTML = html;
    });

const productTabs = document.querySelectorAll('.product-tab');

productTabs.forEach(tab => {
    tab.addEventListener('click', () => {
        productTabs.forEach(t => {
            t.classList.remove('btn-primary');
            t.classList.add('btn-secondary');
            t.setAttribute('aria-selected', 'false');
        });
        tab.classList.remove('btn-secondary');
        tab.classList.add('btn-primary');
        tab.setAttribute('aria-selected', 'true');

        document.querySelectorAll('.product-panel').forEach(panel => {
            panel.hidden = panel.id !== tab.dataset.target;
        });
    });
})

/* ------------------------------------------------------------------------
 * Demo login form (login.html only). Two hardcoded demo accounts, shown
 * directly on the page. See the DEMO AUTH LAYER comment above for what
 * this does and doesn't do.
 * ------------------------------------------------------------------------ */
const DEMO_ACCOUNTS = {
    'free@i-bis.com': 'free',
    'premium@i-bis.com': 'premium',
};

const loginForm = document.querySelector('.login-form');

if (loginForm) {
    const loginError = document.getElementById('login-error');

    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const email = loginForm.elements['email'].value.trim().toLowerCase();
        const role = DEMO_ACCOUNTS[email];

        if (!role) {
            loginError.textContent = 'Unrecognized demo account. Use one of the two email addresses shown above (any password works).';
            loginError.hidden = false;
            return;
        }

        sessionStorage.setItem('ibis_role', role);
        location.href = 'dashboard.html';
    });
}

/* ------------------------------------------------------------------------
 * Demo dashboard map (dashboard.html only). Everything below (the station
 * list, the sensor readings, the fish counts, the i-BUSS movement) is
 * simulated for this prototype. There is no live sensor feed, no device
 * telemetry, and no database; dashboard.html's inline access-gate script
 * already stops this from rendering for anyone without a demo role set.
 * ------------------------------------------------------------------------ */
const mapEl = document.getElementById('map');

if (mapEl) {
    const role = getDemoRole() || 'free';

    const roleBadge = document.getElementById('dashboard-role-badge');
    if (roleBadge) {
        roleBadge.textContent = 'Plan: ' + (role === 'premium' ? 'Premium' : 'Free');
        roleBadge.classList.toggle('dashboard-role-badge--premium', role === 'premium');
        roleBadge.classList.toggle('dashboard-role-badge--free', role !== 'premium');
    }

    const upgradePrompt = document.getElementById('upgrade-prompt');
    if (upgradePrompt) {
        upgradePrompt.hidden = role !== 'free';
    }

    // Approximate real-world points along the Ciliwung River in Jakarta,
    // Indonesia (this project's original problem statement river), used
    // here purely as plausible demo station locations. There is no actual
    // deployed hardware at these coordinates.
    const rand = (min, max, decimals = 1) => Number((Math.random() * (max - min) + min).toFixed(decimals));

    function generateDemoReadings() {
        // Heavy-metal panel is Pb2+, Cd2+ and Hg2+ only, matching the ASV
        // biosensor spec this prototype is based on. Reported in mg/kg to
        // match the EU 2023/915 maximum-levels framing used in the
        // underlying research; these are illustrative demo ranges, not
        // the literal regulatory limits.
        const leadPb = rand(0.001, 0.08, 3);
        const cadmiumCd = rand(0.0005, 0.02, 3);
        const mercuryHg = rand(0.001, 0.1, 3);
        const turbidity = rand(2, 40, 1);
        const fishSpecies = {
            Tilapia: Math.floor(rand(5, 45, 0)),
            Catfish: Math.floor(rand(2, 27, 0)),
            Carp: Math.floor(rand(1, 16, 0)),
        };

        return {
            ph: rand(6.5, 8, 1),
            dissolvedOxygen: rand(4, 9, 1),
            turbidity,
            temperature: rand(24, 31, 1),
            leadPb,
            cadmiumCd,
            mercuryHg,
            fishSpecies,
        };
    }

    const stations = [
        { id: 'iris-a', name: 'i-RIS Unit A', type: 'iris', lat: -6.2834, lon: 106.8487 },
        { id: 'iris-b', name: 'i-RIS Unit B', type: 'iris', lat: -6.2246, lon: 106.8636 },
        { id: 'iris-c', name: 'i-RIS Unit C', type: 'iris', lat: -6.2088, lon: 106.8456 },
        { id: 'ibuss-1', name: 'i-BUSS Unit 1', type: 'ibuss', lat: -6.1995, lon: 106.8495 },
    ].map(station => ({ ...station, readings: generateDemoReadings() }));

    const ibussStation = stations.find(s => s.type === 'ibuss');
    const ibussHome = { lat: ibussStation.lat, lon: ibussStation.lon };

    /* ------------------------------------------------------------------
     * Station classification, shared by the Leaflet popups and the
     * Station Status cards below so the two views never contradict each
     * other. Every threshold here is an illustrative demo cutoff, not a
     * real water-quality or EU 2023/915 regulatory value used verbatim.
     * ------------------------------------------------------------------ */
    function classifyWaterQuality(r) {
        // Dissolved oxygen below 5 mg/L is a poor reading for freshwater fish.
        const doLevel = r.dissolvedOxygen < 5 ? 'Low' : 'High';
        // A healthy freshwater pH band is roughly 6.5 to 8.5.
        const phLevel = (r.ph < 6.5 || r.ph > 8.5) ? 'Low' : 'High';
        // Turbidity above 25 NTU reads as visibly cloudy water (High is bad here).
        const turbidityLevel = r.turbidity > 25 ? 'High' : 'Low';
        // Above 29C is treated as heat-stress range for river fish in this demo (High is bad here).
        const temperatureLevel = r.temperature > 29 ? 'High' : 'Low';

        const badCount = [doLevel === 'Low', phLevel === 'Low', turbidityLevel === 'High', temperatureLevel === 'High']
            .filter(Boolean).length;
        const status = badCount === 0 ? 'SAFE' : badCount === 1 ? 'CAUTION' : 'UNSAFE';

        return { doLevel, phLevel, turbidityLevel, temperatureLevel, status };
    }

    function classifyMetals(r) {
        // Pb, Cd and Hg cutoffs loosely modeled on the EU 2023/915
        // maximum-levels framing for heavy metals in fish tissue (mg/kg).
        // High is the bad direction for all three.
        const pbLevel = r.leadPb > 0.05 ? 'High' : 'Low';
        const cdLevel = r.cadmiumCd > 0.01 ? 'High' : 'Low';
        const hgLevel = r.mercuryHg > 0.06 ? 'High' : 'Low';

        const badCount = [pbLevel === 'High', cdLevel === 'High', hgLevel === 'High'].filter(Boolean).length;
        const status = badCount === 0 ? 'SAFE' : badCount === 1 ? 'CAUTION' : 'UNSAFE';

        return { pbLevel, cdLevel, hgLevel, status };
    }

    function classifyFish(r) {
        const fishDensity = Object.values(r.fishSpecies).reduce((sum, n) => sum + n, 0);
        // Fewer than 30 observed fish across all species reads as a
        // sparse population for this demo baseline.
        const fishLevel = fishDensity < 30 ? 'Low' : 'High';
        const status = fishLevel === 'High' ? 'SAFE' : 'CAUTION';

        return { fishLevel, fishDensity, status };
    }

    const STATUS_SEVERITY = { SAFE: 0, CAUTION: 1, UNSAFE: 2 };
    const STATUS_COLORS = { SAFE: '#2E7D32', CAUTION: '#ED8936', UNSAFE: '#C53030' };

    function statusBadgeClass(status) {
        if (status === 'UNSAFE') return 'demo-badge--bad';
        if (status === 'SAFE') return 'demo-badge--good';
        return 'demo-badge--moderate'; // CAUTION or LOCKED
    }

    // Which direction counts as "good" differs per parameter, e.g. High
    // fish density is good (green) but High Pb is bad (red).
    function paramBadgeClass(level, goodWhenHigh) {
        const isGood = goodWhenHigh ? level === 'High' : level === 'Low';
        return isGood ? 'demo-badge--good' : 'demo-badge--bad';
    }

    function classifyStation(readings) {
        const waterQuality = classifyWaterQuality(readings);
        const metals = classifyMetals(readings);
        const fish = classifyFish(readings);

        // Overall status is the worst of the three currently-measured
        // segments. Forecast is excluded here since it is a prediction,
        // not a current reading, and is Premium-only.
        const overall = [waterQuality.status, metals.status, fish.status]
            .reduce((worst, s) => (STATUS_SEVERITY[s] > STATUS_SEVERITY[worst] ? s : worst), 'SAFE');

        return { waterQuality, metals, fish, status: overall };
    }

    stations.forEach(station => {
        station.status = classifyStation(station.readings);

        // Separate continuous 0..1 risk score used only for the +7/+30
        // day forecast trend below, not for any SAFE/CAUTION/UNSAFE
        // badge (those come from the classification above instead).
        const rawScore = (station.readings.leadPb / 0.08) * 0.35
            + (station.readings.cadmiumCd / 0.02) * 0.25
            + (station.readings.mercuryHg / 0.1) * 0.15
            + (station.readings.turbidity / 40) * 0.25;
        const current = Math.max(0, Math.min(1, rawScore));
        const driftPerDay = (Math.random() - 0.5) * 0.02;
        const forecast7 = Math.max(0, Math.min(1, current + driftPerDay * 7));
        const forecast30 = Math.max(0, Math.min(1, current + driftPerDay * 30));
        const delta30 = forecast30 - current;

        station.forecast = {
            forecast7,
            forecast30,
            trend: delta30 > 0.03 ? 'RISING' : delta30 < -0.03 ? 'FALLING' : 'STABLE',
        };
    });

    /* ------------------------------------------------------------------
     * Shared four-segment detail markup (Water Quality, Metals and
     * Contamination, Fish Population, Forecast and Trend), used by both
     * the Leaflet popups and the Station Status detail panel so Free and
     * Premium always read from the exact same simulated data.
     * ------------------------------------------------------------------ */
    // Wraps a numeric value in a blurred, lock-badged span for Free
    // accounts (the value is still in the DOM, just visually obscured;
    // this is a demo teaser, not a real access control). Premium gets
    // the plain value with nothing extra.
    function valueCellHTML(valueText) {
        if (role === 'premium') return valueText;
        return `<span class="value-blur">${valueText}</span><span class="value-lock" aria-hidden="true">&#128274;</span>`;
    }

    function paramTableRow(label, level, value, unit, goodWhenHigh) {
        const cls = paramBadgeClass(level, goodWhenHigh);
        const valueText = `${value}${unit ? ' ' + unit : ''}`;
        const lockedClass = role === 'premium' ? '' : ' value-cell--locked';
        return `
            <tr>
                <td>${label}</td>
                <td class="value-cell${lockedClass}">${valueCellHTML(valueText)}</td>
                <td><span class="demo-badge ${cls}">${level}</span></td>
            </tr>
        `;
    }

    function buildTable(headers, rowsHTML) {
        const headerCells = headers.map(h => `<th>${h}</th>`).join('');
        return `
            <div class="param-table-wrap">
                <table class="param-table">
                    <thead><tr>${headerCells}</tr></thead>
                    <tbody>${rowsHTML}</tbody>
                </table>
            </div>
        `;
    }

    function buildSegmentHTML(key, title, status, bodyHTML) {
        return `
            <div class="detail-segment" data-segment="${key}">
                <button type="button" class="segment-toggle" aria-expanded="false">
                    <span class="segment-title">${title}</span>
                    <span class="demo-badge ${statusBadgeClass(status)}">${status}</span>
                    <span class="segment-caret">Read more</span>
                </button>
                <div class="segment-body" hidden>${bodyHTML}</div>
            </div>
        `;
    }

    function buildStationSegmentsHTML(station) {
        const r = station.readings;
        const wq = station.status.waterQuality;
        const metals = station.status.metals;
        const fish = station.status.fish;
        const fc = station.forecast;

        const waterRows = [
            paramTableRow('pH', wq.phLevel, r.ph, '', true),
            paramTableRow('Dissolved oxygen', wq.doLevel, r.dissolvedOxygen, 'mg/L', true),
            paramTableRow('Turbidity', wq.turbidityLevel, r.turbidity, 'NTU', false),
            paramTableRow('Temperature', wq.temperatureLevel, r.temperature, '&deg;C', false),
        ].join('');
        const waterBody = buildTable(['Parameter', 'Value', 'Status'], waterRows);

        const metalsNote = role === 'premium'
            ? '<p class="segment-note">Reported in mg/kg, framed against EU 2023/915 style safety cutoffs (illustrative demo values, not the literal regulatory limits).</p>'
            : '';
        const metalsRows = [
            paramTableRow('Lead (Pb)', metals.pbLevel, r.leadPb, 'mg/kg', false),
            paramTableRow('Cadmium (Cd)', metals.cdLevel, r.cadmiumCd, 'mg/kg', false),
            paramTableRow('Mercury (Hg)', metals.hgLevel, r.mercuryHg, 'mg/kg', false),
        ].join('');
        const metalsBody = metalsNote + buildTable(['Parameter', 'Value', 'Status'], metalsRows);

        const fishDensityLockedClass = role === 'premium' ? '' : ' value-cell--locked';
        const fishSummary = `
            <p class="segment-summary-row">
                <span class="segment-summary-label">Fish density</span>
                <span class="segment-summary-value${fishDensityLockedClass}">${valueCellHTML(fish.fishDensity + ' fish observed')}</span>
                <span class="demo-badge ${paramBadgeClass(fish.fishLevel, true)}">${fish.fishLevel}</span>
            </p>
        `;
        const speciesLockedClass = role === 'premium' ? '' : ' value-cell--locked';
        const speciesRows = Object.entries(r.fishSpecies)
            .map(([species, count]) => `
                <tr>
                    <td>${species}</td>
                    <td class="value-cell${speciesLockedClass}">${valueCellHTML(String(count))}</td>
                </tr>
            `)
            .join('');
        const fishBody = fishSummary + buildTable(['Species', 'Count'], speciesRows);

        let forecastSegment;
        if (role === 'premium') {
            const trendClass = 'risk-trend--' + fc.trend.toLowerCase();
            const forecastStatus = fc.trend === 'RISING' ? 'CAUTION' : 'SAFE';
            const forecastRows = `
                <tr><td>+7 days risk score</td><td>${fc.forecast7.toFixed(2)}</td></tr>
                <tr><td>+30 days risk score</td><td>${fc.forecast30.toFixed(2)}</td></tr>
                <tr><td>Trend</td><td><span class="risk-trend ${trendClass}">${fc.trend}</span></td></tr>
            `;
            const forecastBody = buildTable(['Metric', 'Value'], forecastRows);
            forecastSegment = buildSegmentHTML('forecast', 'Forecast & Trend', forecastStatus, forecastBody);
        } else {
            const lockedBody = `
                <p class="segment-note">Unlock exact 7 and 30 day risk forecasts, plus trend direction, with Premium.</p>
                <a href="pricing.html" class="btn btn-primary segment-upgrade-btn">Upgrade to Premium</a>
            `;
            forecastSegment = buildSegmentHTML('forecast', 'Forecast & Trend', 'LOCKED', lockedBody);
        }

        return [
            buildSegmentHTML('water', 'Water Quality', wq.status, waterBody),
            buildSegmentHTML('metals', 'Metals & Contamination', metals.status, metalsBody),
            buildSegmentHTML('fish', 'Fish Population', fish.status, fishBody),
            forecastSegment,
        ].join('');
    }

    // Expands or collapses a segment's body when its "Read more"/"Read
    // less" toggle is clicked. Reused for both the Station Status detail
    // panel and each Leaflet popup (wired on popupopen below).
    function wireSegmentToggles(root) {
        root.querySelectorAll('.segment-toggle').forEach(btn => {
            btn.addEventListener('click', () => {
                const body = btn.nextElementSibling;
                const expanded = btn.getAttribute('aria-expanded') === 'true';
                btn.setAttribute('aria-expanded', String(!expanded));
                body.hidden = expanded;
                const caret = btn.querySelector('.segment-caret');
                if (caret) caret.textContent = expanded ? 'Read more' : 'Read less';
            });
        });
    }

    function buildPopupHTML(station) {
        const typeTag = station.type === 'ibuss' ? 'Mobile' : 'Stationary';
        return `
            <div class="demo-popup">
                <p class="demo-popup-title">${station.name} <span class="station-type-tag">${typeTag}</span></p>
                <p class="risk-detail-row">Overall status: <span class="demo-badge ${statusBadgeClass(station.status.status)}">${station.status.status}</span></p>
                ${buildStationSegmentsHTML(station)}
                <p class="demo-popup-note">Sample data, simulated for this demo.</p>
            </div>
        `;
    }

    const map = L.map('map').setView([-6.22, 106.85], 12);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
    }).addTo(map);

    map.on('popupopen', (e) => wireSegmentToggles(e.popup.getElement()));

    // Shared shape markup for i-RIS (circle, stationary) vs i-BUSS
    // (diamond, mobile), reused for the map markers, the legend, and the
    // Station Status cards so the shape language stays identical
    // everywhere. Fill color and the red "selected" override both live in
    // CSS (.station-marker--iris / --ibuss / --selected), not here, so
    // there is exactly one place that defines each type's color.
    function stationShapeSVG(type, size) {
        if (type === 'ibuss') {
            return `<svg viewBox="0 0 26 26" width="${size}" height="${size}"><polygon class="station-marker-shape" points="13,3 23,13 13,23 3,13" stroke="#EAEAEA" stroke-width="3" stroke-linejoin="round"/></svg>`;
        }
        return `<svg viewBox="0 0 26 26" width="${size}" height="${size}"><circle class="station-marker-shape" cx="13" cy="13" r="9" stroke="#EAEAEA" stroke-width="3"/></svg>`;
    }

    function stationMarkerHTML(type, size, extraClass) {
        const cls = ['station-marker', 'station-marker--' + type, extraClass].filter(Boolean).join(' ');
        return `<span class="${cls}">${stationShapeSVG(type, size)}</span>`;
    }

    const markerByStationId = {};
    let selectedLeafletStationId = null;

    function markerInnerEl(marker) {
        const el = marker.getElement();
        return el && el.querySelector('.station-marker');
    }

    function setMarkerSelected(stationId) {
        if (selectedLeafletStationId && markerByStationId[selectedLeafletStationId]) {
            const prevInner = markerInnerEl(markerByStationId[selectedLeafletStationId]);
            if (prevInner) prevInner.classList.remove('station-marker--selected');
        }
        selectedLeafletStationId = stationId;
        const marker = markerByStationId[stationId];
        if (marker) {
            const inner = markerInnerEl(marker);
            if (inner) inner.classList.add('station-marker--selected');
        }
    }

    stations.forEach(station => {
        const icon = L.divIcon({
            className: 'station-marker-wrapper',
            html: stationMarkerHTML(station.type, 26),
            iconSize: [26, 26],
            iconAnchor: [13, 13],
            popupAnchor: [0, -13],
        });
        const marker = L.marker([station.lat, station.lon], { icon }).addTo(map);

        marker.bindPopup(buildPopupHTML(station));
        marker.on('click', () => setMarkerSelected(station.id));
        markerByStationId[station.id] = marker;
    });

    const updatedLabel = document.getElementById('dashboard-updated');

    // Malaysia Time (UTC+8, no DST) via the IANA tz database, so the
    // timestamp reads the same regardless of the visitor's own timezone.
    // "MYT" is appended manually since Intl doesn't emit that abbreviation
    // for this zone on its own.
    function formatMYT(date) {
        const datePart = date.toLocaleDateString('en-GB', {
            timeZone: 'Asia/Kuala_Lumpur',
            weekday: 'short',
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        });
        const timePart = date.toLocaleTimeString('en-US', {
            timeZone: 'Asia/Kuala_Lumpur',
            hour: 'numeric',
            minute: '2-digit',
            second: '2-digit',
            hour12: true,
        });
        return `${datePart}, ${timePart} MYT`;
    }

    function refreshUpdatedLabel() {
        if (updatedLabel) {
            updatedLabel.textContent = 'Last updated: ' + formatMYT(new Date());
        }
    }

    refreshUpdatedLabel();

    // Simulated movement: small random-walk jitter around the i-BUSS unit's
    // starting point, clamped to a short leash so it reads as "patrolling"
    // rather than teleporting. Not a real GPS track.
    setInterval(() => {
        const jitter = () => (Math.random() - 0.5) * 0.00006;
        const leash = 0.00015;

        let nextLat = ibussStation.lat + jitter();
        let nextLon = ibussStation.lon + jitter();

        nextLat = Math.max(ibussHome.lat - leash, Math.min(ibussHome.lat + leash, nextLat));
        nextLon = Math.max(ibussHome.lon - leash, Math.min(ibussHome.lon + leash, nextLon));

        ibussStation.lat = nextLat;
        ibussStation.lon = nextLon;

        const marker = markerByStationId[ibussStation.id];
        marker.setLatLng([nextLat, nextLon]);
        if (marker.isPopupOpen()) {
            marker.setPopupContent(buildPopupHTML(ibussStation));
        }

        refreshUpdatedLabel();
    }, 4000);

    /* ------------------------------------------------------------------
     * Station Status grid, a simple status card per demo station below
     * the Leaflet live-position map above. Values are derived from the
     * same synthetic `readings` and classification above, so a station
     * that looks unsafe in the Leaflet popup also reads as unsafe here.
     * ------------------------------------------------------------------ */
    const statusGridEl = document.getElementById('risk-station-list');

    if (statusGridEl) {
        let selectedStationId = null;

        function renderStatusGrid() {
            statusGridEl.innerHTML = stations.map(station => {
                const selectedClass = station.id === selectedStationId ? ' is-selected' : '';
                const typeTag = station.type === 'ibuss' ? 'Mobile' : 'Stationary';
                return `
                    <div class="risk-station-card${selectedClass}" data-station-id="${station.id}" tabindex="0" role="button">
                        <p class="risk-station-card-code">${station.id.toUpperCase()}</p>
                        ${stationMarkerHTML(station.type, 18, 'risk-station-card-shape')}
                        <p class="risk-station-card-name">${station.name}</p>
                        <span class="station-type-tag">${typeTag}</span>
                        <span class="demo-badge ${statusBadgeClass(station.status.status)}">${station.status.status}</span>
                        <span class="risk-station-card-dot" style="background:${STATUS_COLORS[station.status.status]}"></span>
                    </div>
                `;
            }).join('');

            statusGridEl.querySelectorAll('.risk-station-card').forEach(card => {
                card.addEventListener('click', () => selectStationCard(card.dataset.stationId));
                card.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        selectStationCard(card.dataset.stationId);
                    }
                });
            });
        }

        const riskDetailEl = document.getElementById('risk-detail');
        const riskDetailPlaceholder = document.getElementById('risk-detail-placeholder');

        function selectStationCard(stationId) {
            selectedStationId = stationId;
            const station = stations.find(s => s.id === stationId);
            if (!station) return;

            const typeTag = station.type === 'ibuss' ? 'Mobile' : 'Stationary';

            riskDetailEl.innerHTML = `
                <p class="risk-detail-title">${station.name} <span class="station-type-tag">${typeTag}</span></p>
                <p class="risk-detail-row">Overall status: <span class="demo-badge ${statusBadgeClass(station.status.status)}">${station.status.status}</span></p>
                ${buildStationSegmentsHTML(station)}
                <p class="demo-popup-note">Sample data, simulated for this demo.</p>
            `;
            riskDetailEl.hidden = false;
            riskDetailPlaceholder.hidden = true;

            wireSegmentToggles(riskDetailEl);
            renderStatusGrid();
        }

        renderStatusGrid();
    }
}
