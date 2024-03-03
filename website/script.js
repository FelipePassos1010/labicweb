document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('arquivo_csv').addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            event.preventDefault();
            toggleOptionsDisplay();
        }
    });

    document.getElementById('prosseguir').addEventListener('click', function(event) {
        event.preventDefault();
        toggleOptionsDisplay();
    });

    document.getElementById('close-options').addEventListener('click', function() {
        document.getElementById('options').style.display = 'none';
        document.getElementById('downloadFilteredCsv').disabled = true;
    });

    document.querySelectorAll('#options input[type="checkbox"]').forEach(function(checkbox) {
        checkbox.addEventListener('change', function() {
            const algumMarcado = Array.from(document.querySelectorAll('#options input[type="checkbox"]:not(#selecionar-todos)')).some(cb => cb.checked);
            document.getElementById('downloadFilteredCsv').disabled = !algumMarcado;
            if (this.id === 'selecionar-todos') {
                const checkboxes = document.querySelectorAll('#options input[type="checkbox"]:not(#selecionar-todos)');
                checkboxes.forEach(cb => cb.checked = this.checked);
            }
        });
    });

    document.getElementById('downloadFilteredCsv').addEventListener('click', function() {
        const selectedFields = Array.from(document.querySelectorAll('#options input[name="fields"]:checked')).map(cb => cb.value);

        if (selectedFields.length === 0) {
            alert("Selecione pelo menos um campo para gerar o arquivo.");
            return;
        }

        const originalCsvUrl = 'data.csv'; // Substitua com o URL do seu arquivo CSV original
        Papa.parse(originalCsvUrl, {
            download: true,
            header: true,
            dynamicTyping: true,
            complete: function(results) {
                const originalData = results.data;

                // Filtra as colunas não selecionadas
                const filteredData = originalData.map(row => {
                    const rowData = {};
                    for (const field of selectedFields) {
                        if (field in row) {
                            rowData[field] = row[field];
                        }
                    }
                    return rowData;
                });

                generateCsv(filteredData);
            }
        });
    });

    function toggleOptionsDisplay() {
        var filename = document.getElementById('arquivo_csv').value;
        var optionsDiv = document.getElementById('options');

        if (filename.toLowerCase() === 'data.csv') {
            optionsDiv.style.display = 'block';
        } else {
            alert("Por favor, digite 'data.csv' para prosseguir.");
            optionsDiv.style.display = 'none';
        }
    }

    function generateCsv(data) {
        const csvContent = Papa.unparse(data, {
            quotes: true, // Garante que os campos sejam adequadamente escapados
            encoding: "utf-8",
        });
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", "filtered_data.csv");
        document.body.appendChild(link); // Adiciona o link ao corpo do documento
        link.click(); // Simula um clique no link para iniciar o download
        document.body.removeChild(link); // Remove o link do corpo do documento após o download
    }
});

document.getElementById('avancar').addEventListener('click', function() {
    const filename = document.getElementById('arquivo_csv').value;
    if (filename.toLowerCase() === 'data.csv') {
        Papa.parse('data.csv', {
            download: true,
            header: true,
            complete: function(results) {
                const data = results.data;
                openCsvInNewTab(data);
            }
        });
    } else {
        alert("Digite 'data.csv' para prosseguir.");
    }
});

function openCsvInNewTab(data) {
    const table = document.createElement('table');
    table.setAttribute('id', 'csvTable');
    const thead = document.createElement('thead');
    const tbody = document.createElement('tbody');
    const searchRow = document.createElement('tr');
    
    // Criar linha de busca
    Object.keys(data[0]).forEach(() => {
        const searchCell = document.createElement('th');
        const input = document.createElement('input');
        input.setAttribute('type', 'text');
        input.setAttribute('onkeyup', 'filterTable(event)');
        searchCell.appendChild(input);
        searchRow.appendChild(searchCell);
    });
    thead.appendChild(searchRow);
    
    // Adiciona cabeçalhos
    const headerRow = document.createElement('tr');
    Object.keys(data[0]).forEach(headerText => {
        const header = document.createElement('th');
        header.textContent = headerText;
        headerRow.appendChild(header);
    });
    thead.appendChild(headerRow);
    
    // Adiciona linhas de dados
    data.forEach(row => {
        const dataRow = document.createElement('tr');
        Object.values(row).forEach(text => {
            const cell = document.createElement('td');
            cell.textContent = text;
            dataRow.appendChild(cell);
        });
        tbody.appendChild(dataRow);
    });
    
    table.appendChild(thead);
    table.appendChild(tbody);
    const newTab = window.open();
    newTab.document.write('<html><head><title>Visualização do CSV</title><style>input { width: 100%; }</style></head><body>');
    newTab.document.body.appendChild(table);
    newTab.document.write('<script>' + filterTable.toString() + '</script></body></html>');
    newTab.document.close();
}

function filterTable(event) {
    var filter = event.target.value.toUpperCase();
    var rows = document.querySelector("#csvTable tbody").rows;
    
    for (var i = 0; i < rows.length; i++) {
        var col = rows[i].cells[event.target.parentElement.cellIndex];
        if (col) {
            var txtValue = col.textContent || col.innerText;
            if (txtValue.toUpperCase().indexOf(filter) > -1) {
                rows[i].style.display = "";
            } else {
                rows[i].style.display = "none";
            }
        }       
    }
}
