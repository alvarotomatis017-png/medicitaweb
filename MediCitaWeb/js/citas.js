/* =================================================================
   ARCHIVO: citas.js
   Lógica de la pantalla de reserva de citas.
   Depende de app.js, donde están definidos ESPECIALIDADES, MEDICOS
   y las funciones de sesión/citas.
   ================================================================= */

protegerPagina();
const usuarioSesionCitas = obtenerUsuarioActual();

cargarComponente("navbarContenedor", "components/navbar.html", inicializarNavbar);
cargarComponente("sidebarContenedor", "components/sidebar.html", function () {
    inicializarSidebar("citas");
});
cargarComponente("footerContenedor", "components/footer.html");

// Referencias a los elementos del formulario
const selectEspecialidad = document.getElementById("especialidad");
const selectMedico = document.getElementById("medico");
const campoFecha = document.getElementById("fecha");
const listaHorarios = document.getElementById("listaHorarios");
const formularioCitas = document.getElementById("formularioCitas");
const alertaCitaConfirmada = document.getElementById("alertaCitaConfirmada");
const textoAlertaCita = document.getElementById("textoAlertaCita");

// Variable donde guardamos qué horario (string, ej "09:00") eligió el usuario.
// Se resetea cada vez que cambia de médico.
let horaSeleccionada = null;

/* -----------------------------------------------------------------
   PASO 1: Llenamos el <select> de especialidades con los datos
   del arreglo ESPECIALIDADES definido en app.js
   ----------------------------------------------------------------- */
ESPECIALIDADES.forEach(function (especialidad) {
    const opcion = document.createElement("option");
    opcion.value = especialidad;
    opcion.textContent = especialidad;
    selectEspecialidad.appendChild(opcion);
});

/* -----------------------------------------------------------------
   PASO 2: Cuando el usuario elige una especialidad, filtramos los
   médicos que pertenecen a ella y llenamos el segundo <select>
   ----------------------------------------------------------------- */
selectEspecialidad.addEventListener("change", function () {
    const especialidadElegida = selectEspecialidad.value;

    // Reiniciamos el select de médicos y la lista de horarios
    selectMedico.innerHTML = "";
    reiniciarHorarios("Elige primero un médico para ver sus horarios.");

    if (especialidadElegida === "") {
        selectMedico.disabled = true;
        const opcionVacia = document.createElement("option");
        opcionVacia.textContent = "Primero elige una especialidad";
        selectMedico.appendChild(opcionVacia);
        return;
    }

    const medicosFiltrados = MEDICOS.filter(function (medico) {
        return medico.especialidad === especialidadElegida;
    });

    const opcionInicial = document.createElement("option");
    opcionInicial.value = "";
    opcionInicial.textContent = "Selecciona un médico...";
    selectMedico.appendChild(opcionInicial);

    medicosFiltrados.forEach(function (medico) {
        const opcion = document.createElement("option");
        opcion.value = medico.id;
        opcion.textContent = medico.nombre;
        selectMedico.appendChild(opcion);
    });

    selectMedico.disabled = false;
});

/* -----------------------------------------------------------------
   PASO 3: Cuando el usuario elige un médico, mostramos sus
   horarios disponibles como botones seleccionables
   ----------------------------------------------------------------- */
selectMedico.addEventListener("change", function () {
    const idMedico = Number(selectMedico.value);
    const medicoElegido = MEDICOS.find(function (medico) { return medico.id === idMedico; });

    if (!medicoElegido) {
        reiniciarHorarios("Elige primero un médico para ver sus horarios.");
        return;
    }

    horaSeleccionada = null;

    // Generamos un botón por cada horario disponible del médico
    listaHorarios.innerHTML = medicoElegido.horarios.map(function (hora) {
        return `<button type="button" class="boton-horario" data-hora="${hora}">${hora}</button>`;
    }).join("");

    // Agregamos el evento de clic a cada botón recién creado
    const botonesHorario = listaHorarios.querySelectorAll(".boton-horario");
    botonesHorario.forEach(function (boton) {
        boton.addEventListener("click", function () {
            // Quitamos la selección anterior de todos los botones...
            botonesHorario.forEach(function (b) { b.classList.remove("seleccionado"); });
            // ...y marcamos como seleccionado solo el que se acaba de presionar
            boton.classList.add("seleccionado");
            horaSeleccionada = boton.dataset.hora;
        });
    });
});

/* Función de apoyo para volver a dejar la lista de horarios en su estado inicial */
function reiniciarHorarios(mensaje) {
    horaSeleccionada = null;
    listaHorarios.innerHTML = `<p class="texto-vacio">${mensaje}</p>`;
}

/* -----------------------------------------------------------------
   PASO 4: Restringimos el campo de fecha para que no se puedan
   elegir días anteriores al día de hoy
   ----------------------------------------------------------------- */
campoFecha.min = new Date().toISOString().split("T")[0];

/* -----------------------------------------------------------------
   PASO 5: Al confirmar el formulario, validamos todo y guardamos
   la cita en localStorage
   ----------------------------------------------------------------- */
formularioCitas.addEventListener("submit", function (evento) {
    evento.preventDefault();

    // Quitamos errores previos
    document.querySelectorAll(".grupo-formulario").forEach(function (grupo) {
        grupo.classList.remove("con-error");
    });

    let formularioValido = true;

    if (selectEspecialidad.value === "") {
        document.getElementById("grupoEspecialidad").classList.add("con-error");
        formularioValido = false;
    }
    if (selectMedico.value === "") {
        document.getElementById("grupoMedico").classList.add("con-error");
        formularioValido = false;
    }
    if (campoFecha.value === "") {
        document.getElementById("grupoFecha").classList.add("con-error");
        formularioValido = false;
    }
    if (!horaSeleccionada) {
        document.getElementById("grupoHora").classList.add("con-error");
        formularioValido = false;
    }

    if (!formularioValido) {
        return;
    }

    const medicoElegido = MEDICOS.find(function (medico) {
        return medico.id === Number(selectMedico.value);
    });

    // Armamos el objeto de la cita y lo guardamos con la función de app.js
    const nuevaCita = {
        id: Date.now(), // usamos la fecha/hora actual en milisegundos como id único
        especialidad: selectEspecialidad.value,
        medicoNombre: medicoElegido.nombre,
        fecha: campoFecha.value,
        hora: horaSeleccionada,
        pacienteEmail: usuarioSesionCitas.email
    };

    guardarNuevaCita(nuevaCita);

    // Mostramos el mensaje de confirmación con los datos de la cita
    textoAlertaCita.textContent = "Cita confirmada con " + medicoElegido.nombre + " el " +
        formatearFecha(nuevaCita.fecha) + " a las " + nuevaCita.hora + ".";
    alertaCitaConfirmada.classList.add("mostrar");

    // Reiniciamos el formulario para permitir reservar otra cita si se desea
    formularioCitas.reset();
    selectMedico.innerHTML = '<option value="">Primero elige una especialidad</option>';
    selectMedico.disabled = true;
    reiniciarHorarios("Elige primero un médico para ver sus horarios.");
});
