// Dashboard functionality for Chat-Screening
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

    init() {
        this.setupEventListeners();
        this.loadMockData();
        this.createChart();
        this.updateStats();
        this.updateCandidatesTable();
    }

    setupEventListeners() {
        document.getElementById('refreshBtn').addEventListener('click', () => {
            this.refreshData();
        });

        document.getElementById('vacanteFilter').addEventListener('change', (e) => {
            this.filterByVacante(e.target.value);
        });

        document.getElementById('areaFilter').addEventListener('change', (e) => {
            this.updateAreaAverage(e.target.value);
        });
    }

    loadMockData() {
        // Mock data with realistic job titles and interaction counts
        this.candidatesData = [
            {
                sessionId: 'session_001',
                vacante: 'Jefe/a comercial Talca',
                scores: {
                    technical_preparation: 4,
                    cultural_alignment: 3,
                    growth_mindset: 5,
                    engagement_depth: 4,
                    role_understanding: 3,
                    strategic_thinking: 2
                },
                interactions: 8,
                timestamp: '2024-01-15T10:30:00Z'
            },
            {
                sessionId: 'session_002',
                vacante: 'Jefe/a comercial Talca',
                scores: {
                    technical_preparation: 3,
                    cultural_alignment: 4,
                    growth_mindset: 3,
                    engagement_depth: 5,
                    role_understanding: 4,
                    strategic_thinking: 3
                },
                interactions: 12,
                timestamp: '2024-01-15T11:15:00Z'
            },
            {
                sessionId: 'session_003',
                vacante: 'Analista de Compensaciones - Las Condes',
                scores: {
                    technical_preparation: 5,
                    cultural_alignment: 2,
                    growth_mindset: 4,
                    engagement_depth: 3,
                    role_understanding: 5,
                    strategic_thinking: 4
                },
                interactions: 6,
                timestamp: '2024-01-15T12:00:00Z'
            },
            {
                sessionId: 'session_004',
                vacante: 'Analista de Compensaciones - Las Condes',
                scores: {
                    technical_preparation: 4,
                    cultural_alignment: 4,
                    growth_mindset: 3,
                    engagement_depth: 4,
                    role_understanding: 3,
                    strategic_thinking: 3
                },
                interactions: 15,
                timestamp: '2024-01-15T13:00:00Z'
            }
        ];
    }

    createChart() {
        const ctx = document.getElementById('spiderChart').getContext('2d');
        
        const chartData = this.prepareChartData();
        
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
        const labels = ['Técnico', 'Cultural', 'Crecimiento', 'Engagement', 'Rol', 'Estratégico'];
        
        if (this.selectedCandidate) {
            return this.prepareSelectedCandidateData();
        } else if (this.filteredVacante === 'all') {
            return this.prepareAllVacantesData();
        } else {
            return this.prepareFilteredVacanteData();
        }
    }

    prepareSelectedCandidateData() {
        const labels = ['Técnico', 'Cultural', 'Crecimiento', 'Engagement', 'Rol', 'Estratégico'];
        
        const overallAverage = this.calculateOverallAverage();
        const selectedVacanteAverage = this.calculateVacanteAverage(this.selectedCandidate.vacante);
        const selectedCandidateScores = [
            this.selectedCandidate.scores.technical_preparation,
            this.selectedCandidate.scores.cultural_alignment,
            this.selectedCandidate.scores.growth_mindset,
            this.selectedCandidate.scores.engagement_depth,
            this.selectedCandidate.scores.role_understanding,
            this.selectedCandidate.scores.strategic_thinking
        ];
        
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
        const labels = ['Técnico', 'Cultural', 'Crecimiento', 'Engagement', 'Rol', 'Estratégico'];
        
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
        const labels = ['Técnico', 'Cultural', 'Crecimiento', 'Engagement', 'Rol', 'Estratégico'];
        
        const overallAverage = this.calculateOverallAverage();
        const selectedVacanteAverage = this.calculateVacanteAverage(this.filteredVacante);
        const topCandidate = this.findTopCandidateForVacante(this.filteredVacante);
        
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
                data: topCandidate.scores,
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

    calculateOverallAverage() {
        const scoreTypes = ['technical_preparation', 'cultural_alignment', 'growth_mindset', 'engagement_depth', 'role_understanding', 'strategic_thinking'];
        
        return scoreTypes.map(scoreType => {
            if (this.candidatesData.length === 0) return 0;
            const sum = this.candidatesData.reduce((acc, candidate) => acc + candidate.scores[scoreType], 0);
            return sum / this.candidatesData.length;
        });
    }

    calculateVacanteAverage(vacante) {
        const vacanteCandidates = this.candidatesData.filter(candidate => candidate.vacante === vacante);
        const scoreTypes = ['technical_preparation', 'cultural_alignment', 'growth_mindset', 'engagement_depth', 'role_understanding', 'strategic_thinking'];
        
        return scoreTypes.map(scoreType => {
            if (vacanteCandidates.length === 0) return 0;
            const sum = vacanteCandidates.reduce((acc, candidate) => acc + candidate.scores[scoreType], 0);
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
        const vacanteCandidates = this.candidatesData.filter(candidate => candidate.vacante === vacante);
        
        if (vacanteCandidates.length === 0) {
            return {
                sessionId: 'N/A',
                scores: [0, 0, 0, 0, 0, 0]
            };
        }
        
        return vacanteCandidates.reduce((best, current) => {
            const bestTotal = Object.values(best.scores).reduce((a, b) => a + b, 0);
            const currentTotal = Object.values(current.scores).reduce((a, b) => a + b, 0);
            return currentTotal > bestTotal ? current : best;
        });
    }

    updateStats() {
        const totalCandidates = this.candidatesData.length;
        const avgGeneral = this.calculateGeneralAverage();
        const bestCandidate = this.findBestCandidate();
        const mostInteractive = this.findMostInteractiveCandidate();
        
        // Calculate candidates by vacante based on filter
        const candidatesByVacante = this.getCandidatesByVacante();

        document.getElementById('totalCandidates').textContent = totalCandidates;
        document.getElementById('candidatesByVacante').textContent = candidatesByVacante;
        document.getElementById('avgGeneral').textContent = avgGeneral.toFixed(1);
        document.getElementById('bestCandidate').textContent = bestCandidate;
        document.getElementById('mostInteractive').textContent = mostInteractive;
        
        this.updateAreaAverage('technical_preparation');
    }

    getCandidatesByVacante() {
        if (this.filteredVacante === 'all') {
            // Show total candidates when "all" is selected
            return this.candidatesData.length;
        } else {
            // Show candidates count for selected vacante
            return this.candidatesData.filter(candidate => candidate.vacante === this.filteredVacante).length;
        }
    }

    calculateGeneralAverage() {
        if (this.candidatesData.length === 0) return 0;
        const totalSum = this.candidatesData.reduce((acc, candidate) => {
            return acc + Object.values(candidate.scores).reduce((sum, score) => sum + score, 0);
        }, 0);
        return totalSum / (this.candidatesData.length * 6);
    }

    updateAreaAverage(area) {
        if (this.candidatesData.length === 0) {
            document.getElementById('avgByArea').textContent = '0.0';
            return;
        }
        
        const sum = this.candidatesData.reduce((acc, candidate) => acc + candidate.scores[area], 0);
        const average = sum / this.candidatesData.length;
        document.getElementById('avgByArea').textContent = average.toFixed(1);
    }

    findBestCandidate() {
        if (this.candidatesData.length === 0) return '--';
        
        const best = this.candidatesData.reduce((best, current) => {
            const bestTotal = Object.values(best.scores).reduce((a, b) => a + b, 0);
            const currentTotal = Object.values(current.scores).reduce((a, b) => a + b, 0);
            return currentTotal > bestTotal ? current : best;
        });

        return best.sessionId;
    }

    findMostInteractiveCandidate() {
        if (this.candidatesData.length === 0) return '--';
        
        const mostInteractive = this.candidatesData.reduce((best, current) => {
            return current.interactions > best.interactions ? current : best;
        });

        return mostInteractive.sessionId;
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
                case 'technical_preparation':
                    valueA = a.scores.technical_preparation;
                    valueB = b.scores.technical_preparation;
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
                case 'interactions':
                    valueA = a.interactions;
                    valueB = b.interactions;
                    break;
                case 'average':
                    const totalA = Object.values(a.scores).reduce((sum, score) => sum + score, 0);
                    const totalB = Object.values(b.scores).reduce((sum, score) => sum + score, 0);
                    valueA = totalA / 6;
                    valueB = totalB / 6;
                    break;
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
        
        console.log('candidatesData length:', this.candidatesData.length); // Debug line
        
        if (this.candidatesData.length === 0) {
            tableContainer.innerHTML = '<p>No hay datos de candidatos disponibles.</p>';
            return;
        }

        const tableHTML = `
            <table>
                <thead>
                    <tr>
                        <th onclick="dashboard.sortCandidates('sessionId')" class="sortable">
                            Session ID<span class="sort-icon">${this.getSortIcon('sessionId')}</span>
                        </th>
                        <th onclick="dashboard.sortCandidates('vacante')" class="sortable">
                            Vacante<span class="sort-icon">${this.getSortIcon('vacante')}</span>
                        </th>
                        <th onclick="dashboard.sortCandidates('technical_preparation')" class="sortable">
                            Técnico<span class="sort-icon">${this.getSortIcon('technical_preparation')}</span>
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
                        <th onclick="dashboard.sortCandidates('interactions')" class="sortable">
                            Interacciones<span class="sort-icon">${this.getSortIcon('interactions')}</span>
                        </th>
                        <th onclick="dashboard.sortCandidates('average')" class="sortable">
                            Promedio<span class="sort-icon">${this.getSortIcon('average')}</span>
                        </th>
                    </tr>
                </thead>
                <tbody>
                    ${this.candidatesData.map(candidate => {
                        const total = Object.values(candidate.scores).reduce((a, b) => a + b, 0);
                        const average = total / 6;
                        const isSelected = this.selectedCandidate && this.selectedCandidate.sessionId === candidate.sessionId;
                        return `
                            <tr onclick="dashboard.selectCandidate(${JSON.stringify(candidate).replace(/"/g, '&quot;')})" 
                                class="candidate-row ${isSelected ? 'selected' : ''}">
                                <td>${candidate.sessionId}</td>
                                <td>${candidate.vacante}</td>
                                <td>${candidate.scores.technical_preparation}</td>
                                <td>${candidate.scores.cultural_alignment}</td>
                                <td>${candidate.scores.growth_mindset}</td>
                                <td>${candidate.scores.engagement_depth}</td>
                                <td>${candidate.scores.role_understanding}</td>
                                <td>${candidate.scores.strategic_thinking}</td>
                                <td>${candidate.interactions}</td>
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
        }
    }

    refreshData() {
        console.log('Refreshing data...');
        
        const now = new Date();
        document.getElementById('lastUpdate').textContent = 
            `Última actualización: ${now.toLocaleTimeString()}`;
        
        this.loadMockData();
        this.selectedCandidate = null;
        this.updateChart();
        this.updateStats();
        this.updateCandidatesTable();
    }

    async fetchDataFromAPI() {
        try {
            const response = await fetch('your-n8n-webhook-url');
            const data = await response.json();
            this.candidatesData = data;
            this.updateChart();
            this.updateStats();
            this.updateCandidatesTable();
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    }
}

// Initialize dashboard when page loads
let dashboard;
document.addEventListener('DOMContentLoaded', () => {
    dashboard = new ChatScreeningDashboard();
});
