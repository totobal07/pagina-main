// Expresión regular global para correos (Recomendación de seguridad básica de IA)
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ==========================================
// 1. LÓGICA DEL CARRUSEL (DOM)
// ==========================================
let indiceImagenActual = 0;

function cambiarImagen(direccion) {
    const slides = document.querySelectorAll('.slide');
    
    // Ocultar la imagen actual
    slides[indiceImagenActual].classList.remove('active');
    
    // Calcular el nuevo índice
    indiceImagenActual = indiceImagenActual + direccion;
    
    // Lógica para que sea un ciclo infinito
    if (indiceImagenActual >= slides.length) {
        indiceImagenActual = 0;
    } else if (indiceImagenActual < 0) {
        indiceImagenActual = slides.length - 1;
    }
    
    // Mostrar la nueva imagen
    slides[indiceImagenActual].classList.add('active');
}

// ==========================================
// 2. LÓGICA DE REGISTRO
// ==========================================
function validarRegistro(event) {
    event.preventDefault(); 

    const user = document.getElementById('reg-user').value.trim();
    const email = document.getElementById('reg-email').value.trim();
    const pass = document.getElementById('reg-pass').value;
    const passConfirm = document.getElementById('reg-pass-confirm').value;

    limpiarErrores(['error-reg-user', 'error-reg-email', 'error-reg-pass', 'error-reg-pass-confirm']);
    document.getElementById('reg-success').textContent = '';

    let isValid = true;

    if (!user) { mostrarError('error-reg-user', 'El usuario es obligatorio.'); isValid = false; }
    if (!emailRegex.test(email)) { mostrarError('error-reg-email', 'Formato de email inválido.'); isValid = false; }
    if (pass.length < 8) { mostrarError('error-reg-pass', 'La contraseña debe tener al menos 8 caracteres.'); isValid = false; }
    if (pass !== passConfirm || pass === '') { mostrarError('error-reg-pass-confirm', 'Las contraseñas no coinciden.'); isValid = false; }

    if (isValid) {
        let usuariosGuardados = JSON.parse(localStorage.getItem('diddyUsers')) || [];
        const existeUsuario = usuariosGuardados.some(u => u.correo === email);

        if (existeUsuario) {
            mostrarError('error-reg-email', 'Este correo ya está registrado.');
        } else {
            // Estructura de Datos: Objeto insertado en un Arreglo
            const nuevoUsuario = { usuario: user, correo: email, contrasena: pass };
            usuariosGuardados.push(nuevoUsuario);
            localStorage.setItem('diddyUsers', JSON.stringify(usuariosGuardados));
            
            document.getElementById('reg-success').textContent = '¡Registro completado! Ya puedes iniciar sesión.';
            document.getElementById('register-form').reset();
        }
    }
}

// ==========================================
// 3. LÓGICA DE LOGIN
// ==========================================
function validarLogin(event) {
    event.preventDefault();

    const email = document.getElementById('login-email').value.trim();
    const pass = document.getElementById('login-pass').value;

    limpiarErrores(['error-login-email', 'error-login-pass']);
    document.getElementById('login-success').textContent = '';

    let isValid = true;

    if (!email || !emailRegex.test(email)) { mostrarError('error-login-email', 'Ingresa un email válido.'); isValid = false; }
    if (!pass) { mostrarError('error-login-pass', 'La contraseña es obligatoria.'); isValid = false; }

    if (isValid) {
        let usuariosGuardados = JSON.parse(localStorage.getItem('diddyUsers')) || [];
        const usuarioValido = usuariosGuardados.find(u => u.correo === email && u.contrasena === pass);

        if (usuarioValido) {
            document.getElementById('login-success').textContent = `¡Ingreso exitoso! Bienvenido, ${usuarioValido.usuario}.`;
            document.getElementById('login-form').reset();
        } else {
            mostrarError('error-login-pass', 'Correo o contraseña incorrectos.');
        }
    }
}

// ==========================================
// 4. LÓGICA DE CONTACTO
// ==========================================
function validarContacto(event) {
    event.preventDefault();

    const name = document.getElementById('contact-name').value.trim();
    const email = document.getElementById('contact-email').value.trim(); // Modificado a email
    const msg = document.getElementById('contact-msg').value.trim();

    limpiarErrores(['error-contact-name', 'error-contact-email', 'error-contact-msg']);
    document.getElementById('contact-success').textContent = '';

    let isValid = true;

    if (!name) { mostrarError('error-contact-name', 'El nombre es obligatorio.'); isValid = false; }
    if (!emailRegex.test(email)) { mostrarError('error-contact-email', 'Ingresa un email válido.'); isValid = false; }
    if (!msg) { mostrarError('error-contact-msg', 'El mensaje no puede estar vacío.'); isValid = false; }

    if (isValid) {
        document.getElementById('contact-success').textContent = '¡Tu mensaje ha sido enviado!';
        document.getElementById('contact-form').reset();
        document.getElementById('char-counter').textContent = `0 / 300`;
    }
}

// ==========================================
// FUNCIONES AUXILIARES (Modulares)
// ==========================================
function mostrarError(idElemento, mensaje) {
    document.getElementById(idElemento).textContent = mensaje;
}

function limpiarErrores(arregloIds) {
    arregloIds.forEach(id => {
        document.getElementById(id).textContent = '';
    });
}

// Inicializar eventos al cargar el DOM
document.addEventListener('DOMContentLoaded', () => {
    // Vincular formularios con sus funciones modulares
    document.getElementById('register-form').addEventListener('submit', validarRegistro);
    document.getElementById('login-form').addEventListener('submit', validarLogin);
    document.getElementById('contact-form').addEventListener('submit', validarContacto);

    // Contador del textarea
    const contactMsgInput = document.getElementById('contact-msg');
    contactMsgInput.addEventListener('input', () => {
        const currentLength = contactMsgInput.value.length;
        document.getElementById('char-counter').textContent = `${currentLength} / 300`;
    });
});