/* =================================================================
   ARCHIVO: medicos.js
   Lógica de la pantalla de médicos. A diferencia de las otras
   páginas internas, ESTA página puede verse con o sin sesión
   iniciada (por eso NO se llama a protegerPagina() aquí).
   Depende de app.js.
   ================================================================= */

cargarComponente("navbarContenedor", "components/navbar.html", inicializarNavbar);
cargarComponente("footerContenedor", "components/footer.html");

// Solo insertamos el sidebar si hay una sesión activa; así esta misma
// página sirve tanto de vitrina pública como de sección interna del sistema.
if (obtenerUsuarioActual()) {
    cargarComponente("sidebarContenedor", "components/sidebar.html", function () {
        inicializarSidebar("medicos");
    });
}

const filtroEspecialidad = document.getElementById("filtroEspecialidad");
const grillaMedicos = document.getElementById("grillaMedicos");

// Llenamos el filtro con las especialidades definidas en app.js
ESPECIALIDADES.forEach(function (especialidad) {
    const opcion = document.createElement("option");
    opcion.value = especialidad;
    opcion.textContent = especialidad;
    filtroEspecialidad.appendChild(opcion);
});

/* Dibuja las tarjetas de médicos a partir de un arreglo ya filtrado */
function dibujarMedicos(listaMedicos) {
    grillaMedicos.innerHTML = listaMedicos.map(function (medico) {
        return `
            <div class="tarjeta tarjeta-medico">
                <div class="tarjeta-medico__foto"><i class="fa-solid fa-user-doctor"></i></div>
                <h3>${medico.nombre}</h3>
                <span class="tarjeta-medico__especialidad">${medico.especialidad}</span>
                <p class="tarjeta-medico__horarios">
                    <i class="fa-regular fa-clock"></i> Horarios: ${medico.horarios.join(", ")}
                </p>
                <a href="citas.html" class="btn btn-primario btn-ancho-completo">Reservar cita</a>
            </div>
        `;
    }).join("");
}

// Al iniciar, mostramos todos los médicos
dibujarMedicos(MEDICOS);

// Al cambiar el filtro, mostramos solo los médicos de esa especialidad
filtroEspecialidad.addEventListener("change", function () {
    const valorElegido = filtroEspecialidad.value;

    if (valorElegido === "todas") {
        dibujarMedicos(MEDICOS);
    } else {
        const medicosFiltrados = MEDICOS.filter(function (medico) {
            return medico.especialidad === valorElegido;
        });
        dibujarMedicos(medicosFiltrados);
    }
});
