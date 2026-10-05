/* =================================================================
   ARCHIVO: dashboard.js
   Lógica del panel principal del paciente.
   Depende de app.js (debe cargarse después de él).
   ================================================================= */

// Si nadie inició sesión, esta función redirige automáticamente a login.html
protegerPagina();

const usuarioActual = obtenerUsuarioActual();

// Insertamos el navbar, el sidebar y el footer
cargarComponente("navbarContenedor", "components/navbar.html", inicializarNavbar);
cargarComponente("sidebarContenedor", "components/sidebar.html", function () {
    inicializarSidebar("dashboard");
});
cargarComponente("footerContenedor", "components/footer.html");

// Personalizamos el saludo con el nombre del usuario
document.getElementById("saludoUsuario").textContent = "¡Hola, " + usuarioActual.nombre.split(" ")[0] + "!";

// Mostramos el número total de médicos disponibles (dato definido en app.js)
document.getElementById("totalMedicos").textContent = MEDICOS.length;

/* -----------------------------------------------------------------
   Obtenemos únicamente las citas que pertenecen al usuario que
   inició sesión (comparando por correo electrónico)
   ----------------------------------------------------------------- */
const todasLasCitas = obtenerCitasGuardadas();
const citasDelUsuario = todasLasCitas.filter(function (cita) {
    return cita.pacienteEmail === usuarioActual.email;
});

// Fecha de hoy, en formato "YYYY-MM-DD", para comparar con las citas guardadas
const hoyISO = new Date().toISOString().split("T")[0];

const citasProximas = citasDelUsuario
    .filter(function (cita) { return cita.fecha >= hoyISO; })
    .sort(function (a, b) { return a.fecha.localeCompare(b.fecha); });

const citasPasadas = citasDelUsuario.filter(function (cita) { return cita.fecha < hoyISO; });

document.getElementById("totalCitasProximas").textContent = citasProximas.length;
document.getElementById("totalCitasHistorial").textContent = citasPasadas.length;

/* -----------------------------------------------------------------
   Pintamos en pantalla las próximas 4 citas (o un mensaje si no hay)
   ----------------------------------------------------------------- */
const tarjetaProximasCitas = document.getElementById("tarjetaProximasCitas");

if (citasProximas.length === 0) {
    tarjetaProximasCitas.innerHTML = '<p class="texto-vacio">No tienes citas próximas. ' +
        '<a href="citas.html">Reserva una aquí</a>.</p>';
} else {
    // Usamos map() + join() para construir el HTML de cada cita y unirlo todo
    tarjetaProximasCitas.innerHTML = citasProximas.slice(0, 4).map(function (cita) {
        return `
            <div class="item-cita">
                <div class="item-cita__icono"><i class="fa-solid fa-calendar-check"></i></div>
                <div class="item-cita__info">
                    <h4>${cita.especialidad} &mdash; ${cita.medicoNombre}</h4>
                    <p>${formatearFecha(cita.fecha)} a las ${cita.hora}</p>
                </div>
                <span class="item-cita__etiqueta item-cita__etiqueta--proxima">Próxima</span>
            </div>
        `;
    }).join("");
}
