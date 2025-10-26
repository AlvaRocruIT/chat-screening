// Dashboard functionality for Chat-Screening
class ChatScreeningDashboard {
    constructor() {
        this.chart = null;
        this.candidatesData = [];
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadMockData(); // Start with mock data
        this.createChart();
        this.updateStats();
        this.updateCandidatesTable();
    }

    setupEventListeners() {
        // Refresh button
        document.getElementById('refreshBtn').addEventListener('click', () => {
            this.refreshData();
        });

        // Filter dropdown
        document.getElementById('vacanteFilter').addEventListener('change', (e) => {
            this.filterByVacante(e.target.value);
        });
    }

    loadMockData() {
        // Mock data for development
        this.candidatesData = [
            {
                sessionId: 'session_001',
                vacante: 'vacante1',
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
                vacante: 'vacante1',
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
                vacante: 'vacante2',
                scores: {
                    technical_preparation: 5,
                    cultural_alignment: 2,
                    growth_mindset: 4,
                    engagement_depth: 3,
                    role_understanding: 5,
                    strategic_thinking: 4
                },
                timestamp: '2024-01-15T12:00:00Z'
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
                        text: 'Rendimiento por Candidato'
                    }
                }
            }
        });
    }

    prepareChartData() {
        const labels = ['Técnico', 'Cultural', 'Crecimiento', 'Engagement', 'Rol', 'Estratégico'];
        const datasets = [];

        this.candidatesData.forEach(candidate => {
            datasets.push({
                label: `Candidato ${candidate.sessionId}`,
                data: [
                    candidate.scores.technical_preparation,
                    candidate.scores.cultural_alignment,
                    candidate.scores.growth_mindset,
                    candidate.scores.engagement_depth,
                    candidate.scores.role_understanding,
                    candidate.scores.strategic_thinking
                ],
                borderColor: this.getRandomColor(),
                backgroundColor: this.getRandomColor(0.2),
                borderWidth: 2
            });
        });

        return {
            labels: labels,
            datasets: datasets
        };
    }

    getRandomColor(alpha = 1) {
        const colors = [
            `rgba(44, 44, 44, ${alpha})`,
            `rgba(68, 68, 68, ${alpha})`,
            `rgba(102, 102, 102, ${alpha})`,
            `rgba(136, 136, 136, ${alpha})`,
            `rgba(170, 170, 170, ${alpha})`
        ];
        return colors[Math.floor(Math.random() * colors.length)];
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
                        <th>Session ID</th>
                        <th>Vacante</th>
                        <th>Técnico</th>
                        <th>Cultural</th>
                        <th>Crecimiento</th>
                        <th>Engagement</th>
                        <th>Rol</th>
                        <th>Estratégico</th>
                        <th>Total</th>
                    </tr>
                </thead>
                <tbody>
                    ${this.candidatesData.map(candidate => {
                        const total = Object.values(candidate.scores).reduce((a, b) => a + b, 0);
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
                                <td><strong>${total}</strong></td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
        `;

        tableContainer.innerHTML = tableHTML;
    }

    filterByVacante(vacante) {
        if (vacante === 'all') {
            this.candidatesData = this.candidatesData; // Show all
        } else {
            this.candidatesData = this.candidatesData.filter(candidate => candidate.vacante === vacante);
        }
        
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
        // Simulate data refresh
        console.log('Refreshing data...');
        
        // Update last update time
        const now = new Date();
        document.getElementById('lastUpdate').textContent = 
            `Última actualización: ${now.toLocaleTimeString()}`;
        
        // In real implementation, this would fetch from your n8n API
        // this.fetchDataFromAPI();
        
        // For now, just reload mock data
        this.loadMockData();
        this.updateChart();
        this.updateStats();
        this.updateCandidatesTable();
    }

    // Future method to connect to your n8n API
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
document.addEventListener('DOMContentLoaded', () => {
    new ChatScreeningDashboard();
});
