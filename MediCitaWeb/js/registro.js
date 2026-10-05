/* =================================================================
   ARCHIVO: registro.js
   Lógica de la pantalla de registro de nuevos pacientes.
   Depende de app.js (debe cargarse después de él).
   ================================================================= */

cargarComponente("navbarContenedor", "components/navbar.html", inicializarNavbar);
cargarComponente("footerContenedor", "components/footer.html");

// Referencias a los campos del formulario
const formularioRegistro = document.getElementById("formularioRegistro");
const campoNombre = document.getElementById("nombre");
const campoApellido = document.getElementById("apellido");
const campoEmailRegistro = document.getElementById("emailRegistro");
const campoTelefono = document.getElementById("telefono");
const campoPasswordRegistro = document.getElementById("passwordRegistro");
const campoConfirmarPassword = document.getElementById("confirmarPassword");
const alertaRegistro = document.getElementById("alertaRegistro");

formularioRegistro.addEventListener("submit", function (evento) {
    evento.preventDefault();

    // Quitamos los estados de error de un envío anterior antes de revalidar
    const gruposFormulario = document.querySelectorAll(".grupo-formulario");
    gruposFormulario.forEach(function (grupo) {
        grupo.classList.remove("con-error");
    });
    alertaRegistro.classList.remove("mostrar");

    let formularioValido = true;

    // Nombre y apellido no pueden estar vacíos
    if (campoNombre.value.trim() === "") {
        document.getElementById("grupoNombre").classList.add("con-error");
        formularioValido = false;
    }
    if (campoApellido.value.trim() === "") {
        document.getElementById("grupoApellido").classList.add("con-error");
        formularioValido = false;
    }

    // El correo debe tener formato válido
    if (!esEmailValido(campoEmailRegistro.value.trim())) {
        document.getElementById("grupoEmailRegistro").classList.add("con-error");
        formularioValido = false;
    }

    // El teléfono debe tener exactamente 9 dígitos numéricos (formato Perú)
    const telefonoLimpio = campoTelefono.value.trim();
    if (!/^\d{9}$/.test(telefonoLimpio)) {
        document.getElementById("grupoTelefono").classList.add("con-error");
        formularioValido = false;
    }

    // La contraseña debe tener mínimo 6 caracteres
    if (campoPasswordRegistro.value.trim().length < 6) {
        document.getElementById("grupoPasswordRegistro").classList.add("con-error");
        formularioValido = false;
    }

    // Las dos contraseñas deben coincidir
    if (campoPasswordRegistro.value !== campoConfirmarPassword.value) {
        document.getElementById("grupoConfirmarPassword").classList.add("con-error");
        formularioValido = false;
    }

    if (!formularioValido) {
        return;
    }

    // Armamos el objeto con los datos del nuevo paciente
    const nuevoUsuario = {
        nombre: campoNombre.value.trim() + " " + campoApellido.value.trim(),
        email: campoEmailRegistro.value.trim(),
        telefono: telefonoLimpio,
        password: campoPasswordRegistro.value
    };

    // Evitamos que se registre dos veces el mismo correo
    const usuarios = obtenerUsuariosRegistrados();
    const correoYaExiste = usuarios.some(function (usuario) {
        return usuario.email.toLowerCase() === nuevoUsuario.email.toLowerCase();
    });

    if (correoYaExiste) {
        alertaRegistro.className = "alerta mostrar alerta-info";
        alertaRegistro.textContent = "Ya existe una cuenta registrada con ese correo electrónico.";
        return;
    }

    // Guardamos al nuevo usuario en la lista general de usuarios
    usuarios.push(nuevoUsuario);
    localStorage.setItem("medicitaUsuarios", JSON.stringify(usuarios));

    // Iniciamos sesión automáticamente y lo llevamos directo a su panel
    guardarSesion({ nombre: nuevoUsuario.nombre, email: nuevoUsuario.email });

    alertaRegistro.className = "alerta mostrar alerta-exito";
    alertaRegistro.textContent = "¡Cuenta creada con éxito! Redirigiendo a tu panel...";

    // Pequeña espera para que el usuario alcance a leer el mensaje de éxito
    setTimeout(function () {
        window.location.href = "dashboard.html";
    }, 1200);
});

function obtenerUsuariosRegistrados() {
    const datos = localStorage.getItem("medicitaUsuarios");
    return datos ? JSON.parse(datos) : [];
}
