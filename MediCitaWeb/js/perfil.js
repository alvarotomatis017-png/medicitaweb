/* =================================================================
   ARCHIVO: perfil.js
   Lógica de la pantalla de perfil del paciente.
   Depende de app.js.
   ================================================================= */

protegerPagina();
const usuarioSesionPerfil = obtenerUsuarioActual();

cargarComponente("navbarContenedor", "components/navbar.html", inicializarNavbar);
cargarComponente("sidebarContenedor", "components/sidebar.html", function () {
    inicializarSidebar("perfil");
});
cargarComponente("footerContenedor", "components/footer.html");

// Referencias a los elementos del formulario y la tarjeta de resumen
const perfilNombreCompleto = document.getElementById("perfilNombreCompleto");
const perfilCorreo = document.getElementById("perfilCorreo");
const campoPerfilNombre = document.getElementById("perfilNombre");
const campoPerfilTelefono = document.getElementById("perfilTelefono");
const campoPerfilEmail = document.getElementById("perfilEmail");
const campoPerfilNotas = document.getElementById("perfilNotas");
const formularioPerfil = document.getElementById("formularioPerfil");
const alertaPerfil = document.getElementById("alertaPerfil");

// La clave con la que guardamos las notas médicas de este paciente,
// distinta para cada correo, ya que localStorage es compartido
const claveNotas = "medicitaNotas_" + usuarioSesionPerfil.email;

/* -----------------------------------------------------------------
   Cargamos en pantalla los datos actuales del usuario
   ----------------------------------------------------------------- */
function cargarDatosPerfil() {
    perfilNombreCompleto.textContent = usuarioSesionPerfil.nombre;
    perfilCorreo.textContent = usuarioSesionPerfil.email;

    campoPerfilNombre.value = usuarioSesionPerfil.nombre;
    campoPerfilEmail.value = usuarioSesionPerfil.email;

    // Buscamos el teléfono en la lista de usuarios registrados (si existe)
    const usuarioCompleto = obtenerUsuariosRegistradosPerfil().find(function (usuario) {
        return usuario.email === usuarioSesionPerfil.email;
    });
    campoPerfilTelefono.value = usuarioCompleto ? usuarioCompleto.telefono : "";

    // Cargamos las notas médicas guardadas previamente, si existen
    campoPerfilNotas.value = localStorage.getItem(claveNotas) || "";
}

cargarDatosPerfil();

/* -----------------------------------------------------------------
   Guardar cambios del formulario
   ----------------------------------------------------------------- */
formularioPerfil.addEventListener("submit", function (evento) {
    evento.preventDefault();

    document.getElementById("grupoPerfilNombre").classList.remove("con-error");
    document.getElementById("grupoPerfilTelefono").classList.remove("con-error");
    alertaPerfil.classList.remove("mostrar");

    let formularioValido = true;

    if (campoPerfilNombre.value.trim() === "") {
        document.getElementById("grupoPerfilNombre").classList.add("con-error");
        formularioValido = false;
    }

    const telefonoLimpio = campoPerfilTelefono.value.trim();
    if (telefonoLimpio !== "" && !/^\d{9}$/.test(telefonoLimpio)) {
        document.getElementById("grupoPerfilTelefono").classList.add("con-error");
        formularioValido = false;
    }

    if (!formularioValido) {
        return;
    }

    // Actualizamos el nombre en la sesión activa
    usuarioSesionPerfil.nombre = campoPerfilNombre.value.trim();
    guardarSesion(usuarioSesionPerfil);

    // Si el usuario existe en la lista de registrados (no es la cuenta demo),
    // también actualizamos su nombre y teléfono ahí
    const usuariosRegistrados = obtenerUsuariosRegistradosPerfil();
    const indiceUsuario = usuariosRegistrados.findIndex(function (usuario) {
        return usuario.email === usuarioSesionPerfil.email;
    });

    if (indiceUsuario !== -1) {
        usuariosRegistrados[indiceUsuario].nombre = campoPerfilNombre.value.trim();
        usuariosRegistrados[indiceUsuario].telefono = telefonoLimpio;
        localStorage.setItem("medicitaUsuarios", JSON.stringify(usuariosRegistrados));
    }

    // Guardamos las notas médicas
    localStorage.setItem(claveNotas, campoPerfilNotas.value.trim());

    // Refrescamos la tarjeta de resumen y el nombre del sidebar
    perfilNombreCompleto.textContent = usuarioSesionPerfil.nombre;
    const nombreSidebar = document.getElementById("sidebarNombreUsuario");
    if (nombreSidebar) {
        nombreSidebar.textContent = usuarioSesionPerfil.nombre;
    }

    alertaPerfil.textContent = "Tus datos se actualizaron correctamente.";
    alertaPerfil.classList.add("mostrar");
});

function obtenerUsuariosRegistradosPerfil() {
    const datos = localStorage.getItem("medicitaUsuarios");
    return datos ? JSON.parse(datos) : [];
}
