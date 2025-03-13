// app.js

function convertirMayusculas() {
    const input = document.getElementById('inputNombreCompleto').value.trim();
    if (!input) {
        alert('¡Pegue su listado!');
        return;
    }

    // Paso 1: Normalizar espacios y dividir en "entradas lógicas"
    const inputLimpio = input
        .replace(/\t/g, ' ') // Tabs a espacios
        .replace(/\s{2,}/g, ' ') // Múltiples espacios a uno
        .trim();

    // Paso 2: Buscar todas las entradas válidas (formato "X, Y")
    const regex = /([^,]+),\s*([^,]+)(?=\s|$)/g;
    const entradas = [];
    let match;

    while ((match = regex.exec(inputLimpio)) !== null) {
        const apellidos = match[1].trim();
        const nombres = match[2].trim();
        entradas.push({ apellidos, nombres });
    }

    // Paso 3: Procesar entradas y detectar errores residuales
    const resultados = [];
    let lastIndex = 0;

    entradas.forEach((entrada, index) => {
        const start = inputLimpio.indexOf(`${entrada.apellidos}, ${entrada.nombres}`, lastIndex);
        const end = start + entrada.apellidos.length + entrada.nombres.length + 2;
        lastIndex = end;

        resultados.push(`${entrada.apellidos.toUpperCase()}, ${entrada.nombres}`);

        // Verificar texto entre entradas
        if (index < entradas.length - 1) {
            const nextStart = inputLimpio.indexOf(entradas[index + 1].apellidos, lastIndex);
            const residual = inputLimpio.substring(end, nextStart).trim();
            if (residual) resultados.push(`⚠️ ERROR (Formato Válido, "Apellido, Nombre"): "${residual}"`);
        }
    });

    // Verificar texto residual final
    const residualFinal = inputLimpio.substring(lastIndex).trim();
    if (residualFinal) resultados.push(`⚠️ ERROR (Formato Válido, "Apellido, Nombre"): "${residualFinal}"`);

    // Mostrar resultados
    document.getElementById('resultadoMayusculas').innerHTML = resultados
        .map(res => `<div class="${res.startsWith('⚠️') ? 'error' : 'ok'}">${res}</div>`)
        .join('');
}

function juntarApellidoNombre() {
    // Obtener y limpiar los listados
    const apellidosRaw = document.getElementById('inputApellidos').value.trim();
    const nombresRaw = document.getElementById('inputNombres').value.trim();

    if (!apellidosRaw || !nombresRaw) {
        alert('¡Ambos campos son requeridos!');
        return;
    }

    // Normalizar listados (saltos de línea, tabs, espacios)
    const procesarListado = (texto) => {
        return texto
            .replace(/\t/g, '\n')       // Tabs a saltos
            .split(/\r?\n/)             // Dividir líneas
            .map(linea => linea.trim()) // Limpiar espacios
            .filter(linea => linea);    // Ignorar vacíos
    };

    const apellidos = procesarListado(apellidosRaw);
    const nombres = procesarListado(nombresRaw);

    // Validar misma cantidad de registros
    if (apellidos.length !== nombres.length) {
        alert(`¡Error! Los listados tienen distinta cantidad de registros:
Apellidos: ${apellidos.length} | Nombres: ${nombres.length}`);
        return;
    }

    // Generar resultados combinados
    const resultados = apellidos.map((apellido, index) => {
        const apellidoMayus = apellido.toUpperCase();
        return `${apellidoMayus}, ${nombres[index]}`;
    });

    // Mostrar resultados con formato
    document.getElementById('resultadoJuntar').innerHTML = resultados
        .map(res => `<div class="ok">${res}</div>`)
        .join('');
}

let listaProcesada = [];

function generarSelectorGenero() {
    const inputNombres = document.getElementById('inputGeneroNombres').value.trim();

    if (!inputNombres) {
        alert('El campo de entrada no puede estar vacío. Por favor, ingresa nombres en el formato "Apellido, Nombre".');
        return;
    }

    const lineas = inputNombres.split(/\n/);
    listaProcesada = []; // Reiniciar lista antes de llenarla
    const selectorGeneroContainer = document.getElementById('selectorGeneroContainer');
    selectorGeneroContainer.innerHTML = ''; // Limpiar contenedor

    lineas.forEach((linea, index) => {
        const partes = linea.split(',');
        if (partes.length !== 2) {
            alert(`Error en la línea ${index + 1}: Formato incorrecto. Usa "Apellido, Nombre".`);
            return;
        }

        const apellido = partes[0].trim();
        const nombre = partes[1].trim();

        // Agregar a listaProcesada
        listaProcesada.push({ apellido, nombre });

        // Crear el HTML del selector
        const div = document.createElement('div');
        div.classList.add('selector-fila');
        div.innerHTML = `
            <span>${apellido}, ${nombre}</span>
            <select id="genero-${index}" class="select-genero">
                <option value="masculino">Masculino</option>
                <option value="femenino">Femenino</option>
            </select>
        `;
        selectorGeneroContainer.appendChild(div);
    });

    if (listaProcesada.length === 0) {
        alert("No se detectaron entradas válidas.");
    }
}

// función ordenarPorGenero():
function ordenarPorGenero() {
    const listaConGenero = listaProcesada.map((item, index) => ({
        apellido: item.apellido.toUpperCase(),
        nombre: item.nombre,
        genero: document.getElementById(`genero-${index}`).value
    }));

    listaConGenero.sort((a, b) => {
        if (a.genero === b.genero) {
            return a.apellido.localeCompare(b.apellido);
        }
        return a.genero === 'masculino' ? -1 : 1; // Corregido
    });

    // Generar tabla
    const tbody = document.getElementById('resultadoOrdenar');
    tbody.innerHTML = listaConGenero.map(item => `
        <tr>
            <td>${item.apellido}</td>
            <td>${item.nombre || ''}</td>
            <td>${item.genero === 'masculino' ? 'Masculino' : 'Femenino'}</td>
        </tr>
    `).join('');
}

// Nueva función para copiar
function copiarTabla() {
    const tabla = document.getElementById('tablaResultados');
    const range = document.createRange();
    range.selectNode(tabla);
    window.getSelection().removeAllRanges();
    window.getSelection().addRange(range);
    
    try {
        document.execCommand('copy');
        alert('Tabla copiada al portapapeles');
    } catch (err) {
        alert('Error al copiar: ' + err);
    }
    window.getSelection().removeAllRanges();
}
