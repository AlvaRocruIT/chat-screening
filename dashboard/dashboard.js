// Move SUPABASE_CONFIG outside the class so methods can access it
const SUPABASE_CONFIG = {
    url: 'https://ieutjzjhemtppcjjuiao.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlldXRqempoZW10cHBjamp1aWFvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE0MTk4NzUsImV4cCI6MjA3Njk5NTg3NX0.Imc1aELcfSLbgOvN1h9ot59Jyt4xgk0XTPNBpEj43KY'
};

class ChatScreeningDashboard {
    constructor() {
        this.chart = null;
        this.candidatesData = [];
        this.filteredVacante = 'all';
        this.sortColumn = null;
        this.sortDirection = 'desc';
        this.selectedCandidate = null;
        this.init();
    }

    // Normalize strings for robust comparisons (accents/case/spaces)
    normalize(s) {
        return (s || '')
            .toString()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .trim()
            .toLowerCase();
    }

    async init() {
        this.setupEventListeners();
        await this.loadDataFromSupabase();
        this.createChart();
        this.updateStats();
        this.updateCandidatesTable();
    }

    setupEventListeners() {
        const refreshBtn = document.getElementById('refreshBtn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                this.refreshData();
            });
        }

        const vacanteFilter = document.getElementById('vacanteFilter');
        if (vacanteFilter) {
            vacanteFilter.addEventListener('change', (e) => {
                this.filterByVacante(e.target.value);
            });
        }

        const areaFilter = document.getElementById('areaFilter');
        if (areaFilter) {
            areaFilter.addEventListener('change', (e) => {
                this.updateAreaAverage(e.target.value);
            });
        }
    }

    // Helper to transform scores object to ordered array for chart datasets
    scoresObjectToArray(scoresObj) {
        if (!scoresObj) return [0, 0, 0, 0, 0];
        return [
            Number(scoresObj.cultural_alignment || 0),
            Number(scoresObj.growth_mindset || 0),
            Number(scoresObj.engagement_depth || 0),
            Number(scoresObj.role_understanding || 0),
            Number(scoresObj.strategic_thinking || 0)
        ];
    }

    async loadDataFromSupabase() {
        try {
            console.log('Fetching from:', SUPABASE_CONFIG.url);
            const response = await fetch(`${SUPABASE_CONFIG.url}/rest/v1/candidate_scores`, {
                method: 'GET',
                headers: {
                    'apikey': SUPABASE_CONFIG.anonKey,
                    'Authorization': `Bearer ${SUPABASE_CONFIG.anonKey}`,
                    'Content-Type': 'application/json',
                    'Prefer': 'return=representation'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            // Transform Supabase data to your dashboard format
            this.candidatesData = data.map(candidate => ({
                sessionId: candidate.session_id,
                vacante: (candidate.vacante || '').trim(),
                scores: {
                    cultural_alignment: Number(candidate.cultural_alignment || 0),
                    growth_mindset: Number(candidate.growth_mindset || 0),
                    engagement_depth: Number(candidate.engagement_depth || 0),
                    role_understanding: Number(candidate.role_understanding || 0),
                    strategic_thinking: Number(candidate.strategic_thinking || 0)
                },
                interactions: Number(candidate.interactions || 0),
                timestamp: candidate.created_at
            }));

            console.log('Data loaded from Supabase:', this.candidatesData);

        } catch (error) {
            console.error('Error loading data from Supabase:', error);
            // Fall back to mock data if API fails
            this.loadMockData && this.loadMockData();
        }
    }

    createChart() {
        const canvas = document.getElementById('spiderChart');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');

        const chartData = this.prepareChartData();

        if (typeof Chart === 'undefined') {
            console.error('Chart.js is not loaded. Please include Chart.js before this script.');
            return;
        }

        this.chart = new Chart(ctx, {
            type: 'radar',
            data: chartData,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    r: {
                        beginAtZero: true,
                        max: 5,
                        ticks: {
                            stepSize: 1
                        }
                    }
                },
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    title: {
                        display: true,
                        text: this.selectedCandidate ?
                            `Comparación: ${this.selectedCandidate.sessionId}` :
                            'Comparación de Rendimiento'
                    }
                }
            }
        });
    }

    prepareChartData() {
        const labels = ['Cultural', 'Crecimiento', 'Engagement', 'Rol', 'Estratégico'];

        if (this.selectedCandidate) {
            return this.prepareSelectedCandidateData();
        } else if (this.filteredVacante === 'all') {
            return this.prepareAllVacantesData();
        } else {
            return this.prepareFilteredVacanteData();
        }
    }

    prepareSelectedCandidateData() {
        const labels = ['Cultural', 'Crecimiento', 'Engagement', 'Rol', 'Estratégico'];

        const overallAverage = this.calculateOverallAverage();
        const selectedVacanteAverage = this.calculateVacanteAverage(this.selectedCandidate.vacante);
        const selectedCandidateScores = this.scoresObjectToArray(this.selectedCandidate.scores);

        const datasets = [
            {
                label: 'Promedio General',
                data: overallAverage,
                borderColor: '#2c2c2c',
                backgroundColor: 'rgba(44, 44, 44, 0.2)',
                borderWidth: 3,
                pointRadius: 6
            },
            {
                label: `Promedio ${this.selectedCandidate.vacante}`,
                data: selectedVacanteAverage,
                borderColor: '#666666',
                backgroundColor: 'rgba(102, 102, 102, 0.2)',
                borderWidth: 2,
                pointRadius: 4
            },
            {
                label: `${this.selectedCandidate.sessionId}`,
                data: selectedCandidateScores,
                borderColor: '#78FF3B',
                backgroundColor: 'rgba(120, 255, 59, 0.2)',
                borderWidth: 2,
                pointRadius: 4
            }
        ];

        return {
            labels: labels,
            datasets: datasets
        };
    }

    prepareAllVacantesData() {
        const labels = ['Cultural', 'Crecimiento', 'Engagement', 'Rol', 'Estratégico'];

        const overallAverage = this.calculateOverallAverage();
        const vacanteAverages = this.calculateVacanteAverages();

        const datasets = [
            {
                label: 'Promedio General',
                data: overallAverage,
                borderColor: '#2c2c2c',
                backgroundColor: 'rgba(44, 44, 44, 0.2)',
                borderWidth: 3,
                pointRadius: 6
            }
        ];

        const grayShades = ['#666666', '#999999', '#cccccc'];
        let shadeIndex = 0;

        Object.entries(vacanteAverages).forEach(([vacante, scores]) => {
            datasets.push({
                label: vacante,
                data: scores,
                borderColor: grayShades[shadeIndex % grayShades.length],
                backgroundColor: `rgba(${shadeIndex * 60 + 100}, ${shadeIndex * 60 + 100}, ${shadeIndex * 60 + 100}, 0.2)`,
                borderWidth: 2,
                pointRadius: 4
            });
            shadeIndex++;
        });

        return {
            labels: labels,
            datasets: datasets
        };
    }

    prepareFilteredVacanteData() {
        const labels = ['Cultural', 'Crecimiento', 'Engagement', 'Rol', 'Estratégico'];

        const overallAverage = this.calculateOverallAverage();
        const selectedVacanteAverage = this.calculateVacanteAverage(this.filteredVacante);
        const topCandidate = this.findTopCandidateForVacante(this.filteredVacante);
        const topCandidateScores = this.scoresObjectToArray(topCandidate.scores);

        const datasets = [
            {
                label: 'Promedio General',
                data: overallAverage,
                borderColor: '#2c2c2c',
                backgroundColor: 'rgba(44, 44, 44, 0.2)',
                borderWidth: 3,
                pointRadius: 6
            },
            {
                label: `Promedio ${this.filteredVacante}`,
                data: selectedVacanteAverage,
                borderColor: '#666666',
                backgroundColor: 'rgba(102, 102, 102, 0.2)',
                borderWidth: 2,
                pointRadius: 4
            },
            {
                label: `Mejor Candidato ${this.filteredVacante}`,
                data: topCandidateScores,
                borderColor: '#78FF3B',
                backgroundColor: 'rgba(120, 255, 59, 0.2)',
                borderWidth: 2,
                pointRadius: 4
            }
        ];

        return {
            labels: labels,
            datasets: datasets
        };
    }

    // Array of 5 per-dimension averages across ALL candidates, in the fixed order
    calculateOverallAverage() {
        const scoreTypes = ['cultural_alignment', 'growth_mindset', 'engagement_depth', 'role_understanding', 'strategic_thinking'];
        if (this.candidatesData.length === 0) return [0, 0, 0, 0, 0];

        return scoreTypes.map(scoreType => {
            const sum = this.candidatesData.reduce((acc, c) => acc + Number(c.scores[scoreType] || 0), 0);
            return sum / this.candidatesData.length;
        });
    }

    calculateVacanteAverage(vacante) {
        const vacanteCandidates = this.candidatesData.filter(candidate =>
            this.normalize(candidate.vacante) === this.normalize(vacante)
        );
        const scoreTypes = ['cultural_alignment', 'growth_mindset', 'engagement_depth', 'role_understanding', 'strategic_thinking'];

        if (vacanteCandidates.length === 0) return [0, 0, 0, 0, 0];

        return scoreTypes.map(scoreType => {
            const sum = vacanteCandidates.reduce((acc, candidate) => acc + Number(candidate.scores[scoreType] || 0), 0);
            return sum / vacanteCandidates.length;
        });
    }

    calculateVacanteAverages() {
        const vacantes = [...new Set(this.candidatesData.map(candidate => candidate.vacante))];
        const vacanteAverages = {};

        vacantes.forEach(vacante => {
            vacanteAverages[vacante] = this.calculateVacanteAverage(vacante);
        });

        return vacanteAverages;
    }

    findTopCandidateForVacante(vacante) {
        const vacanteCandidates = this.candidatesData.filter(candidate =>
            this.normalize(candidate.vacante) === this.normalize(vacante)
        );

        if (vacanteCandidates.length === 0) {
            return {
                sessionId: 'N/A',
                scores: {
                    cultural_alignment: 0,
                    growth_mindset: 0,
                    engagement_depth: 0,
                    role_understanding: 0,
                    strategic_thinking: 0
                }
            };
        }

        return vacanteCandidates.reduce((best, current) => {
            const bestTotal = Object.values(best.scores).reduce((a, b) => Number(a) + Number(b), 0);
            const currentTotal = Object.values(current.scores).reduce((a, b) => Number(a) + Number(b), 0);
            return currentTotal > bestTotal ? current : best;
        });
    }

    updateStats() {
        const totalCandidates = this.candidatesData.length;
        const avgGeneral = this.calculateGeneralAverage();

        const candidatesByVacante = this.getCandidatesByVacante();

        const totalCandidatesEl = document.getElementById('totalCandidates');
        const candidatesByVacanteEl = document.getElementById('candidatesByVacante');
        const avgGeneralEl = document.getElementById('avgGeneral');

        if (totalCandidatesEl) totalCandidatesEl.textContent = totalCandidates;
        if (candidatesByVacanteEl) candidatesByVacanteEl.textContent = candidatesByVacante;
        if (avgGeneralEl) avgGeneralEl.textContent = avgGeneral.toFixed(1);

        const bestCandidateObj = this.findBestCandidateObject();
        const mostInteractiveObj = this.findMostInteractiveCandidateObject();

        const bestCandidateElement = document.getElementById('bestCandidate');
        const mostInteractiveElement = document.getElementById('mostInteractive');

        if (bestCandidateElement) {
            bestCandidateElement.textContent = bestCandidateObj ? bestCandidateObj.sessionId : '--';
            bestCandidateElement.style.cursor = 'pointer';
            bestCandidateElement.style.textDecoration = 'underline';
            bestCandidateElement.title = 'Click para ver detalles';
            bestCandidateElement.replaceWith(bestCandidateElement.cloneNode(true));
        }

        if (mostInteractiveElement) {
            mostInteractiveElement.textContent = mostInteractiveObj ? mostInteractiveObj.sessionId : '--';
            mostInteractiveElement.style.cursor = 'pointer';
            mostInteractiveElement.style.textDecoration = 'underline';
            mostInteractiveElement.title = 'Click para ver detalles';
            mostInteractiveElement.replaceWith(mostInteractiveElement.cloneNode(true));
        }

        const newBestCandidateElement = document.getElementById('bestCandidate');
        const newMostInteractiveElement = document.getElementById('mostInteractive');

        if (newBestCandidateElement) {
            newBestCandidateElement.addEventListener('click', () => {
                if (bestCandidateObj) {
                    this.selectCandidate(bestCandidateObj);
                }
            });
        }

        if (newMostInteractiveElement) {
            newMostInteractiveElement.addEventListener('click', () => {
                if (mostInteractiveObj) {
                    this.selectCandidate(mostInteractiveObj);
                }
            });
        }

        // Default area for the area stat (fall back to current select or cultural)
        const areaFilter = document.getElementById('areaFilter');
        const area = areaFilter ? areaFilter.value : 'cultural_alignment';
        this.updateAreaAverage(area);
    }

    getCandidatesByVacante() {
        if (this.filteredVacante === 'all') {
            return this.candidatesData.length;
        } else {
            return this.candidatesData.filter(candidate =>
                this.normalize(candidate.vacante) === this.normalize(this.filteredVacante)
            ).length;
        }
    }

    // Global general average across all 5 dimensions
    calculateGeneralAverage() {
        if (this.candidatesData.length === 0) return 0;
        const totalSum = this.candidatesData.reduce((acc, candidate) => {
            return acc + Object.values(candidate.scores).reduce((sum, score) => sum + Number(score || 0), 0);
        }, 0);
        return totalSum / (this.candidatesData.length * 5);
    }

    updateAreaAverage(area) {
        const avgByAreaEl = document.getElementById('avgByArea');
        if (this.candidatesData.length === 0) {
            if (avgByAreaEl) avgByAreaEl.textContent = '0.0';
            return;
        }

        const validArea = ['cultural_alignment', 'growth_mindset', 'engagement_depth', 'role_understanding', 'strategic_thinking'];
        const areaKey = validArea.includes(area) ? area : 'cultural_alignment';

        const sum = this.candidatesData.reduce((acc, candidate) => acc + Number(candidate.scores[areaKey] || 0), 0);
        const average = sum / this.candidatesData.length;
        if (avgByAreaEl) avgByAreaEl.textContent = average.toFixed(1);
    }

    findBestCandidate() {
        if (this.candidatesData.length === 0) return '--';

        const best = this.candidatesData.reduce((best, current) => {
            const bestTotal = Object.values(best.scores).reduce((a, b) => Number(a) + Number(b), 0);
            const currentTotal = Object.values(current.scores).reduce((a, b) => Number(a) + Number(b), 0);
            return currentTotal > bestTotal ? current : best;
        });

        return best.sessionId;
    }

    findBestCandidateObject() {
        if (this.candidatesData.length === 0) return null;

        return this.candidatesData.reduce((best, current) => {
            const bestTotal = Object.values(best.scores).reduce((a, b) => Number(a) + Number(b), 0);
            const currentTotal = Object.values(current.scores).reduce((a, b) => Number(a) + Number(b), 0);
            return currentTotal > bestTotal ? current : best;
        });
    }

    findMostInteractiveCandidate() {
        if (this.candidatesData.length === 0) return '--';

        const mostInteractive = this.candidatesData.reduce((best, current) => {
            return current.interactions > best.interactions ? current : best;
        });

        return mostInteractive.sessionId;
    }

    findMostInteractiveCandidateObject() {
        if (this.candidatesData.length === 0) return null;

        return this.candidatesData.reduce((best, current) => {
            return current.interactions > best.interactions ? current : best;
        });
    }

    selectCandidate(candidate) {
        this.selectedCandidate = candidate;
        this.updateChart();
        this.updateCandidatesTable();
    }

    clearSelection() {
        this.selectedCandidate = null;
        this.updateChart();
        this.updateCandidatesTable();
    }

    sortCandidates(column) {
        if (this.sortColumn === column) {
            this.sortDirection = this.sortDirection === 'desc' ? 'asc' : 'desc';
        } else {
            this.sortColumn = column;
            this.sortDirection = 'desc';
        }

        this.candidatesData.sort((a, b) => {
            let valueA, valueB;

            switch (column) {
                case 'sessionId':
                    valueA = a.sessionId;
                    valueB = b.sessionId;
                    break;
                case 'vacante':
                    valueA = a.vacante;
                    valueB = b.vacante;
                    break;
                case 'interactions':
                    valueA = a.interactions;
                    valueB = b.interactions;
                    break;
                case 'cultural_alignment':
                    valueA = a.scores.cultural_alignment;
                    valueB = b.scores.cultural_alignment;
                    break;
                case 'growth_mindset':
                    valueA = a.scores.growth_mindset;
                    valueB = b.scores.growth_mindset;
                    break;
                case 'engagement_depth':
                    valueA = a.scores.engagement_depth;
                    valueB = b.scores.engagement_depth;
                    break;
                case 'role_understanding':
                    valueA = a.scores.role_understanding;
                    valueB = b.scores.role_understanding;
                    break;
                case 'strategic_thinking':
                    valueA = a.scores.strategic_thinking;
                    valueB = b.scores.strategic_thinking;
                    break;
                case 'average': {
                    const totalA = Object.values(a.scores).reduce((sum, score) => sum + Number(score || 0), 0);
                    const totalB = Object.values(b.scores).reduce((sum, score) => sum + Number(score || 0), 0);
                    valueA = totalA / 5;
                    valueB = totalB / 5;
                    break;
                }
                default:
                    return 0;
            }

            if (valueA < valueB) {
                return this.sortDirection === 'desc' ? 1 : -1;
            }
            if (valueA > valueB) {
                return this.sortDirection === 'desc' ? -1 : 1;
            }
            return 0;
        });

        this.updateCandidatesTable();
    }

    updateCandidatesTable() {
        const tableContainer = document.getElementById('candidatesTable');
        if (!tableContainer) return;

        console.log('candidatesData length:', this.candidatesData.length);

        if (this.candidatesData.length === 0) {
                // Construye la tabla completa, pero con el tbody vacío
        }

        // Robust filter (normalize both sides)
        const filteredCandidates = this.filteredVacante === 'all'
            ? this.candidatesData
            : this.candidatesData.filter(candidate =>
                this.normalize(candidate.vacante) === this.normalize(this.filteredVacante)
            );

        const tableHTML = `
            <table>
                <thead>
                    <tr>
                        <th onclick="dashboard.sortCandidates('sessionId')" class="sortable">
                            Session ID<span class="sort-icon">${this.getSortIcon('userEmail')}</span>
                        </th>
                        <th onclick="dashboard.sortCandidates('Nombre')" class="sortable">
                            Session ID<span class="sort-icon">${this.getSortIcon('userName')}</span>
                        </th>
                        <th onclick="dashboard.sortCandidates('vacante')" class="sortable">
                            Vacante<span class="sort-icon">${this.getSortIcon('vacante')}</span>
                        </th>
                        <th onclick="dashboard.sortCandidates('interactions')" class="sortable">
                            Interacciones<span class="sort-icon">${this.getSortIcon('interactions')}</span>
                        </th>
                        <th onclick="dashboard.sortCandidates('cultural_alignment')" class="sortable">
                            Cultural<span class="sort-icon">${this.getSortIcon('cultural_alignment')}</span>
                        </th>
                        <th onclick="dashboard.sortCandidates('growth_mindset')" class="sortable">
                            Crecimiento<span class="sort-icon">${this.getSortIcon('growth_mindset')}</span>
                        </th>
                        <th onclick="dashboard.sortCandidates('engagement_depth')" class="sortable">
                            Engagement<span class="sort-icon">${this.getSortIcon('engagement_depth')}</span>
                        </th>
                        <th onclick="dashboard.sortCandidates('role_understanding')" class="sortable">
                            Rol<span class="sort-icon">${this.getSortIcon('role_understanding')}</span>
                        </th>
                        <th onclick="dashboard.sortCandidates('strategic_thinking')" class="sortable">
                            Estratégico<span class="sort-icon">${this.getSortIcon('strategic_thinking')}</span>
                        </th>
                        <th onclick="dashboard.sortCandidates('average')" class="sortable">
                            Promedio<span class="sort-icon">${this.getSortIcon('average')}</span>
                        </th>
                    </tr>
                </thead>
                <tbody>
                    ${filteredCandidates.map(candidate => {
                        const total = Object.values(candidate.scores).reduce((a, b) => Number(a) + Number(b), 0);
                        const average = total / 5;
                        const isSelected = this.selectedCandidate && this.selectedCandidate.sessionId === candidate.sessionId;
                        const safeCandidate = JSON.stringify(candidate).replace(/"/g, '&quot;');
                        return `
                            <tr onclick="dashboard.selectCandidate(${safeCandidate})" 
                                class="candidate-row ${isSelected ? 'selected' : ''}">
                                <td>${candidate.sessionId}</td>
                                <td>${candidate.vacante}</td>
                                <td>${candidate.interactions}</td>
                                <td>${candidate.scores.cultural_alignment}</td>
                                <td>${candidate.scores.growth_mindset}</td>
                                <td>${candidate.scores.engagement_depth}</td>
                                <td>${candidate.scores.role_understanding}</td>
                                <td>${candidate.scores.strategic_thinking}</td>
                                <td><strong>${average.toFixed(1)}</strong></td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
        `;

        tableContainer.innerHTML = tableHTML;
    }

    getSortIcon(column) {
        if (this.sortColumn !== column) {
            return '↕';
        }
        return this.sortDirection === 'desc' ? '↓' : '↑';
    }

    filterByVacante(vacante) {
        this.filteredVacante = vacante;
        this.selectedCandidate = null;
        this.updateChart();
        this.updateStats();
        this.updateCandidatesTable();
    }

    updateChart() {
        if (this.chart) {
            this.chart.data = this.prepareChartData();
            this.chart.update();
        } else {
            this.createChart();
        }
    }

    async refreshData() {
        console.log('Refreshing data...');

        const now = new Date();
        const lastUpdateEl = document.getElementById('lastUpdate');
        if (lastUpdateEl) {
            lastUpdateEl.textContent = `Última actualización: ${now.toLocaleTimeString()}`;
        }

        const bestCandidateElement = document.getElementById('bestCandidate');
        const mostInteractiveElement = document.getElementById('mostInteractive');
        if (bestCandidateElement) bestCandidateElement.replaceWith(bestCandidateElement.cloneNode(true));
        if (mostInteractiveElement) mostInteractiveElement.replaceWith(mostInteractiveElement.cloneNode(true));

        await this.loadDataFromSupabase();
        this.selectedCandidate = null;
        this.updateChart();
        this.updateStats();
        this.updateCandidatesTable();
    }

    async fetchDataFromAPI() {
        try {
            const response = await fetch('https://alvarovargas.app.n8n.cloud/webhook/ac234336-390d-438a-aad6-284a5290743d/chat');
            const data = await response.json();
            this.candidatesData = data;
            this.updateChart();
            this.updateStats();
            this.updateCandidatesTable();
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    }

    // Optional: placeholder mock data loader
    loadMockData() {
        this.candidatesData = [
            {
                sessionId: 'mock-1',
                vacante: 'Dev',
                scores: {
                    cultural_alignment: 3,
                    growth_mindset: 4,
                    engagement_depth: 3,
                    role_understanding: 4,
                    strategic_thinking: 3
                },
                interactions: 12,
                timestamp: new Date().toISOString()
            }
        ];
    }
}

// Initialize dashboard when page loads
let dashboard;
document.addEventListener('DOMContentLoaded', () => {
    dashboard = new ChatScreeningDashboard();
});
