// Dashboard functionality for Chat-Screening
class ChatScreeningDashboard {
    constructor() {
        this.chart = null;
        this.candidatesData = [];
        this.filteredVacante = 'all';
        this.sortColumn = null;
        this.sortDirection = 'asc';
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
    }

    loadMockData() {
        // Mock data with realistic job titles
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
                        text: 'Comparación de Rendimiento'
                    }
                }
            }
        });
    }

    prepareChartData() {
        const labels = ['Técnico', 'Cultural', 'Crecimiento', 'Engagement', 'Rol', 'Estratégico'];
        
        if (this.filteredVacante === 'all') {
            // Show all vacantes with overall average
            return this.prepareAllVacantesData();
        } else {
            // Show only selected vacante with 3 areas
            return this.prepareFilteredVacanteData();
        }
    }

    prepareAllVacantesData() {
        const labels = ['Técnico', 'Cultural', 'Crecimiento', 'Engagement', 'Rol', 'Estratégico'];
        
        // Calculate overall average
        const overallAverage = this.calculateOverallAverage();
        
        // Calculate averages per vacante
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

        // Add vacante averages with decreasing gray shades
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
        
        // 1. Overall average (black)
        const overallAverage = this.calculateOverallAverage();
        
        // 2. Selected vacante average (gray)
        const selectedVacanteAverage = this.calculateVacanteAverage(this.filteredVacante);
        
        // 3. Top candidate for selected vacante (green)
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
        const avgTechnical = this.calculateAverage('technical_preparation');
        const avgCultural = this.calculateAverage('cultural_alignment');
        const bestCandidate = this.findBestCandidate();

        document.getElementById('totalCandidates').textContent = totalCandidates;
        document.getElementById('avgTechnical').textContent = avgTechnical.toFixed(1);
        document.getElementById('avgCultural').textContent = avgCultural.toFixed(1);
        document.getElementById('bestCandidate').textContent = bestCandidate;
    }

    calculateAverage(scoreType) {
        if (this.candidatesData.length === 0) return 0;
        const sum = this.candidatesData.reduce((acc, candidate) => acc + candidate.scores[scoreType], 0);
        return sum / this.candidatesData.length;
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

    sortCandidates(column) {
        // Toggle sort direction if clicking the same column
        if (this.sortColumn === column) {
            this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
        } else {
            this.sortColumn = column;
            this.sortDirection = 'asc';
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
                return this.sortDirection === 'asc' ? -1 : 1;
            }
            if (valueA > valueB) {
                return this.sortDirection === 'asc' ? 1 : -1;
            }
            return 0;
        });

        this.updateCandidatesTable();
    }

    updateCandidatesTable() {
        const tableContainer = document.getElementById('candidatesTable');
        
        if (this.candidatesData.length === 0) {
            tableContainer.innerHTML = '<p>No hay datos de candidatos disponibles.</p>';
            return;
        }

        const tableHTML = `
            <table>
                <thead>
                    <tr>
                        <th onclick="dashboard.sortCandidates('sessionId')" class="sortable">
                            Session ID ${this.getSortIcon('sessionId')}
                        </th>
                        <th onclick="dashboard.sortCandidates('vacante')" class="sortable">
                            Vacante ${this.getSortIcon('vacante')}
                        </th>
                        <th onclick="dashboard.sortCandidates('technical_preparation')" class="sortable">
                            Técnico ${this.getSortIcon('technical_preparation')}
                        </th>
                        <th onclick="dashboard.sortCandidates('cultural_alignment')" class="sortable">
                            Cultural ${this.getSortIcon('cultural_alignment')}
                        </th>
                        <th onclick="dashboard.sortCandidates('growth_mindset')" class="sortable">
                            Crecimiento ${this.getSortIcon('growth_mindset')}
                        </th>
                        <th onclick="dashboard.sortCandidates('engagement_depth')" class="sortable">
                            Engagement ${this.getSortIcon('engagement_depth')}
                        </th>
                        <th onclick="dashboard.sortCandidates('role_understanding')" class="sortable">
                            Rol ${this.getSortIcon('role_understanding')}
                        </th>
                        <th onclick="dashboard.sortCandidates('strategic_thinking')" class="sortable">
                            Estratégico ${this.getSortIcon('strategic_thinking')}
                        </th>
                        <th onclick="dashboard.sortCandidates('average')" class="sortable">
                            Promedio ${this.getSortIcon('average')}
                        </th>
                    </tr>
                </thead>
                <tbody>
                    ${this.candidatesData.map(candidate => {
                        const total = Object.values(candidate.scores).reduce((a, b) => a + b, 0);
                        const average = total / 6; // 6 categories total
                        return `
                            <tr>
                                <td>${candidate.sessionId}</td>
                                <td>${candidate.vacante}</td>
                                <td>${candidate.scores.technical_preparation}</td>
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
            return '↕️'; // Neutral sort icon
        }
        return this.sortDirection === 'asc' ? '↑' : '↓';
    }

    filterByVacante(vacante) {
        this.filteredVacante = vacante;
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
