// Clase Alumno
class Alumno {
    constructor(nombre, apellidos, edad) {
        this.id = Alumno.incrementId();
        this.nombre = nombre;
        this.apellidos = apellidos;
        this.edad = edad;
        this.materias = []; // Array de objetos { nombreMateria, calificacion }
        this.grupo = null; // Nombre del grupo al que pertenece
    }

    static incrementId() {
        if (!this.latestId) this.latestId = 1;
        else this.latestId++;
        return this.latestId;
    }

    inscribirMateria(nombreMateria) {
        // Verificar si la materia ya está inscrita (ignorando mayúsculas/minúsculas)
        if (this.materias.some(m => m.nombreMateria.toLowerCase() === nombreMateria.toLowerCase())) {
            throw new Error(`La materia "${nombreMateria}" ya está inscrita.`);
        }
        this.materias.push({ nombreMateria, calificacion: null });
    }

    asignarCalificacion(nombreMateria, calificacion) {
        if (calificacion < 0 || calificacion > 10) {
            throw new Error(`La calificación debe estar entre 0 y 10.`);
        }
        const materia = this.materias.find(m => m.nombreMateria.toLowerCase() === nombreMateria.toLowerCase());
        if (materia) {
            materia.calificacion = calificacion;
        } else {
            throw new Error(`Materia "${nombreMateria}" no inscrita.`);
        }
    }

    obtenerPromedio() {
        const calificaciones = this.materias
            .filter(m => m.calificacion !== null)
            .map(m => m.calificacion);
        if (calificaciones.length === 0) return 0;
        const suma = calificaciones.reduce((a, b) => a + b, 0);
        return (suma / calificaciones.length).toFixed(2);
    }
}

// Datos globales
let alumnos = [];
let grupos = [];

// Referencias a los modales de Bootstrap
const editarAlumnoModal = new bootstrap.Modal(document.getElementById('editarAlumnoModal'));
const editarGrupoModal = new bootstrap.Modal(document.getElementById('editarGrupoModal'));
const editarMateriaModal = new bootstrap.Modal(document.getElementById('editarMateriaModal'));

// Inicialización al cargar la página
window.onload = function() {
    cargarAlumnos();
    cargarGrupos();
    actualizarListas();
    mostrarResultado('Datos cargados correctamente.', 'success');
}

// Funciones de LocalStorage
function cargarAlumnos() {
    const alumnosGuardados = localStorage.getItem('alumnos');
    if (alumnosGuardados) {
        alumnos = JSON.parse(alumnosGuardados).map(a => Object.assign(new Alumno(), a));
        // Restaurar latestId
        if (alumnos.length > 0) {
            Alumno.latestId = Math.max(...alumnos.map(a => a.id));
        }
    }
}

function guardarAlumnos() {
    localStorage.setItem('alumnos', JSON.stringify(alumnos));
}

function cargarGrupos() {
    const gruposGuardados = localStorage.getItem('grupos');
    if (gruposGuardados) {
        grupos = JSON.parse(gruposGuardados);
    }
}

function guardarGrupos() {
    localStorage.setItem('grupos', JSON.stringify(grupos));
}

function guardarEnLocalStorage() {
    guardarAlumnos();
    guardarGrupos();
}

// Funciones para actualizar las listas y selects
function actualizarListas() {
    actualizarSelectAlumnos();
    actualizarSelectAlumnosGrupo();
    actualizarSelectGrupos();
    actualizarListaAlumnos();
    actualizarListaGrupos();
}

function actualizarSelectAlumnos() {
    const selectAlumno = document.getElementById('select-alumno');
    selectAlumno.innerHTML = '<option value="">--Seleccionar Alumno--</option>';
    alumnos.forEach(alumno => {
        const option = document.createElement('option');
        option.value = alumno.id;
        option.textContent = `${alumno.nombre} ${alumno.apellidos}`;
        selectAlumno.appendChild(option);
    });
}

function actualizarSelectAlumnosGrupo() {
    const selectAlumnoGrupo = document.getElementById('select-alumno-grupo');
    selectAlumnoGrupo.innerHTML = '<option value="">--Seleccionar Alumno--</option>';
    alumnos.forEach(alumno => {
        const option = document.createElement('option');
        option.value = alumno.id;
        option.textContent = `${alumno.nombre} ${alumno.apellidos}`;
        selectAlumnoGrupo.appendChild(option);
    });
}

function actualizarSelectGrupos() {
    const selectGrupo = document.getElementById('select-grupo');
    selectGrupo.innerHTML = '<option value="">--Seleccionar Grupo--</option>';
    grupos.forEach(grupo => {
        const option = document.createElement('option');
        option.value = grupo.nombre;
        option.textContent = grupo.nombre;
        selectGrupo.appendChild(option);
    });
}

function actualizarListaAlumnos() {
    const ulAlumnos = document.getElementById('ul-alumnos');
    ulAlumnos.innerHTML = '';
    alumnos.forEach(alumno => {
        const li = document.createElement('li');
        li.classList.add('list-group-item');
        li.innerHTML = `
            <div>
                ${alumno.nombre} ${alumno.apellidos} (Edad: ${alumno.edad})
            </div>
            <div>
                <button class="btn btn-sm btn-primary edit-btn" onclick="abrirEditarAlumnoModal(${alumno.id})">Editar</button>
                <button class="btn btn-sm btn-danger delete-btn" onclick="eliminarAlumno(${alumno.id})">Eliminar</button>
            </div>
        `;
        ulAlumnos.appendChild(li);
    });
}

function actualizarListaGrupos() {
    const ulGrupos = document.getElementById('ul-grupos');
    ulGrupos.innerHTML = '';
    grupos.forEach(grupo => {
        const li = document.createElement('li');
        li.classList.add('list-group-item');
        li.innerHTML = `
            <div>
                ${grupo.nombre} (Alumnos: ${grupo.alumnos.length})
            </div>
            <div>
                <button class="btn btn-sm btn-primary edit-btn" onclick="abrirEditarGrupoModal('${grupo.nombre}')">Editar</button>
                <button class="btn btn-sm btn-danger delete-btn" onclick="eliminarGrupo('${grupo.nombre}')">Eliminar</button>
            </div>
        `;
        ulGrupos.appendChild(li);
    });
}

// Funciones para mostrar resultados
function mostrarResultado(contenido, tipo = 'success') {
    const resultadoDiv = document.getElementById('resultado');
    resultadoDiv.innerHTML = contenido;
    resultadoDiv.className = ''; // Resetear clases
    resultadoDiv.classList.add('alert');
    if (tipo === 'success') {
        resultadoDiv.classList.add('alert-success');
    } else if (tipo === 'error') {
        resultadoDiv.classList.add('alert-danger');
    }

    // Remover el mensaje después de 5 segundos
    setTimeout(() => {
        resultadoDiv.innerHTML = '';
        resultadoDiv.className = '';
    }, 5000);
}

// Event Listener para agregar alumno
document.getElementById('form-alumno').addEventListener('submit', function(e) {
    e.preventDefault();
    const nombre = document.getElementById('nombre').value.trim();
    const apellidos = document.getElementById('apellidos').value.trim();
    const edad = parseInt(document.getElementById('edad').value);

    if (nombre && apellidos && edad) {
        const alumno = new Alumno(nombre, apellidos, edad);
        alumnos.push(alumno);
        actualizarListas();
        guardarEnLocalStorage();
        document.getElementById('form-alumno').reset();
        mostrarResultado(`Alumno "${nombre} ${apellidos}" agregado correctamente.`, 'success');
    } else {
        mostrarResultado('Por favor, complete todos los campos.', 'error');
    }
});

// Funciones para editar alumno
function abrirEditarAlumnoModal(id) {
    const alumno = alumnos.find(a => a.id === id);
    if (!alumno) return;

    document.getElementById('editar-alumno-id').value = alumno.id;
    document.getElementById('editar-nombre').value = alumno.nombre;
    document.getElementById('editar-apellidos').value = alumno.apellidos;
    document.getElementById('editar-edad').value = alumno.edad;

    editarAlumnoModal.show();
}

// Event Listener para editar alumno
document.getElementById('form-editar-alumno').addEventListener('submit', function(e) {
    e.preventDefault();
    const id = parseInt(document.getElementById('editar-alumno-id').value);
    const nombre = document.getElementById('editar-nombre').value.trim();
    const apellidos = document.getElementById('editar-apellidos').value.trim();
    const edad = parseInt(document.getElementById('editar-edad').value);

    const alumno = alumnos.find(a => a.id === id);
    if (!alumno) {
        mostrarResultado('Alumno no encontrado.', 'error');
        return;
    }

    if (nombre && apellidos && edad) {
        alumno.nombre = nombre;
        alumno.apellidos = apellidos;
        alumno.edad = edad;

        actualizarListas();
        guardarEnLocalStorage();
        editarAlumnoModal.hide();
        mostrarResultado(`Alumno "${nombre} ${apellidos}" actualizado correctamente.`, 'success');
    } else {
        mostrarResultado('Por favor, complete todos los campos.', 'error');
    }
});

// Funciones para eliminar alumno
function eliminarAlumno(id) {
    if (!confirm('¿Está seguro de que desea eliminar este alumno?')) return;

    // Eliminar del array de alumnos
    alumnos = alumnos.filter(a => a.id !== id);

    // Eliminar del grupo si pertenece a alguno
    grupos.forEach(grupo => {
        grupo.alumnos = grupo.alumnos.filter(alumnoId => alumnoId !== id);
    });

    actualizarListas();
    guardarEnLocalStorage();
    mostrarResultado('Alumno eliminado correctamente.', 'success');
}

// Funciones para editar grupo
function abrirEditarGrupoModal(nombreOriginal) {
    const grupo = grupos.find(g => g.nombre === nombreOriginal);
    if (!grupo) return;

    document.getElementById('editar-grupo-nombre-original').value = grupo.nombre;
    document.getElementById('editar-nombre-grupo').value = grupo.nombre;

    editarGrupoModal.show();
}

// Event Listener para editar grupo
document.getElementById('form-editar-grupo').addEventListener('submit', function(e) {
    e.preventDefault();
    const nombreOriginal = document.getElementById('editar-grupo-nombre-original').value;
    const nuevoNombre = document.getElementById('editar-nombre-grupo').value.trim();

    if (!nuevoNombre) {
        mostrarResultado('El nombre del grupo no puede estar vacío.', 'error');
        return;
    }

    // Verificar si el nuevo nombre ya existe
    if (grupos.some(g => g.nombre.toLowerCase() === nuevoNombre.toLowerCase() && g.nombre !== nombreOriginal)) {
        mostrarResultado('Ya existe un grupo con ese nombre.', 'error');
        return;
    }

    const grupo = grupos.find(g => g.nombre === nombreOriginal);
    if (!grupo) {
        mostrarResultado('Grupo no encontrado.', 'error');
        return;
    }

    // Actualizar el nombre del grupo
    grupo.nombre = nuevoNombre;

    // Actualizar el nombre del grupo en los alumnos
    alumnos.forEach(alumno => {
        if (alumno.grupo === nombreOriginal) {
            alumno.grupo = nuevoNombre;
        }
    });

    actualizarListas();
    guardarEnLocalStorage();
    editarGrupoModal.hide();
    mostrarResultado(`Grupo "${nuevoNombre}" actualizado correctamente.`, 'success');
});

// Funciones para eliminar grupo
function eliminarGrupo(nombre) {
    if (!confirm('¿Está seguro de que desea eliminar este grupo?')) return;

    // Eliminar del array de grupos
    grupos = grupos.filter(g => g.nombre !== nombre);

    // Actualizar los alumnos que pertenecían al grupo
    alumnos.forEach(alumno => {
        if (alumno.grupo === nombre) {
            alumno.grupo = null;
        }
    });

    actualizarListas();
    guardarEnLocalStorage();
    mostrarResultado('Grupo eliminado correctamente.', 'success');
}

// Funciones para editar materia
function abrirEditarMateriaModal(alumnoId, nombreMateria) {
    const alumno = alumnos.find(a => a.id === alumnoId);
    if (!alumno) return;

    const materia = alumno.materias.find(m => m.nombreMateria === nombreMateria);
    if (!materia) return;

    document.getElementById('editar-materia-alumno-id').value = alumno.id;
    document.getElementById('editar-materia-nombre-original').value = materia.nombreMateria;
    document.getElementById('editar-nombre-materia').value = materia.nombreMateria;
    document.getElementById('editar-calificacion').value = materia.calificacion !== null ? materia.calificacion : '';

    editarMateriaModal.show();
}

// Event Listener para editar materia
document.getElementById('form-editar-materia').addEventListener('submit', function(e) {
    e.preventDefault();
    const alumnoId = parseInt(document.getElementById('editar-materia-alumno-id').value);
    const nombreOriginal = document.getElementById('editar-materia-nombre-original').value;
    const nuevoNombre = document.getElementById('editar-nombre-materia').value.trim();
    const nuevaCalificacion = parseFloat(document.getElementById('editar-calificacion').value);

    if (isNaN(nuevaCalificacion) || nuevaCalificacion < 0 || nuevaCalificacion > 10) {
        mostrarResultado('Calificación inválida. Debe estar entre 0 y 10.', 'error');
        return;
    }

    const alumno = alumnos.find(a => a.id === alumnoId);
    if (!alumno) {
        mostrarResultado('Alumno no encontrado.', 'error');
        return;
    }

    const materia = alumno.materias.find(m => m.nombreMateria === nombreOriginal);
    if (!materia) {
        mostrarResultado('Materia no encontrada.', 'error');
        return;
    }

    // Verificar si el nuevo nombre ya existe (si cambió)
    if (nuevoNombre.toLowerCase() !== nombreOriginal.toLowerCase() &&
        alumno.materias.some(m => m.nombreMateria.toLowerCase() === nuevoNombre.toLowerCase())) {
        mostrarResultado(`La materia "${nuevoNombre}" ya está inscrita.`, 'error');
        return;
    }

    // Actualizar materia
    materia.nombreMateria = nuevoNombre;
    materia.calificacion = nuevaCalificacion;

    actualizarListas();
    guardarEnLocalStorage();
    editarMateriaModal.hide();
    mostrarResultado(`Materia "${nuevoNombre}" actualizada correctamente.`, 'success');
});

// Funciones para eliminar materia
function eliminarMateria(alumnoId, nombreMateria) {
    if (!confirm(`¿Está seguro de que desea eliminar la materia "${nombreMateria}"?`)) return;

    const alumno = alumnos.find(a => a.id === alumnoId);
    if (!alumno) {
        mostrarResultado('Alumno no encontrado.', 'error');
        return;
    }

    alumno.materias = alumno.materias.filter(m => m.nombreMateria !== nombreMateria);
    actualizarListas();
    guardarEnLocalStorage();
    mostrarResultado(`Materia "${nombreMateria}" eliminada del alumno "${alumno.nombre}".`, 'success');
}

// Event Listener para inscribir materia
document.getElementById('btn-inscribir-materia').addEventListener('click', function() {
    const selectAlumno = document.getElementById('select-alumno');
    const materia = document.getElementById('materia').value.trim();

    if (selectAlumno.value && materia) {
        const alumno = alumnos.find(a => a.id == selectAlumno.value);
        try {
            alumno.inscribirMateria(materia);
            actualizarListas();
            guardarEnLocalStorage();
            document.getElementById('materia').value = '';
            mostrarResultado(`Materia "${materia}" inscrita al alumno ${alumno.nombre}.`, 'success');
        } catch (error) {
            mostrarResultado(error.message, 'error');
        }
    } else {
        mostrarResultado('Seleccione un alumno y proporcione una materia.', 'error');
    }
});

// Event Listener para asignar calificación
document.getElementById('btn-asignar-calificacion').addEventListener('click', function() {
    const selectAlumno = document.getElementById('select-alumno');
    const selectMateria = document.getElementById('select-materia');
    const calificacionInput = document.getElementById('calificacion');
    const calificacion = parseFloat(calificacionInput.value);

    if (selectAlumno.value && selectMateria.value && !isNaN(calificacion)) {
        const alumno = alumnos.find(a => a.id == selectAlumno.value);
        try {
            alumno.asignarCalificacion(selectMateria.value, calificacion);
            actualizarListas();
            guardarEnLocalStorage();
            calificacionInput.value = ''; // Limpiar el campo de calificación
            mostrarResultado(`Calificación ${calificacion} asignada a ${alumno.nombre} en ${selectMateria.value}.`, 'success');
        } catch (error) {
            mostrarResultado(error.message, 'error');
        }
    } else {
        mostrarResultado('Seleccione un alumno, materia y proporcione una calificación válida.', 'error');
    }
});

// Event Listener para crear grupo
document.getElementById('btn-crear-grupo').addEventListener('click', function() {
    const nombreGrupo = document.getElementById('nombre-grupo').value.trim();
    if (nombreGrupo) {
        if (!grupos.find(g => g.nombre.toLowerCase() === nombreGrupo.toLowerCase())) {
            grupos.push({ nombre: nombreGrupo, alumnos: [] });
            actualizarListas();
            guardarEnLocalStorage();
            document.getElementById('nombre-grupo').value = '';
            mostrarResultado(`Grupo "${nombreGrupo}" creado.`, 'success');
        } else {
            mostrarResultado(`El grupo "${nombreGrupo}" ya existe.`, 'error');
        }
    } else {
        mostrarResultado('Proporcione un nombre para el grupo.', 'error');
    }
});

// Event Listener para asignar alumno a grupo
document.getElementById('btn-asignar-alumno-grupo').addEventListener('click', function() {
    const selectGrupo = document.getElementById('select-grupo');
    const selectAlumnoGrupo = document.getElementById('select-alumno-grupo');

    if (selectGrupo.value && selectAlumnoGrupo.value) {
        const grupo = grupos.find(g => g.nombre === selectGrupo.value);
        const alumno = alumnos.find(a => a.id == selectAlumnoGrupo.value);

        if (!grupo.alumnos.includes(alumno.id)) {
            grupo.alumnos.push(alumno.id);
            alumno.grupo = grupo.nombre;
            actualizarListas();
            guardarEnLocalStorage();
            mostrarResultado(`Alumno "${alumno.nombre}" asignado al grupo "${grupo.nombre}".`, 'success');
        } else {
            mostrarResultado(`El alumno ya está en el grupo "${grupo.nombre}".`, 'error');
        }
    } else {
        mostrarResultado('Seleccione un grupo y un alumno.', 'error');
    }
});

// Funciones de búsqueda
document.getElementById('btn-buscar-nombre').addEventListener('click', function() {
    const nombre = document.getElementById('buscar-nombre').value.trim().toLowerCase();
    if (nombre) {
        const resultados = alumnos.filter(a => a.nombre.toLowerCase().includes(nombre));
        mostrarResultado(formatAlumnos(resultados));
    } else {
        mostrarResultado('Ingrese un nombre para buscar.', 'error');
    }
});

document.getElementById('btn-buscar-apellido').addEventListener('click', function() {
    const apellido = document.getElementById('buscar-apellido').value.trim().toLowerCase();
    if (apellido) {
        const resultados = alumnos.filter(a => a.apellidos.toLowerCase().includes(apellido));
        mostrarResultado(formatAlumnos(resultados));
    } else {
        mostrarResultado('Ingrese un apellido para buscar.', 'error');
    }
});

// Funciones para obtener promedios
document.getElementById('btn-promedio-alumno').addEventListener('click', function() {
    const selectAlumno = document.getElementById('select-alumno');
    if (selectAlumno.value) {
        const alumno = alumnos.find(a => a.id == selectAlumno.value);
        const promedio = alumno.obtenerPromedio();
        mostrarResultado(`El promedio de ${alumno.nombre} es ${promedio}.`, 'success');
    } else {
        mostrarResultado('Seleccione un alumno para obtener su promedio.', 'error');
    }
});

document.getElementById('btn-promedio-grupo').addEventListener('click', function() {
    const selectGrupo = document.getElementById('select-grupo');
    if (selectGrupo.value) {
        const grupo = grupos.find(g => g.nombre === selectGrupo.value);
        const calificaciones = grupo.alumnos.map(id => {
            const alumno = alumnos.find(a => a.id == id);
            return parseFloat(alumno.obtenerPromedio());
        }).filter(c => !isNaN(c));
        if (calificaciones.length > 0) {
            const suma = calificaciones.reduce((a, b) => a + b, 0);
            const promedio = (suma / calificaciones.length).toFixed(2);
            mostrarResultado(`El promedio del grupo "${grupo.nombre}" es ${promedio}.`, 'success');
        } else {
            mostrarResultado(`No hay calificaciones disponibles para el grupo "${grupo.nombre}".`, 'error');
        }
    } else {
        mostrarResultado('Seleccione un grupo para obtener su promedio.', 'error');
    }
});

// Funciones para ordenar
document.getElementById('btn-ordenar-asc').addEventListener('click', function() {
    const alumnosOrdenados = [...alumnos].sort((a, b) => a.obtenerPromedio() - b.obtenerPromedio());
    mostrarResultado(formatAlumnos(alumnosOrdenados));
});

document.getElementById('btn-ordenar-desc').addEventListener('click', function() {
    const alumnosOrdenados = [...alumnos].sort((a, b) => b.obtenerPromedio() - a.obtenerPromedio());
    mostrarResultado(formatAlumnos(alumnosOrdenados));
});

document.getElementById('btn-ordenar-edad').addEventListener('click', function() {
    const alumnosOrdenados = [...alumnos].sort((a, b) => a.edad - b.edad);
    mostrarResultado(formatAlumnos(alumnosOrdenados));
});

// Formatear alumnos para mostrar en resultados
function formatAlumnos(alumnosList) {
    if (alumnosList.length === 0) return 'No se encontraron alumnos.';
    return alumnosList.map(alumno => {
        return `
            <div class="mb-3">
                <strong>${alumno.nombre} ${alumno.apellidos}</strong><br>
                Edad: ${alumno.edad}<br>
                Grupo: ${alumno.grupo || 'Sin grupo'}<br>
                Materias:
                <ul class="list-group mb-2">
                    ${alumno.materias.map(m => `
                        <li class="list-group-item d-flex justify-content-between align-items-center">
                            ${m.nombreMateria}: ${m.calificacion !== null ? m.calificacion : 'Sin calificación'}
                            <div>
                                <button class="btn btn-sm btn-primary" onclick="abrirEditarMateriaModal(${alumno.id}, '${m.nombreMateria}')">Editar</button>
                                <button class="btn btn-sm btn-danger" onclick="eliminarMateria(${alumno.id}, '${m.nombreMateria}')">Eliminar</button>
                            </div>
                        </li>
                    `).join('')}
                </ul>
                Promedio: ${alumno.obtenerPromedio()}
            </div>
            <hr>
        `;
    }).join('');
}

// Función para actualizar todas las listas y selects
function actualizarListas() {
    actualizarSelectAlumnos();
    actualizarSelectAlumnosGrupo();
    actualizarSelectGrupos();
    actualizarListaAlumnos();
    actualizarListaGrupos();
}

// Función para actualizar listas de alumnos y grupos
function actualizarListaAlumnos() {
    const ulAlumnos = document.getElementById('ul-alumnos');
    ulAlumnos.innerHTML = '';
    alumnos.forEach(alumno => {
        const li = document.createElement('li');
        li.classList.add('list-group-item');
        li.innerHTML = `
            <div>
                ${alumno.nombre} ${alumno.apellidos} (Edad: ${alumno.edad})
            </div>
            <div>
                <button class="btn btn-sm btn-primary edit-btn" onclick="abrirEditarAlumnoModal(${alumno.id})">Editar</button>
                <button class="btn btn-sm btn-danger delete-btn" onclick="eliminarAlumno(${alumno.id})">Eliminar</button>
            </div>
        `;
        ulAlumnos.appendChild(li);
    });
}

function actualizarListaGrupos() {
    const ulGrupos = document.getElementById('ul-grupos');
    ulGrupos.innerHTML = '';
    grupos.forEach(grupo => {
        const li = document.createElement('li');
        li.classList.add('list-group-item');
        li.innerHTML = `
            <div>
                ${grupo.nombre} (Alumnos: ${grupo.alumnos.length})
            </div>
            <div>
                <button class="btn btn-sm btn-primary edit-btn" onclick="abrirEditarGrupoModal('${grupo.nombre}')">Editar</button>
                <button class="btn btn-sm btn-danger delete-btn" onclick="eliminarGrupo('${grupo.nombre}')">Eliminar</button>
            </div>
        `;
        ulGrupos.appendChild(li);
    });
}