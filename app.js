// Função para inicializar o IndexedDB
function initIndexedDB() {
    const dbName = "PWA_DB";
    const request = indexedDB.open(dbName, 1);

    request.onerror = function(event) {
        console.error("Erro ao abrir o banco de dados", event);
    };

    request.onupgradeneeded = function(event) {
        const db = event.target.result;
        if (!db.objectStoreNames.contains("respostas")) {
            db.createObjectStore("respostas", { autoIncrement: true });
        }
    };

    return request;
}

// Função para salvar as respostas no IndexedDB
function salvarRespostas(respostas) {
    const request = initIndexedDB();

    request.onsuccess = function(event) {
        const db = event.target.result;
        const transaction = db.transaction(["respostas"], "readwrite");
        const store = transaction.objectStore("respostas");
        store.add(respostas);
    };
}

// Função para enviar respostas ao servidor
function enviarRespostasAoServidor(respostas) {
    fetch('https://seu-servidor.com/api/respostas', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(respostas)
    })
    .then(response => response.json())
    .then(data => {
        console.log('Respostas enviadas com sucesso:', data);
    })
    .catch(error => {
        console.error('Erro ao enviar respostas:', error);
    });
}

function formatCurrency(input) {
    let value = input.value;
    value = value.replace(/\D/g, ""); // Remove caracteres não numéricos
    value = (value / 100).toFixed(2); // Divide por 100 para obter os centavos
    value = value.replace(".", ",");
    input.value = `R$${value}`;
}

const valorInput = document.getElementById('valor');
valorInput.addEventListener('input', function() {
    formatCurrency(this);
});

function checkNucleoOption() {
    const outrosInput = document.getElementById('outros');
    const selectedOption = document.querySelector('input[name="q1"]:checked').value;

    if (selectedOption === "outros") {
        outrosInput.disabled = false;
        outrosInput.focus();
    } else {
        outrosInput.disabled = true;
        outrosInput.value = ''; // Limpa o valor se "Outros" não estiver selecionado
    }
}

// Adiciona ouvinte de evento para as opções de "Núcleo"
const nucleoOptions = document.querySelectorAll('input[name="q1"]');
nucleoOptions.forEach(option => {
    option.addEventListener('change', checkNucleoOption);
});

document.getElementById('telefone').addEventListener('input', function() {
    let value = this.value.replace(/\D/g, ''); // Remove todos os caracteres não numéricos
    if (value.length <= 11) { // Telefone sem DDI
        value = value.replace(/(\d{2})(\d{0,5})(\d{0,4}).*/, '($1) $2-$3');
    } else { // Telefone com DDI
        value = value.replace(/(\d{2})(\d{2})(\d{0,5})(\d{0,4}).*/, '+$1 ($2) $3-$4');
    }
    this.value = value;
});

document.getElementById('updatePhone').addEventListener('click', function() {
    const telefoneInput = document.getElementById('telefone');
    telefoneInput.disabled = !telefoneInput.disabled; // Inverte o estado de "disabled"
    if (!telefoneInput.disabled) {
        telefoneInput.focus(); // Coloca o foco no campo se estiver habilitado
    }
});

document.getElementById('submit').addEventListener('click', function() {
    const q1 = document.querySelector('input[name="q1"]:checked').value;
    const outros = document.getElementById('outros').value;
    const nome = document.getElementById('nome').value;
    const telefone = document.getElementById('telefone').value;
    const valor = document.getElementById('valor').value;
    const data = document.getElementById('data').value;
    const q5 = document.querySelector('input[name="q5"]:checked').value;

    const respostas = {
        q1: q1 === "outros" ? outros : q1,
        nome: nome,
        telefone: telefone,
        valor: valor,
        data: data,
        q5: q5
    };

    salvarRespostas(respostas);
    enviarRespostasAoServidor(respostas);

    alert('Respostas enviadas e salvas no IndexedDB e no servidor!');
});
