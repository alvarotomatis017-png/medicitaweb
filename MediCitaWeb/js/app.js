/* =================================================================
   ARCHIVO: app.js
   DESCRIPCIÓN: Lógica GLOBAL del sitio MediCita Web.
   Este script se importa en TODAS las páginas, ANTES que el script
   propio de cada página (login.js, citas.js, etc), porque aquí se
   definen cosas que las demás páginas necesitan usar:

     1. Carga de componentes reutilizables (navbar, footer, sidebar)
     2. Manejo de la "sesión" del usuario (con localStorage, ya que
        el proyecto no tiene servidor ni base de datos real)
     3. Datos de ejemplo (médicos y especialidades) que simulan
        una base de datos para la exposición académica
     4. Funciones de utilidad usadas en varias pantallas

   NOTA IMPORTANTE: como este proyecto no tiene backend, usamos
   localStorage del navegador para "recordar" si el usuario inició
   sesión y para guardar sus citas. Esto es solo para fines de
   demostración académica, en un sistema real esto se guardaría
   en un servidor con una base de datos.
   ================================================================= */


/* -----------------------------------------------------------------
   1. DATOS DE EJEMPLO (simulan la base de datos del sistema)
   ----------------------------------------------------------------- */

// Lista de especialidades médicas que ofrece la clínica
const ESPECIALIDADES = [
    "Medicina General",
    "Pediatría",
    "Cardiología",
    "Dermatología",
    "Ginecología",
    "Odontología"
];

// Lista de médicos disponibles. Cada uno tiene un id único, nombre,
// especialidad, un ícono representativo y los horarios en los que atiende.
const MEDICOS = [
    { id: 1, nombre: "Dr. Carlos Ramírez",  especialidad: "Medicina General", horarios: ["08:00", "09:00", "10:00", "11:00"] },
    { id: 2, nombre: "Dra. Lucía Fernández", especialidad: "Pediatría",        horarios: ["09:00", "10:00", "12:00", "16:00"] },
    { id: 3, nombre: "Dr. Jorge Salazar",    especialidad: "Cardiología",      horarios: ["08:30", "10:30", "14:00"] },
    { id: 4, nombre: "Dra. Marisol Torres",  especialidad: "Dermatología",     horarios: ["11:00", "13:00", "15:00"] },
    { id: 5, nombre: "Dra. Andrea Quispe",   especialidad: "Ginecología",      horarios: ["09:30", "11:30", "16:30"] },
    { id: 6, nombre: "Dr. Miguel Herrera",   especialidad: "Odontología",      horarios: ["08:00", "12:00", "17:00"] }
];


/* -----------------------------------------------------------------
   2. CARGA DE COMPONENTES (navbar, footer, sidebar)
   Como el proyecto NO usa ningún framework, para no repetir el
   mismo HTML del navbar y footer en las 9 páginas, los guardamos
   en /components y los insertamos con fetch() + innerHTML.

   IMPORTANTE PARA QUE FUNCIONE:
   El navegador bloquea fetch() cuando el archivo se abre directo
   con doble clic (protocolo file://). Por eso este proyecto debe
   abrirse con un servidor local, por ejemplo la extensión
   "Live Server" de Visual Studio Code (clic derecho sobre
   index.html -> "Open with Live Server").
   ----------------------------------------------------------------- */
function cargarComponente(idContenedor, rutaArchivo, alTerminar) {
    const contenedor = document.getElementById(idContenedor);
    if (!contenedor) return; // si la página no tiene ese contenedor, no hace nada

    fetch(rutaArchivo)
        .then(function (respuesta) {
            if (!respuesta.ok) {
                throw new Error("No se pudo cargar " + rutaArchivo);
            }
            return respuesta.text();
        })
        .then(function (html) {
            contenedor.innerHTML = html;
            // Ejecutamos una función extra después de insertar el HTML,
            // por ejemplo para activar los eventos de clic del navbar
            if (typeof alTerminar === "function") {
                alTerminar();
            }
        })
        .catch(function (error) {
            console.error("Error al cargar componente:", error);
            contenedor.innerHTML =
                "<p style='padding:10px;color:red;'>No se pudo cargar este componente. " +
                "Recuerda abrir el proyecto con Live Server.</p>";
        });
}

/* Inicializa los eventos del navbar (menú hamburguesa y cerrar sesión).
   Se llama como "callback" DESPUÉS de que el navbar.html ya fue insertado
   en el DOM, porque antes de eso los botones aún no existen. */
function inicializarNavbar() {
    const botonMenu = document.getElementById("btnToggleMenu");
    const menu = document.getElementById("navbarMenu");

    if (botonMenu && menu) {
        botonMenu.addEventListener("click", function () {
            menu.classList.toggle("mostrar");
        });
    }

    const botonCerrarSesion = document.getElementById("btnCerrarSesionNav");
    if (botonCerrarSesion) {
        botonCerrarSesion.addEventListener("click", function (evento) {
            evento.preventDefault();
            cerrarSesion();
        });
    }

    // Una vez cargado el navbar, revisamos si hay sesión activa
    // para mostrar los enlaces correctos (invitado o usuario)
    actualizarNavbarSesion();
}

/* Inicializa el sidebar: coloca el nombre del usuario y marca
   con la clase "activo" el enlace de la página en la que estamos. */
function inicializarSidebar(paginaActual) {
    const usuario = obtenerUsuarioActual();
    const nombreEtiqueta = document.getElementById("sidebarNombreUsuario");
    if (nombreEtiqueta && usuario) {
        nombreEtiqueta.textContent = usuario.nombre;
    }

    // Recorremos todos los enlaces del sidebar y marcamos el activo
    const enlaces = document.querySelectorAll(".sidebar__menu a");
    enlaces.forEach(function (enlace) {
        if (enlace.dataset.pagina === paginaActual) {
            enlace.classList.add("activo");
        }
    });

    const botonCerrarSesion = document.getElementById("btnCerrarSesionSidebar");
    if (botonCerrarSesion) {
        botonCerrarSesion.addEventListener("click", function (evento) {
            evento.preventDefault();
            cerrarSesion();
        });
    }
}


/* -----------------------------------------------------------------
   3. MANEJO DE SESIÓN (con localStorage)
   ----------------------------------------------------------------- */

// Guarda los datos del usuario que inició sesión / se registró
function guardarSesion(usuario) {
    localStorage.setItem("medicitaUsuarioActual", JSON.stringify(usuario));
}

// Devuelve el usuario actual o "null" si nadie ha iniciado sesión
function obtenerUsuarioActual() {
    const datos = localStorage.getItem("medicitaUsuarioActual");
    return datos ? JSON.parse(datos) : null;
}

// Cierra la sesión del usuario y lo regresa al inicio
function cerrarSesion() {
    localStorage.removeItem("medicitaUsuarioActual");
    window.location.href = "index.html";
}

// Cambia lo que se ve en el navbar según si hay sesión activa o no
function actualizarNavbarSesion() {
    const usuario = obtenerUsuarioActual();
    if (usuario) {
        document.body.classList.add("sesion-activa");
    } else {
        document.body.classList.remove("sesion-activa");
    }
}

// Protege páginas privadas: si nadie inició sesión, lo manda al login.
// Se debe llamar al principio del script de cada página interna
// (dashboard.js, citas.js, calendario.js, historial.js, perfil.js)
function protegerPagina() {
    if (!obtenerUsuarioActual()) {
        window.location.href = "login.html";
    }
}


/* -----------------------------------------------------------------
   4. FUNCIONES DE UTILIDAD GENERAL
   ----------------------------------------------------------------- */

// Muestra una caja de alerta (usada en formularios y confirmaciones)
function mostrarAlerta(idElemento, mensaje, tipo) {
    const caja = document.getElementById(idElemento);
    if (!caja) return;

    caja.textContent = mensaje;
    caja.className = "alerta mostrar " + (tipo === "info" ? "alerta-info" : "alerta-exito");
}

// Da formato de fecha legible en español, ej: "12 de mayo de 2026"
function formatearFecha(fechaISO) {
    const opciones = { day: "numeric", month: "long", year: "numeric" };
    const fecha = new Date(fechaISO + "T00:00:00");
    return fecha.toLocaleDateString("es-PE", opciones);
}

// Devuelve la lista de citas guardadas del usuario (o un arreglo vacío)
function obtenerCitasGuardadas() {
    const datos = localStorage.getItem("medicitaCitas");
    return datos ? JSON.parse(datos) : [];
}

// Guarda una nueva cita en localStorage, agregándola a las que ya existían
function guardarNuevaCita(cita) {
    const citas = obtenerCitasGuardadas();
    citas.push(cita);
    localStorage.setItem("medicitaCitas", JSON.stringify(citas));
}


/* -----------------------------------------------------------------
   5. VALIDACIÓN DE EMAIL (usada en login.js y registro.js)
   Expresión regular sencilla, suficiente para el nivel del proyecto.
   ----------------------------------------------------------------- */
function esEmailValido(texto) {
    const patron = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return patron.test(texto);
}
