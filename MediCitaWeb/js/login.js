/* =================================================================
   ARCHIVO: login.js
   Lógica de la pantalla de inicio de sesión.
   Depende de las funciones definidas en app.js (debe cargarse
   siempre DESPUÉS de <script src="js/app.js"></script>).
   ================================================================= */

// Insertamos el navbar y el footer apenas carga la página
cargarComponente("navbarContenedor", "components/navbar.html", inicializarNavbar);
cargarComponente("footerContenedor", "components/footer.html");

// Referencias a los elementos del formulario
const formularioLogin = document.getElementById("formularioLogin");
const campoEmail = document.getElementById("email");
const campoPassword = document.getElementById("password");
const grupoEmail = document.getElementById("grupoEmail");
const grupoPassword = document.getElementById("grupoPassword");
const alertaLogin = document.getElementById("alertaLogin");
const btnAccesoDemo = document.getElementById("btnAccesoDemo");

// Cuenta de demostración fija, para que en la sustentación se pueda
// entrar al sistema sin necesidad de registrarse primero.
const CUENTA_DEMO = {
    nombre: "Paciente Demo",
    email: "demo@medicita.com",
    password: "demo123"
};

/* Evento que se dispara al enviar el formulario */
formularioLogin.addEventListener("submit", function (evento) {
    evento.preventDefault(); // evita que la página se recargue

    // Reiniciamos los estados de error antes de validar de nuevo
    grupoEmail.classList.remove("con-error");
    grupoPassword.classList.remove("con-error");
    alertaLogin.classList.remove("mostrar");

    let formularioValido = true;

    // Validación del correo
    if (!esEmailValido(campoEmail.value.trim())) {
        grupoEmail.classList.add("con-error");
        formularioValido = false;
    }

    // Validación de la contraseña (mínimo 6 caracteres)
    if (campoPassword.value.trim().length < 6) {
        grupoPassword.classList.add("con-error");
        formularioValido = false;
    }

    if (!formularioValido) {
        return; // detenemos el proceso si algún campo no es válido
    }

    // Buscamos si el correo y contraseña coinciden con la cuenta demo
    // o con algún usuario registrado previamente en registro.html
    const usuariosRegistrados = obtenerUsuariosRegistrados();
    const emailIngresado = campoEmail.value.trim().toLowerCase();
    const passwordIngresada = campoPassword.value.trim();

    let usuarioEncontrado = null;

    if (emailIngresado === CUENTA_DEMO.email && passwordIngresada === CUENTA_DEMO.password) {
        usuarioEncontrado = CUENTA_DEMO;
    } else {
        usuarioEncontrado = usuariosRegistrados.find(function (usuario) {
            return usuario.email.toLowerCase() === emailIngresado && usuario.password === passwordIngresada;
        });
    }

    if (usuarioEncontrado) {
        // Guardamos la sesión (sin exponer la contraseña) y entramos al panel
        guardarSesion({ nombre: usuarioEncontrado.nombre, email: usuarioEncontrado.email });
        window.location.href = "dashboard.html";
    } else {
        alertaLogin.textContent = "Correo o contraseña incorrectos. Intenta nuevamente o usa el acceso de demostración.";
        alertaLogin.classList.add("mostrar");
    }
});

/* Botón de acceso rápido con la cuenta de demostración,
   pensado para agilizar la exposición del proyecto */
btnAccesoDemo.addEventListener("click", function () {
    guardarSesion({ nombre: CUENTA_DEMO.nombre, email: CUENTA_DEMO.email });
    window.location.href = "dashboard.html";
});

/* Lee del localStorage la lista de usuarios creados en registro.html */
function obtenerUsuariosRegistrados() {
    const datos = localStorage.getItem("medicitaUsuarios");
    return datos ? JSON.parse(datos) : [];
}
const btnLogin = document.getElementById('btnLogin');

if (btnLogin) {
  btnLogin.addEventListener('click', () => {
    if (btnLogin.classList.contains('animado')) return;

    btnLogin.classList.add('animado');

    setTimeout(() => {
      btnLogin.classList.remove('animado');
    }, 600);
  });
}
// --- AGREGAR AL FINAL DE TU ARCHIVO JS ---

const btnLogin = document.getElementById('btnLogin');

if (btnLogin) {
  btnLogin.addEventListener('click', () => {
    if (btnLogin.classList.contains('animado')) return;

    btnLogin.classList.add('animado');

    setTimeout(() => {
      btnLogin.classList.remove('animado');
    }, 600);
  });
}