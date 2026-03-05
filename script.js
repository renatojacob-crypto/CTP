document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('atendimento-form');
    const tableBody = document.getElementById('atendimento-body');
    const tipoOutrosCheck = document.getElementById('tipo-outros-check');
    const tipoOutrosText = document.getElementById('tipo-outros-text');
    const modal = document.getElementById('details-modal');
    const modalContent = document.getElementById('modal-body-content');
    const closeBtn = document.querySelector('.close-btn');
    // State management
    let atendimentos = JSON.parse(localStorage.getItem('atendimentos')) || [];

    // Initialize table
    renderTable();

    // Toggle "Outros" input
    tipoOutrosCheck.addEventListener('change', () => {
        tipoOutrosText.disabled = !tipoOutrosCheck.checked;
        if (tipoOutrosCheck.checked) tipoOutrosText.focus();
    });

    // Form Submission
    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const formData = {
            id: atendimentos.length > 0 ? atendimentos[atendimentos.length - 1].id + 1 : 1,
            data: formatDate(document.getElementById('data-atendimento').value),
            horaInicio: document.getElementById('hora-inicial').value,
            horaFim: document.getElementById('hora-final').value,
            canal: document.getElementById('canal-atendimento').value,
            instituicao: document.getElementById('instituicao').value,
            nome: document.getElementById('nome-contato').value,
            cargo: document.getElementById('cargo-contato').value,
            tipos: getCheckedValues('tipo'),
            segmentos: getCheckedValues('segmento'),
            programa: document.getElementById('programa').value,
            tecnologias: getCheckedValues('tecnologia'),
            atividades: getCheckedValues('atividade'),
            aula: document.getElementById('aula-envolvida').value,
            status: document.getElementById('status-atendimento').value,
            descricao: document.getElementById('descricao-atendimento').value,
            devolutiva: document.getElementById('devolutiva-atendimento').value,
            tempo: calculateDuration(document.getElementById('hora-inicial').value, document.getElementById('hora-final').value)
        };

        // Handle "Outros" text
        if (tipoOutrosCheck.checked && tipoOutrosText.value) {
            const index = formData.tipos.indexOf('Outros');
            if (index > -1) formData.tipos[index] = `Outros: ${tipoOutrosText.value}`;
        }

        atendimentos.push(formData);
        saveData();
        renderTable();
        form.reset();
        tipoOutrosText.disabled = true;
    });

    function getCheckedValues(name) {
        return Array.from(document.querySelectorAll(`input[name="${name}"]:checked`)).map(el => el.value);
    }

    function formatDate(dateStr) {
        if (!dateStr) return '';
        const [year, month, day] = dateStr.split('-');
        return `${day}/${month}/${year}`;
    }

    function calculateDuration(start, end) {
        const [sHours, sMins] = start.split(':').map(Number);
        const [eHours, eMins] = end.split(':').map(Number);

        let diff = (eHours * 60 + eMins) - (sHours * 60 + sMins);
        if (diff < 0) diff += 1440; // Handle overnight if necessary

        const hours = Math.floor(diff / 60);
        const mins = diff % 60;
        return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
    }

    function saveData() {
        localStorage.setItem('atendimentos', JSON.stringify(atendimentos));
    }

    function renderTable() {
        tableBody.innerHTML = '';
        atendimentos.forEach((item, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${item.id}</td>
                <td>${item.data}</td>
                <td>${item.horaInicio}</td>
                <td>${item.horaFim}</td>
                <td><strong>${item.tempo}</strong></td>
                <td>${item.canal}</td>
                <td>${item.instituicao}</td>
                <td>${item.nome}</td>
                <td>${item.cargo}</td>
                <td><span class="status-pills status-${item.status.toLowerCase().replace(' ', '-')}">${item.status}</span></td>
                <td>
                    <button class="btn btn-action btn-view" onclick="viewDetails(${index})">Ver</button>
                    <button class="btn btn-action btn-delete" onclick="deleteEntry(${index})">X</button>
                </td>
            `;
            tableBody.appendChild(row);
        });
    }

    window.viewDetails = (index) => {
        const item = atendimentos[index];
        modalContent.innerHTML = `
            <h2 style="color: var(--accent); margin-bottom: 1rem;">Detalhes do Atendimento #${item.id}</h2>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; border-bottom: 1px solid var(--glass-border); padding-bottom: 1rem; margin-bottom: 1rem;">
                <div><p><strong style="color: var(--primary);">Data:</strong> ${item.data}</p></div>
                <div><p><strong style="color: var(--primary);">Duração:</strong> ${item.horaInicio} - ${item.horaFim} (${item.tempo})</p></div>
                <div><p><strong style="color: var(--primary);">Instituição:</strong> ${item.instituicao}</p></div>
                <div><p><strong style="color: var(--primary);">Contato:</strong> ${item.nome} (${item.cargo})</p></div>
                <div><p><strong style="color: var(--primary);">Canal:</strong> ${item.canal}</p></div>
                <div><p><strong style="color: var(--primary);">Status:</strong> ${item.status}</p></div>
            </div>
            <div style="margin-bottom: 1rem;">
                <p><strong style="color: var(--primary);">Tipos:</strong> ${item.tipos.join(', ')}</p>
                <p><strong style="color: var(--primary);">Segmentos:</strong> ${item.segmentos.join(', ')}</p>
                <p><strong style="color: var(--primary);">Programa:</strong> ${item.programa}</p>
                <p><strong style="color: var(--primary);">Aulas:</strong> ${item.aula || 'N/A'}</p>
            </div>
            <div style="margin-bottom: 1rem;">
                <p><strong style="color: var(--accent);">Descrição:</strong></p>
                <p style="background: rgba(0,0,0,0.2); padding: 1rem; border-radius: 8px; margin-top: 0.5rem;">${item.descricao}</p>
            </div>
            <div>
                <p><strong style="color: var(--accent);">Devolutiva:</strong></p>
                <p style="background: rgba(0,0,0,0.2); padding: 1rem; border-radius: 8px; margin-top: 0.5rem;">${item.devolutiva || 'Sem devolutiva registrada.'}</p>
            </div>
        `;
        modal.style.display = 'block';
    };

    window.deleteEntry = (index) => {
        if (confirm('Tem certeza que deseja excluir este registro?')) {
            atendimentos.splice(index, 1);
            saveData();
            renderTable();
        }
    };

    closeBtn.onclick = () => modal.style.display = 'none';
    window.onclick = (e) => { if (e.target == modal) modal.style.display = 'none'; };

    // CSV Export
    document.getElementById('export-btn').addEventListener('click', () => {
        if (atendimentos.length === 0) return alert('Nenhum dado para exportar.');

        const headers = ["ID", "Data", "Hora Inicio", "Hora Fim", "Canal", "Instituicao", "Nome", "Cargo", "Tipos", "Segmentos", "Programa", "Tecnologias", "Atividades", "Aula", "Descricao", "Devolutiva", "Status", "Tempo"];
        const csvRows = [headers.join(',')];

        atendimentos.forEach(item => {
            const values = [
                item.id,
                item.data,
                item.horaInicio,
                item.horaFim,
                `"${item.canal}"`,
                `"${item.instituicao}"`,
                `"${item.nome}"`,
                `"${item.cargo}"`,
                `"${item.tipos.join('; ')}"`,
                `"${item.segmentos.join('; ')}"`,
                `"${item.programa}"`,
                `"${item.tecnologias.join('; ')}"`,
                `"${item.atividades.join('; ')}"`,
                `"${item.aula}"`,
                `"${item.descricao.replace(/\n/g, ' ')}"`,
                `"${item.devolutiva.replace(/\n/g, ' ')}"`,
                item.status,
                item.tempo
            ];
            csvRows.push(values.join(','));
        });

        const csvContent = "data:text/csv;charset=utf-8," + csvRows.join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `atendimentos_zoom_${new Date().toLocaleDateString()}.csv`);
        document.body.appendChild(link);
        link.click();
    });

    // JSON Storage Logic
    document.getElementById('save-json-btn').addEventListener('click', () => {
        const dataStr = JSON.stringify(atendimentos, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `atendimentos_backup_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });

    document.getElementById('load-json-btn').addEventListener('click', () => {
        document.getElementById('file-input').click();
    });

    document.getElementById('file-input').addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const imported = JSON.parse(event.target.result);
                if (Array.isArray(imported)) {
                    atendimentos = imported;
                    saveData();
                    renderTable();
                    alert('Dados carregados com sucesso!');
                } else {
                    alert('Formato de arquivo inválido.');
                }
            } catch (err) {
                alert('Erro ao ler o arquivo.');
            }
        };
        reader.readAsText(file);
    });
});
