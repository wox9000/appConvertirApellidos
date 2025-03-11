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
            if (residual) resultados.push(`⚠️ ERROR: "${residual}"`);
        }
    });

    // Verificar texto residual final
    const residualFinal = inputLimpio.substring(lastIndex).trim();
    if (residualFinal) resultados.push(`⚠️ ERROR: "${residualFinal}"`);

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
    // Cambio de 'inputNombres' a 'inputGeneroNombres'
    const inputNombres = document.getElementById('inputGeneroNombres').value;

    // Validación del campo vacío
    if (!inputNombres) {
        alert('El campo de entrada no puede estar vacío. Por favor, ingresa nombres en el formato "Apellido, Nombre".');
        return;
    }

    // Separar las líneas de entrada
    const lineas = inputNombres.split(/\n/);
    const entradas = [];

    // Validación de cada línea
    for (let i = 0; i < lineas.length; i++) {
        const linea = lineas[i].trim();

        // Verificar si hay espacios innecesarios
        if (linea !== lineas[i]) {
            alert(`Error en la línea ${i + 1}: Hay espacios innecesarios al inicio o al final.`);
            return;
        }

        // Verificar la existencia de una coma
        if (!linea.includes(',')) {
            alert(`Error en la línea ${i + 1}: Falta la coma para separar apellido y nombre.`);
            return;
        }

        // Separar apellido y nombre
        const partes = linea.split(',');
        if (partes.length !== 2) {
            alert(`Error en la línea ${i + 1}: Debe contener solo un apellido y un nombre.`);
            return;
        }

        // Crear objeto de entrada
        entradas.push({
            apellido: partes[0].trim(),
            nombre: partes[1].trim()
        });
    }

    // Verificar si hay entradas válidas
    if (entradas.length === 0) {
        alert('Formato incorrecto. Asegúrate de ingresar al menos un "Apellido, Nombre".');
        return;
    }

    // Generar la interfaz HTML
    const selectorGeneroContainer = document.getElementById('selectorGeneroContainer');
    selectorGeneroContainer.innerHTML = ''; // Limpiar contenedor

    for (const entrada of entradas) {
        const div = document.createElement('div');
        div.innerHTML = `
            <span>${entrada.apellido}, ${entrada.nombre}</span>
            <select>
                <option value="masculino">Masculino</option>
                <option value="femenino">Femenino</option>
            </select>
        `;
        selectorGeneroContainer.appendChild(div);
    }

    // Aquí puedes agregar más lógica para ordenar la lista por género si es necesario
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
        return a.genero === 'A' ? -1 : 1;
    });

    // Generar tabla
    const tbody = document.getElementById('resultadoOrdenar');
    tbody.innerHTML = listaConGenero.map(item => `
        <tr>
            <td>${item.apellido}</td>
            <td>${item.nombre || ''}</td>
            <td>${item.genero === 'A' ? 'Masculino' : 'Femenino'}</td>
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