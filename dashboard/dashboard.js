// Chat-Screening Dashboard

class ChatScreeningDashboard {
  constructor() {
    this.chart = null;
    this.candidates = [];
    this.filteredVacante = 'all';
    this.sort = { column: null, direction: 'desc' }; // desc by default
  }

  init() {
    this.bindUI();
    this.loadMockData();
    this.renderAll();
  }

  bindUI() {
    document.getElementById('refreshBtn')?.addEventListener('click', () => this.refresh());
    document.getElementById('vacanteFilter')?.addEventListener('change', (e) => {
      this.filteredVacante = e.target.value;
      this.renderAll();
    });
  }

  // Data
  loadMockData() {
    this.candidates = [
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

  async fetchFromN8N() {
    // Replace with your n8n webhook when ready
    // const res = await fetch('https://your-n8n-endpoint');
    // this.candidates = await res.json();
    // this.renderAll();
  }

  refresh() {
    const now = new Date();
    const lastUpdateEl = document.getElementById('lastUpdate');
    if (lastUpdateEl) lastUpdateEl.textContent = `Última actualización: ${now.toLocaleTimeString()}`;

    // For now reload mock data; later call fetchFromN8N()
    this.loadMockData();
    this.renderAll();
  }

  // Render
  renderAll() {
    this.updateStats();
    this.renderChart();
    this.renderTable();
  }

  // Stats
  updateStats() {
    const list = this.filteredList();
    const total = list.length;
    const avgTech = this.averageOf(list, 'technical_preparation');
    const avgCult = this.averageOf(list, 'cultural_alignment');
    const best = this.bestCandidateId(list);

    document.getElementById('totalCandidates').textContent = String(total);
    document.getElementById('avgTechnical').textContent = avgTech.toFixed(1);
    document.getElementById('avgCultural').textContent = avgCult.toFixed(1);
    document.getElementById('bestCandidate').textContent = best ?? '--';
  }

  averageOf(list, key) {
    if (!list.length) return 0;
    const sum = list.reduce((acc, c) => acc + (c.scores[key] ?? 0), 0);
    return sum / list.length;
  }

  bestCandidateId(list) {
    if (!list.length) return null;
    const best = list.reduce((best, cur) => {
      const sumBest = Object.values(best.scores).reduce((a, b) => a + b, 0);
      const sumCur = Object.values(cur.scores).reduce((a, b) => a + b, 0);
      return sumCur > sumBest ? cur : best;
    });
    return best.sessionId;
  }

  // Chart
  renderChart() {
    const ctx = document.getElementById('spiderChart')?.getContext('2d');
    if (!ctx) return;

    const labels = ['Técnico', 'Cultural', 'Crecimiento', 'Engagement', 'Rol', 'Estratégico'];

    const overall = this.vectorAverage(this.candidates);
    const datasets = [
      {
        label: 'Promedio General',
        data: overall,
        borderColor: '#2c2c2c',
        backgroundColor: 'rgba(44,44,44,0.18)',
        borderWidth: 3,
        pointRadius: 5
      }
    ];

    if (this.filteredVacante === 'all') {
      const perVacante = this.groupByVacante();
      const colors = ['#666', '#999', '#bbb', '#ddd'];
      let i = 0;
      Object.entries(perVacante).forEach(([vacante, arr]) => {
        datasets.push({
          label: vacante,
          data: this.vectorAverage(arr),
          borderColor: colors[i % colors.length],
          backgroundColor: 'rgba(170,170,170,0.18)',
          borderWidth: 2,
          pointRadius: 3
        });
        i++;
      });
    } else {
      const list = this.filteredList();
      const vacAvg = this.vectorAverage(list);
      const best = this.bestVector(list);

      datasets.push(
        {
          label: `Promedio ${this.filteredVacante}`,
          data: vacAvg,
          borderColor: '#666',
          backgroundColor: 'rgba(102,102,102,0.18)',
          borderWidth: 2,
          pointRadius: 3
        },
        {
          label: `Mejor Candidato ${this.filteredVacante}`,
          data: best,
          borderColor: '#78FF3B',
          backgroundColor: 'rgba(120,255,59,0.18)',
          borderWidth: 2,
          pointRadius: 3
        }
      );
    }

    const config = {
      type: 'radar',
      data: { labels, datasets },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: { r: { beginAtZero: true, max: 5, ticks: { stepSize: 1 } } },
        plugins: { legend: { position: 'top' }, title: { display: false } }
      }
    };

    if (this.chart) {
      this.chart.data = config.data;
      this.chart.options = config.options;
      this.chart.update();
    } else {
      this.chart = new Chart(ctx, config);
    }
  }

  groupByVacante() {
    return this.candidates.reduce((acc, c) => {
      acc[c.vacante] = acc[c.vacante] || [];
      acc[c.vacante].push(c);
      return acc;
    }, {});
  }

  filteredList() {
    if (this.filteredVacante === 'all') return this.candidates;
    return this.candidates.filter(c => c.vacante === this.filteredVacante);
  }

  toVector(scores) {
    return [
      scores.technical_preparation,
      scores.cultural_alignment,
      scores.growth_mindset,
      scores.engagement_depth,
      scores.role_understanding,
      scores.strategic_thinking
    ];
  }

  vectorAverage(arr) {
    if (!arr.length) return [0, 0, 0, 0, 0, 0];
    const totals = arr.reduce((acc, c) => {
      const v = this.toVector(c.scores);
      return acc.map((val, i) => val + v[i]);
    }, [0, 0, 0, 0, 0, 0]);
    return totals.map(v => v / arr.length);
  }

  bestVector(arr) {
    if (!arr.length) return [0, 0, 0, 0, 0, 0];
    const best = arr.reduce((best, cur) => {
      const sumBest = Object.values(best.scores).reduce((a, b) => a + b, 0);
      const sumCur = Object.values(cur.scores).reduce((a, b) => a + b, 0);
      return sumCur > sumBest ? cur : best;
    });
    return this.toVector(best.scores);
  }

  // Table
  renderTable() {
    const container = document.getElementById('candidatesTable');
    if (!container) return;

    const list = [...this.filteredList()];
    this.sortList(list);

    const rowsHtml = list.map(c => {
      const avg = (Object.values(c.scores).reduce((a, b) => a + b, 0) / 6).toFixed(1);
      return `
        <tr>
          <td>${c.sessionId}</td>
          <td>${c.vacante}</td>
          <td>${c.scores.technical_preparation}</td>
          <td>${c.scores.cultural_alignment}</td>
          <td>${c.scores.growth_mindset}</td>
          <td>${c.scores.engagement_depth}</td>
          <td>${c.scores.role_understanding}</td>
          <td>${c.scores.strategic_thinking}</td>
          <td><strong>${avg}</strong></td>
        </tr>
      `;
    }).join('');

    container.innerHTML = `
      <table>
        <thead>
          <tr>
            ${this.th('sessionId', 'Session ID')}
            ${this.th('vacante', 'Vacante')}
            ${this.th('technical_preparation', 'Técnico')}
            ${this.th('cultural_alignment', 'Cultural')}
            ${this.th('growth_mindset', 'Crecimiento')}
            ${this.th('engagement_depth', 'Engagement')}
            ${this.th('role_understanding', 'Rol')}
            ${this.th('strategic_thinking', 'Estratégico')}
            ${this.th('average', 'Promedio')}
          </tr>
        </thead>
        <tbody>${rowsHtml}</tbody>
      </table>
    `;
  }

  th(key, label) {
    const icon = this.sort.column === key ? (this.sort.direction === 'desc' ? '↓' : '↑') : '↕';
    return `<th class="sortable" data-key="${key}">${label}<span class="sort-icon">${icon}</span></th>`;
  }

  sortList(list) {
    const col = this.sort.column;
    if (!col) return;

    list.sort((a, b) => {
      const valA = this.valueFor(a, col);
      const valB = this.valueFor(b, col);
      if (valA < valB) return this.sort.direction === 'desc' ? 1 : -1;
      if (valA > valB) return this.sort.direction === 'desc' ? -1 : 1;
      return 0;
    });
  }

  valueFor(item, col) {
    if (col === 'sessionId') return item.sessionId;
    if (col === 'vacante') return item.vacante;
    if (col === 'average') {
      const t = Object.values(item.scores).reduce((s, v) => s + v, 0);
      return t / 6;
    }
    return item.scores[col] ?? 0;
  }
}

// Wire up
let dashboard;
document.addEventListener('DOMContentLoaded', () => {
  dashboard = new ChatScreeningDashboard();

  // Delegated sorting
  document.getElementById('candidatesTable')?.addEventListener('click', (e) => {
    const th = e.target.closest('th.sortable');
    if (!th) return;
    const key = th.dataset.key;
    if (dashboard.sort.column === key) {
      dashboard.sort.direction = dashboard.sort.direction === 'desc' ? 'asc' : 'desc';
    } else {
      dashboard.sort.column = key;
      dashboard.sort.direction = 'desc';
    }
    dashboard.renderTable();
  });
});
