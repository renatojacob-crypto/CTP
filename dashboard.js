document.addEventListener('DOMContentLoaded', () => {
    const dashStart = document.getElementById('dash-filter-start');
    const dashEnd = document.getElementById('dash-filter-end');

    let charts = {};
    let atendimentos = JSON.parse(localStorage.getItem('atendimentos')) || [];

    // Initial render
    updateDashboard();

    dashStart.addEventListener('change', updateDashboard);
    dashEnd.addEventListener('change', updateDashboard);

    function updateDashboard() {
        let filtered = [...atendimentos];

        if (dashStart.value || dashEnd.value) {
            filtered = filtered.filter(item => {
                const itemDate = parseDate(item.data);
                const start = dashStart.value ? new Date(dashStart.value) : null;
                const end = dashEnd.value ? new Date(dashEnd.value) : null;

                if (start && itemDate < start) return false;
                if (end && itemDate > end) return false;
                return true;
            });
        }

        updateKPIs(filtered);
        renderCharts(filtered);
    }

    function parseDate(dateStr) {
        if (!dateStr) return new Date();
        const [day, month, year] = dateStr.split('/').map(Number);
        return new Date(year, month - 1, day);
    }

    function updateKPIs(data) {
        const total = data.length;
        let totalMins = 0;

        data.forEach(item => {
            const [h, m] = item.tempo.split(':').map(Number);
            totalMins += (h * 60) + m;
        });

        const avg = total > 0 ? Math.round(totalMins / total) : 0;

        document.getElementById('kpi-total-atendimentos').textContent = total;
        document.getElementById('kpi-tempo-total').textContent = formatMinutes(totalMins);
        document.getElementById('kpi-tempo-medio').textContent = formatMinutes(avg);
    }

    function formatMinutes(total) {
        const h = Math.floor(total / 60);
        const m = total % 60;
        return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    }

    function renderCharts(data) {
        destroyCharts();
        if (data.length === 0) return;

        createChart('chart-canal', 'pie', 'Atendimentos por Canal', countField(data, 'canal'));
        createChart('chart-instituicao', 'bar', 'Top 6 Instituições', getTopN(countField(data, 'instituicao'), 6));
        createChart('chart-cargo', 'bar', 'Atendimentos por Cargo', countField(data, 'cargo'));
        createChart('chart-tipo', 'bar', 'Tipos de Atendimento', countArrayField(data, 'tipos'));

        createChart('chart-segmento', 'pie', 'Segmento (%)', countArrayField(data, 'segmentos'));
        createChart('chart-programa', 'pie', 'Programa (%)', countField(data, 'programa'));
        createChart('chart-tecnologia', 'pie', 'Tecnologia (%)', countArrayField(data, 'tecnologias'));
        createChart('chart-atividade', 'pie', 'Atividade (%)', countArrayField(data, 'atividades'));
        createChart('chart-status', 'pie', 'Status (%)', countField(data, 'status'));
    }

    function createChart(id, type, label, counts) {
        const ctx = document.getElementById(id);
        if (!ctx) return;

        charts[id] = new Chart(ctx, {
            type: type,
            data: {
                labels: Object.keys(counts),
                datasets: [{
                    label: label,
                    data: Object.values(counts),
                    backgroundColor: type === 'pie'
                        ? ['#6366f1', '#22d3ee', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']
                        : '#6366f1'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                aspectRatio: type === 'pie' ? 1.5 : 2,
                plugins: {
                    legend: {
                        display: type === 'pie',
                        position: 'bottom',
                        labels: { color: '#f8fafc', font: { size: 10 } }
                    }
                },
                scales: type === 'bar' ? {
                    y: { beginAtZero: true, grid: { color: 'rgba(255,255,255,0.1)' }, ticks: { color: '#94a3b8' } },
                    x: { grid: { display: false }, ticks: { color: '#94a3b8', font: { size: 10 } } }
                } : {}
            }
        });
    }

    function countField(data, field) {
        const counts = {};
        data.forEach(item => {
            if (item[field]) counts[item[field]] = (counts[item[field]] || 0) + 1;
        });
        return counts;
    }

    function countArrayField(data, field) {
        const counts = {};
        data.forEach(item => {
            if (item[field] && Array.isArray(item[field])) {
                item[field].forEach(val => {
                    const label = val.split(':')[0];
                    counts[label] = (counts[label] || 0) + 1;
                });
            }
        });
        return counts;
    }

    function getTopN(counts, n) {
        return Object.entries(counts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, n)
            .reduce((obj, [key, val]) => ({ ...obj, [key]: val }), {});
    }

    function destroyCharts() {
        Object.values(charts).forEach(chart => {
            if (chart) chart.destroy();
        });
        charts = {};
    }
});
