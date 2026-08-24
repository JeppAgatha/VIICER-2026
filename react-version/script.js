/* ------------------------------------------------------------------------
 * DEMO AUTH LAYER — mockup only, for a competition prototype.
 *
 * There is no server, no database, and no real authentication anywhere in
 * this project. "Logging in" only checks the email against two hardcoded
 * demo addresses (see login.html) and stores which tier that maps to
 * ("free" or "premium") in sessionStorage under "ibis_role". Any code that
 * reads this value — the nav, dashboard.html's access gate, the map
 * popups — is trusting the browser's own sessionStorage, which any visitor
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
 * directly on the page — see the DEMO AUTH LAYER comment above for what
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
 * Demo dashboard map (dashboard.html only). Everything below — the station
 * list, the sensor readings, the fish counts, the i-BUSS movement — is
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
    }

    const upgradePrompt = document.getElementById('upgrade-prompt');
    if (upgradePrompt) {
        upgradePrompt.hidden = role !== 'free';
    }

    // Approximate real-world points along the Ciliwung River in Jakarta,
    // Indonesia — this project's original problem statement river — used
    // here purely as plausible demo station locations. There is no actual
    // deployed hardware at these coordinates.
    const rand = (min, max, decimals = 1) => Number((Math.random() * (max - min) + min).toFixed(decimals));

    function generateDemoReadings() {
        const leadPb = rand(0.001, 0.08, 3);
        const cadmiumCd = rand(0.0005, 0.02, 3);
        const turbidity = rand(2, 40, 1);
        const fishSpecies = {
            Tilapia: Math.floor(rand(5, 45, 0)),
            Catfish: Math.floor(rand(2, 27, 0)),
            Carp: Math.floor(rand(1, 16, 0)),
        };
        const totalFish = Object.values(fishSpecies).reduce((sum, n) => sum + n, 0);

        return {
            ph: rand(6.5, 8, 1),
            dissolvedOxygen: rand(4, 9, 1),
            turbidity,
            temperature: rand(24, 31, 1),
            leadPb,
            cadmiumCd,
            fishSpecies,
            // Illustrative thresholds for the Free-tier badges, not real
            // regulatory standards — just enough to make the two tiers of
            // the same station agree with each other.
            contaminationLevel: (leadPb > 0.05 || cadmiumCd > 0.01 || turbidity > 25) ? 'High' : 'Low',
            fishPopulationLevel: totalFish > 40 ? 'High' : 'Low',
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

    function badgeHTML(label, level, goodWhenHigh) {
        const isGood = goodWhenHigh ? level === 'High' : level === 'Low';
        const cls = isGood ? 'demo-badge--good' : 'demo-badge--bad';
        return `<p class="demo-badge-row"><span class="demo-badge-label">${label}</span><span class="demo-badge ${cls}">${level}</span></p>`;
    }

    function buildPopupHTML(station) {
        const r = station.readings;
        let body;

        if (role === 'premium') {
            const fishRows = Object.entries(r.fishSpecies)
                .map(([species, count]) => `<li>${species}: <strong>${count}</strong></li>`)
                .join('');

            body = `
                <ul class="demo-readings-list">
                    <li>pH: <strong>${r.ph}</strong></li>
                    <li>Dissolved oxygen: <strong>${r.dissolvedOxygen} mg/L</strong></li>
                    <li>Turbidity: <strong>${r.turbidity} NTU</strong></li>
                    <li>Temperature: <strong>${r.temperature} &deg;C</strong></li>
                    <li>Lead (Pb): <strong>${r.leadPb} mg/L</strong></li>
                    <li>Cadmium (Cd): <strong>${r.cadmiumCd} mg/L</strong></li>
                </ul>
                <p class="demo-popup-subheading">Fish count by species</p>
                <ul class="demo-readings-list">${fishRows}</ul>
            `;
        } else {
            body = badgeHTML('Contamination level', r.contaminationLevel, false)
                + badgeHTML('Fish population', r.fishPopulationLevel, true);
        }

        return `
            <div class="demo-popup">
                <p class="demo-popup-title">${station.name}</p>
                ${body}
                <p class="demo-popup-note">Sample data &mdash; simulated for this demo.</p>
            </div>
        `;
    }

    const map = L.map('map').setView([-6.22, 106.85], 12);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
    }).addTo(map);

    const markerByStationId = {};
    const MARKER_DEFAULT_FILL = '#0A2239';
    const MARKER_SELECTED_FILL = '#C53030';
    let selectedLeafletStationId = null;

    function setMarkerSelected(stationId) {
        if (selectedLeafletStationId && markerByStationId[selectedLeafletStationId]) {
            markerByStationId[selectedLeafletStationId].setStyle({ fillColor: MARKER_DEFAULT_FILL });
        }
        selectedLeafletStationId = stationId;
        if (markerByStationId[stationId]) {
            markerByStationId[stationId].setStyle({ fillColor: MARKER_SELECTED_FILL });
        }
    }

    stations.forEach(station => {
        const marker = L.circleMarker([station.lat, station.lon], {
            radius: 10,
            color: '#EAEAEA',
            weight: 3,
            fillColor: MARKER_DEFAULT_FILL,
            fillOpacity: 0.95,
        }).addTo(map);

        marker.bindPopup(buildPopupHTML(station));
        marker.on('click', () => setMarkerSelected(station.id));
        markerByStationId[station.id] = marker;
    });

    const updatedLabel = document.getElementById('dashboard-updated');

    function refreshUpdatedLabel() {
        if (updatedLabel) {
            updatedLabel.textContent = 'Last updated: ' + new Date().toLocaleTimeString();
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
     * Station Status grid — a simple status card per demo station, below
     * the Leaflet live-position map above. Values are derived from the
     * same synthetic `readings` generated above (so a station that looks
     * contaminated in the Leaflet popup also reads as unsafe here), and
     * the +7/+30 day forecast is a simple deterministic drift applied to
     * a blended risk score — not a real trained forecasting model,
     * purely a plausible-looking demo trend.
     * ------------------------------------------------------------------ */
    const statusGridEl = document.getElementById('risk-station-list');

    if (statusGridEl) {
        // Per-parameter High/Low thresholds — illustrative demo cutoffs
        // only, not real water-quality regulatory standards.
        function classifyStation(readings) {
            const fishDensity = Object.values(readings.fishSpecies).reduce((sum, n) => sum + n, 0);

            // Dissolved oxygen below 5 mg/L is treated as a poor reading
            // for freshwater fish — "Low" means unhealthy here.
            const doLevel = readings.dissolvedOxygen < 5 ? 'Low' : 'High';

            // Fewer than 30 observed fish across all species is treated
            // as a sparse/declining population for this demo baseline.
            const fishLevel = fishDensity < 30 ? 'Low' : 'High';

            // A healthy freshwater pH band is roughly 6.5-8.5; outside
            // that range is flagged "Low" (unhealthy), inside is "High".
            const phLevel = (readings.ph < 6.5 || readings.ph > 8.5) ? 'Low' : 'High';

            // Lead (Pb) above 0.05 mg/L is treated as an unsafe reading
            // here — unlike the other three, High Pb is the BAD direction.
            const pbLevel = readings.leadPb > 0.05 ? 'High' : 'Low';

            // Overall status: count how many of the four readings landed
            // on the "bad" side for that parameter, then bucket it.
            const badCount = [doLevel === 'Low', fishLevel === 'Low', phLevel === 'Low', pbLevel === 'High']
                .filter(Boolean).length;
            const status = badCount === 0 ? 'SAFE' : badCount === 1 ? 'CAUTION' : 'UNSAFE';

            return { doLevel, fishLevel, phLevel, pbLevel, fishDensity, status };
        }

        const STATUS_COLORS = { SAFE: '#2E7D32', CAUTION: '#ED8936', UNSAFE: '#C53030' };

        function statusBadgeClass(status) {
            if (status === 'UNSAFE') return 'demo-badge--bad';
            if (status === 'SAFE') return 'demo-badge--good';
            return 'demo-badge--moderate';
        }

        // Which direction counts as "good" differs per parameter — e.g.
        // High fish density is good (green) but High Pb is bad (red).
        // Mirrors the contamination-vs-fish-population color logic
        // already used in the Leaflet popups above.
        function paramBadgeClass(level, goodWhenHigh) {
            const isGood = goodWhenHigh ? level === 'High' : level === 'Low';
            return isGood ? 'demo-badge--good' : 'demo-badge--bad';
        }

        stations.forEach(station => {
            station.status = classifyStation(station.readings);

            // Separate continuous 0..1 risk score used only for the
            // +7/+30 day forecast trend below — not used for the
            // SAFE/CAUTION/UNSAFE badge, which comes from the four
            // parameters above instead.
            const rawScore = (station.readings.leadPb / 0.08) * 0.4
                + (station.readings.cadmiumCd / 0.02) * 0.3
                + (station.readings.turbidity / 40) * 0.3;
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

        let selectedStationId = null;

        function renderStatusGrid() {
            statusGridEl.innerHTML = stations.map(station => {
                const selectedClass = station.id === selectedStationId ? ' is-selected' : '';
                return `
                    <div class="risk-station-card${selectedClass}" data-station-id="${station.id}" tabindex="0" role="button">
                        <p class="risk-station-card-code">${station.id.toUpperCase()}</p>
                        <p class="risk-station-card-name">${station.name}</p>
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

        function paramRow(label, level, value, unit, goodWhenHigh) {
            const cls = paramBadgeClass(level, goodWhenHigh);
            const valueText = role === 'premium' ? `${value}${unit ? ' ' + unit : ''} &mdash; ` : '';
            return `<p class="risk-detail-row">${label}: ${valueText}<span class="demo-badge ${cls}">${level}</span></p>`;
        }

        function selectStationCard(stationId) {
            selectedStationId = stationId;
            const station = stations.find(s => s.id === stationId);
            if (!station) return;

            const s = station.status;
            const r = station.readings;

            let forecastRows = '';
            if (role === 'premium') {
                const trendClass = 'risk-trend--' + station.forecast.trend.toLowerCase();
                forecastRows = `
                    <p class="risk-detail-subheading">Forecast</p>
                    <p class="risk-detail-row">+7 days: <strong>${station.forecast.forecast7.toFixed(2)}</strong></p>
                    <p class="risk-detail-row">+30 days: <strong>${station.forecast.forecast30.toFixed(2)}</strong></p>
                    <p class="risk-detail-row">Trend: <span class="risk-trend ${trendClass}">${station.forecast.trend}</span></p>
                `;
            }

            riskDetailEl.innerHTML = `
                <p class="risk-detail-title">${station.name}</p>
                <p class="risk-detail-row">Overall status: <span class="demo-badge ${statusBadgeClass(s.status)}">${s.status}</span></p>
                <p class="risk-detail-subheading">Readings</p>
                ${paramRow('Dissolved oxygen', s.doLevel, r.dissolvedOxygen, 'mg/L', true)}
                ${paramRow('Fish density', s.fishLevel, s.fishDensity, 'fish observed', true)}
                ${paramRow('pH', s.phLevel, r.ph, '', true)}
                ${paramRow('Pb concentration', s.pbLevel, r.leadPb, 'mg/L', false)}
                ${forecastRows}
                <p class="demo-popup-note">Sample data &mdash; simulated for this demo.</p>
            `;
            riskDetailEl.hidden = false;
            riskDetailPlaceholder.hidden = true;

            renderStatusGrid();
        }

        renderStatusGrid();
    }
}
