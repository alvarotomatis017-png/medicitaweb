/* =================================================================
   ARCHIVO: historial.js
   Lógica de la pantalla de historial médico.
   Depende de app.js.
   ================================================================= */

protegerPagina();
const usuarioSesionHistorial = obtenerUsuarioActual();

cargarComponente("navbarContenedor", "components/navbar.html", inicializarNavbar);
cargarComponente("sidebarContenedor", "components/sidebar.html", function () {
    inicializarSidebar("historial");
});
cargarComponente("footerContenedor", "components/footer.html");

const cuerpoTablaHistorial = document.getElementById("cuerpoTablaHistorial");
const mensajeHistorialVacio = document.getElementById("mensajeHistorialVacio");
const buscadorHistorial = document.getElementById("buscadorHistorial");

// Tomamos solo las citas del usuario actual cuya fecha ya pasó (historial real).
// NOTA: como este es un proyecto de demostración sin backend, si el usuario
// nunca reservó citas con fecha pasada, el historial se mostrará vacío;
// eso es el comportamiento esperado (no se inventan datos falsos).
const hoyISOHistorial = new Date().toISOString().split("T")[0];

const citasDelHistorial = obtenerCitasGuardadas()
    .filter(function (cita) {
        return cita.pacienteEmail === usuarioSesionHistorial.email && cita.fecha < hoyISOHistorial;
    })
    .sort(function (a, b) { return b.fecha.localeCompare(a.fecha); }); // más recientes primero

/* Dibuja las filas de la tabla a partir de un arreglo de citas ya filtrado */
function dibujarTablaHistorial(citas) {
    if (citas.length === 0) {
        cuerpoTablaHistorial.innerHTML = "";
        mensajeHistorialVacio.style.display = "block";
        return;
    }

    mensajeHistorialVacio.style.display = "none";

    cuerpoTablaHistorial.innerHTML = citas.map(function (cita) {
        return `
            <tr>
                <td>${formatearFecha(cita.fecha)}</td>
                <td>${cita.especialidad}</td>
                <td>${cita.medicoNombre}</td>
                <td>${cita.hora}</td>
                <td><span class="item-cita__etiqueta item-cita__etiqueta--atendida">Atendida</span></td>
            </tr>
        `;
    }).join("");
}

// Dibujamos la tabla completa apenas carga la página
dibujarTablaHistorial(citasDelHistorial);

/* Filtro en vivo: a medida que el usuario escribe, filtramos por
   especialidad o nombre del médico (sin distinguir mayúsculas/minúsculas) */
buscadorHistorial.addEventListener("input", function () {
    const textoBusqueda = buscadorHistorial.value.trim().toLowerCase();

    const citasFiltradas = citasDelHistorial.filter(function (cita) {
        return cita.especialidad.toLowerCase().includes(textoBusqueda) ||
               cita.medicoNombre.toLowerCase().includes(textoBusqueda);
    });

    dibujarTablaHistorial(citasFiltradas);
});
