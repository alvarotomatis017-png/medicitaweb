/* =================================================================
   ARCHIVO: calendario.js
   Genera un calendario mensual de forma totalmente dinámica con
   JavaScript (sin ninguna librería externa) y resalta los días
   en los que el paciente tiene una cita programada.
   Depende de app.js.
   ================================================================= */

protegerPagina();
const usuarioSesionCalendario = obtenerUsuarioActual();

cargarComponente("navbarContenedor", "components/navbar.html", inicializarNavbar);
cargarComponente("sidebarContenedor", "components/sidebar.html", function () {
    inicializarSidebar("calendario");
});
cargarComponente("footerContenedor", "components/footer.html");

// Solo trabajamos con las citas que le pertenecen al usuario actual
const citasUsuarioCalendario = obtenerCitasGuardadas().filter(function (cita) {
    return cita.pacienteEmail === usuarioSesionCalendario.email;
});

// Referencias a elementos del DOM
const tituloMesActual = document.getElementById("tituloMesActual");
const calendarioGrilla = document.getElementById("calendarioGrilla");
const detalleDiaSeleccionado = document.getElementById("detalleDiaSeleccionado");
const btnMesAnterior = document.getElementById("btnMesAnterior");
const btnMesSiguiente = document.getElementById("btnMesSiguiente");

// Guardamos en variables el mes y año que se está mostrando actualmente.
// Empezamos siempre mostrando el mes y año de "hoy".
const fechaDeHoy = new Date();
let mesActual = fechaDeHoy.getMonth();   // 0 = enero, 11 = diciembre
let anioActual = fechaDeHoy.getFullYear();

/* Dibuja por completo el calendario del mes/año indicados en las
   variables mesActual y anioActual */
function dibujarCalendario() {
    // Título con el nombre del mes, ej: "Marzo 2026"
    const nombreMes = new Date(anioActual, mesActual, 1).toLocaleDateString("es-PE", {
        month: "long",
        year: "numeric"
    });
    tituloMesActual.textContent = nombreMes;

    calendarioGrilla.innerHTML = "";

    // getDay() del día 1 del mes nos dice qué día de la semana es (0=domingo)
    const primerDiaSemana = new Date(anioActual, mesActual, 1).getDay();
    // El "día 0" del mes siguiente es en realidad el último día del mes actual
    const totalDiasDelMes = new Date(anioActual, mesActual + 1, 0).getDate();

    // Agregamos celdas vacías para alinear el día 1 con su día de la semana correcto
    for (let i = 0; i < primerDiaSemana; i++) {
        const celdaVacia = document.createElement("div");
        celdaVacia.className = "dia-calendario vacio";
        calendarioGrilla.appendChild(celdaVacia);
    }

    // Dibujamos una celda por cada día del mes
    for (let dia = 1; dia <= totalDiasDelMes; dia++) {
        const celda = document.createElement("div");
        celda.className = "dia-calendario";

        // Convertimos el día actual del bucle a formato "YYYY-MM-DD" para compararlo
        const fechaISO = construirFechaISO(anioActual, mesActual, dia);

        // Buscamos si existe alguna cita programada exactamente en esta fecha
        const citasDeEsteDia = citasUsuarioCalendario.filter(function (cita) {
            return cita.fecha === fechaISO;
        });

        const esHoy = (dia === fechaDeHoy.getDate() && mesActual === fechaDeHoy.getMonth() && anioActual === fechaDeHoy.getFullYear());
        if (esHoy) {
            celda.classList.add("hoy");
        }

        let contenidoCelda = `<span>${dia}</span>`;

        if (citasDeEsteDia.length > 0) {
            celda.classList.add("con-cita");
            contenidoCelda += `<span class="dia-calendario__punto"></span>`;

            // Al hacer clic sobre un día con citas, mostramos el detalle abajo
            celda.addEventListener("click", function () {
                mostrarDetalleDia(fechaISO, citasDeEsteDia);
            });
        }

        celda.innerHTML = contenidoCelda;
        calendarioGrilla.appendChild(celda);
    }
}

/* Arma una fecha en formato "YYYY-MM-DD" a partir de año, mes (0-11) y día.
   Se usa una función propia (en lugar de toISOString) para evitar
   problemas de zona horaria al construir la fecha. */
function construirFechaISO(anio, mes, dia) {
    const mesTexto = String(mes + 1).padStart(2, "0");
    const diaTexto = String(dia).padStart(2, "0");
    return `${anio}-${mesTexto}-${diaTexto}`;
}

/* Muestra debajo del calendario el listado de citas del día seleccionado */
function mostrarDetalleDia(fechaISO, citasDelDia) {
    const encabezado = `<h3 style="margin-bottom:12px;">Citas del ${formatearFecha(fechaISO)}</h3>`;

    const listaHTML = citasDelDia.map(function (cita) {
        return `
            <div class="item-cita">
                <div class="item-cita__icono"><i class="fa-solid fa-user-doctor"></i></div>
                <div class="item-cita__info">
                    <h4>${cita.especialidad} &mdash; ${cita.medicoNombre}</h4>
                    <p>Hora: ${cita.hora}</p>
                </div>
            </div>
        `;
    }).join("");

    detalleDiaSeleccionado.innerHTML = encabezado + listaHTML;
}

/* Botones para navegar entre meses */
btnMesAnterior.addEventListener("click", function () {
    mesActual--;
    if (mesActual < 0) {
        mesActual = 11;
        anioActual--;
    }
    dibujarCalendario();
});

btnMesSiguiente.addEventListener("click", function () {
    mesActual++;
    if (mesActual > 11) {
        mesActual = 0;
        anioActual++;
    }
    dibujarCalendario();
});

// Dibujamos el calendario apenas carga la página
dibujarCalendario();
