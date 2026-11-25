import { addDoc, deleteDoc, doc, getDocs, query, where } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import {
    signInWithPopup,
    signOut,
    onAuthStateChanged,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { db, notasRef, auth, provider } from "./firebase_config.js";

var btnCrear = document.getElementById("btn-crear");
var pizarra = document.getElementById("pizarra");

var modalLogin = document.getElementById("modal-login");
var inputEmail = document.getElementById("input-email");
var inputPassword = document.getElementById("input-password");
var btnLoginEmail = document.getElementById("btn-login-email");
var btnRegistroEmail = document.getElementById("btn-registro-email");
var btnGoogleLogin = document.getElementById("btn-google-login");
var btnLogout = document.getElementById("btn-logout");
var mensajeErrorLogin = document.getElementById("mensaje-error-login");

var modalCrear = document.getElementById("modal-crear");
var btnCancelarCrear = document.getElementById("btn-cancelar-crear");
var btnGuardarCrear = document.getElementById("btn-guardar-crear");

var modalEdicion = document.getElementById("modal-edicion");
var btnCancelarEdicion = document.getElementById("btn-cancelar-edicion");
var btnGuardar = document.getElementById("btn-guardar");

var modalBorrar = document.getElementById("modal-borrar");
var btnConfirmarBorrar = document.getElementById("btn-confirmar-borrar");
var btnCancelarBorrar = document.getElementById("btn-cancelar-borrar");

var notaABorrar = null;
var posInicialLeft = 0;
var posInicialTop = 0;

/* ==================================================
        RENDERIZADO Y CONSULTAS A FIRESTORE
   ================================================== */
function limpiarPizarra() {
    var notasEnPantalla = document.querySelectorAll("#postIt, .post-it");
    notasEnPantalla.forEach(function(nota) {
        nota.remove();
    });
}

function dibujarPostIt(id, texto, color, posX, posY) {
    var nuevaNota = document.createElement("div");
    nuevaNota.className = "post-it";
    nuevaNota.style.backgroundColor = color;
    nuevaNota.style.left = `${posX}px`;
    nuevaNota.style.top = `${posY}px`;
    nuevaNota.dataset.id = id;

    var parrafo = document.createElement("p");
    parrafo.innerText = texto;

    nuevaNota.appendChild(parrafo);
    pizarra.appendChild(nuevaNota);

    hacerArrastrable(nuevaNota);
}

// async ---> realizo peticiones a Firestore sin congelar la interfaz
async function cargarNotasUsuario(uid) {
    // 1. Vacio el DOM para que no se vean las notas de la cuenta anterior
    limpiarPizarra();

    try {
        // 2. Consulta que busca en "Post-It" únicamente los documentos cuyo campo 'uid' coincida con el del usuario activo
        var consulta = query(notasRef, where("uid", "==", uid));

        // 3. Ejecuto la consulta y pauso la función (await) hasta recibir los resultados (snapshot)
        var snapshot = await getDocs(consulta);

        // 4. Limpio para evitar notas duplicadas si el evento de autenticación se disparara dos veces seguidas
        limpiarPizarra();

        // 5. Recorro cada documento devuelto en el snapshot
        snapshot.forEach(function(documento) {
            
            var datos = documento.data(); //.data() devuelve objeto JS con los campos que guardamos (texto, color, coordenadas)

            // Delegamos el renderizado pasando también el metadato 'documento.id' (el ID autogenerado
            // por Firebase), que se guardará en dataset.id para poder borrar esa nota exacta más tarde
            dibujarPostIt(
                documento.id,
                datos.texto,
                datos.color,
                datos.coordenadaX,
                datos.coordenadaY
            );
        });
    } catch (error) {
        // Captura errores de conexión o de reglas de seguridad sin romper el resto del script
        console.error("Error al cargar las notas del usuario:", error);
    }
}

/* ==================================================
        AUTENTICACIÓN (EMAIL/PASSWORD Y GOOGLE)
   ================================================== */
// Traduce los códigos de error de Firebase Auth a mensajes legibles para el usuario
function mostrarErrorAuth(codigoError) {
    switch (codigoError) {
        case "auth/invalid-email":
            mensajeErrorLogin.innerText = "El formato del correo no es válido.";
            break;
        case "auth/user-not-found":
        case "auth/wrong-password":
        case "auth/invalid-credential":
            mensajeErrorLogin.innerText = "Correo o contraseña incorrectos.";
            break;
        case "auth/email-already-in-use":
            mensajeErrorLogin.innerText = "Este correo ya está registrado.";
            break;
        case "auth/weak-password":
            mensajeErrorLogin.innerText = "La contraseña debe tener al menos 6 caracteres.";
            break;
        default:
            mensajeErrorLogin.innerText = "Error de autenticación. Inténtalo de nuevo.";
    }
}

// Iniciar sesión con correo y contraseña
btnLoginEmail.addEventListener("click", async function() {
    mensajeErrorLogin.innerText = "";
    let email = inputEmail.value.trim();
    let password = inputPassword.value;

    if (email === "" || password === "") {
        mensajeErrorLogin.innerText = "Rellena el correo y la contraseña.";
        return;
    }

    try {
        await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
        mostrarErrorAuth(error.code);
    }
});

// Registrar una cuenta nueva con correo y contraseña (inicia sesión automáticamente tras crearla)
btnRegistroEmail.addEventListener("click", async function() {
    mensajeErrorLogin.innerText = "";
    let email = inputEmail.value.trim();
    let password = inputPassword.value;

    if (email === "" || password === "") {
        mensajeErrorLogin.innerText = "Rellena el correo y la contraseña para registrarte.";
        return;
    }

    try {
        await createUserWithEmailAndPassword(auth, email, password);
    } catch (error) {
        mostrarErrorAuth(error.code);
    }
});

// Iniciar sesión con Google
btnGoogleLogin.addEventListener("click", async function() {
    mensajeErrorLogin.innerText = "";
    try {
        await signInWithPopup(auth, provider);
    } catch (error) {
        console.error("Error al iniciar sesión con Google:", error);
        mensajeErrorLogin.innerText = "No se pudo iniciar sesión con Google.";
    }
});

// Cerrar sesión
btnLogout.addEventListener("click", async function() {
    limpiarPizarra();
    try {
        await signOut(auth);
    } catch (error) {
        console.error("Error al cerrar sesión:", error);
    }
});

// Observador del estado de sesión: actúa igual tanto para login con correo como con Google.
// Al iniciar decide automáticamente si enseñarme el modal de login o dejarme pasar a la pizarra
onAuthStateChanged(auth, async function(usuario) {
    if (usuario) {
        inputEmail.value = "";
        inputPassword.value = "";
        modalLogin.style.display = "none";
        btnLogout.style.display = "block";
        await cargarNotasUsuario(usuario.uid);
    } else {
        limpiarPizarra();
        modalLogin.style.display = "flex";
        btnLogout.style.display = "none";
    }
});

/* ==================================================
        MODALES CREAR / EDITAR
   ================================================== */
btnCrear.addEventListener("click", function() {
    document.getElementById("input-texto-crear").value = "";
    document.getElementById("input-color-crear").value = "#fffa65";
    modalCrear.style.display = "flex";
});

btnCancelarCrear.addEventListener("click", function() {
    modalCrear.style.display = "none";
});

btnCancelarEdicion.addEventListener("click", function() {
    modalEdicion.style.display = "none";
});

/* ==================================================
        ARRASTRE DEL BOTÓN FLOTANTE (+)
   ================================================== */
var offsetX, offsetY;

btnCrear.addEventListener("touchstart", (e) => {
    let rect = btnCrear.getBoundingClientRect();
    offsetX = e.touches[0].clientX - rect.left;
    offsetY = e.touches[0].clientY - rect.top;
});

btnCrear.addEventListener("touchmove", (e) => {
    e.preventDefault();
    let toque = e.touches[0];

    btnCrear.style.bottom = "auto";
    btnCrear.style.right = "auto";

    btnCrear.style.top = `${toque.clientY - offsetY}px`;
    btnCrear.style.left = `${toque.clientX - offsetX}px`;
});

/* ==================================================
        DRAG & DROP Y GESTO SWIPE EN POST-ITS
   ================================================== */
function hacerArrastrable(elem) {
    var offsetX, offsetY;
    var startX = 0;
    var startY = 0;
    var startTime = 0;

    elem.addEventListener("touchstart", function(e) {
        let rect = elem.getBoundingClientRect();
        offsetX = e.touches[0].clientX - rect.left;
        offsetY = e.touches[0].clientY - rect.top;

        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
        startTime = Date.now();

        elem.classList.remove("restituir-posicion");
    });

    elem.addEventListener("touchmove", function(e) {
        e.preventDefault();
        let toque = e.touches[0];

        elem.style.left = `${toque.clientX - offsetX}px`;
        elem.style.top = `${toque.clientY - offsetY}px`;
    });

    elem.addEventListener("touchend", function(e) {
        let toque = e.changedTouches[0];
        let deltaX = toque.clientX - startX;
        let deltaY = toque.clientY - startY;
        let deltaTime = Date.now() - startTime;

        let esSwipeHorizontal = Math.abs(deltaX) > 90 && Math.abs(deltaY) < 60 && deltaTime < 400;

        if (esSwipeHorizontal) {
            notaABorrar = elem;
            posInicialLeft = startX - offsetX;
            posInicialTop = startY - offsetY;

            modalBorrar.style.display = "flex";
        }
    });
}

/* ==================================================
        CONFIRMACIÓN DE BORRADO Y RESTITUCIÓN
   ================================================== */
btnConfirmarBorrar.addEventListener("click", async function() {
    if (notaABorrar) {
        let idNota = notaABorrar.dataset.id;

        try {
            if (idNota) {
                await deleteDoc(doc(db, "Post-It", idNota));
            }
            notaABorrar.remove();
        } catch (error) {
            console.error("Error al eliminar la nota:", error);
        }
    }

    modalBorrar.style.display = "none";
    notaABorrar = null;
});

btnCancelarBorrar.addEventListener("click", function() {
    if (notaABorrar) {
        notaABorrar.classList.add("restituir-posicion");
        notaABorrar.style.left = `${posInicialLeft}px`;
        notaABorrar.style.top = `${posInicialTop}px`;
    }

    modalBorrar.style.display = "none";
    notaABorrar = null;
});

/* ==================================================
        CREACIÓN Y PERSISTENCIA EN FIRESTORE
   ================================================== */
btnGuardarCrear.addEventListener("click", async function() {
    let texto = document.getElementById("input-texto-crear").value;
    let colorSeleccionado = document.getElementById("input-color-crear").value;

    if (texto.trim() === "") {
        alert("Escribe algo antes de guardar.");
        return;
    }

    let posX = 50;
    let posY = 100;

    try {
        let docRef = await addDoc(notasRef, {
            texto: texto,
            color: colorSeleccionado,
            coordenadaX: posX,
            coordenadaY: posY,
            uid: auth.currentUser ? auth.currentUser.uid : null
        });

        dibujarPostIt(docRef.id, texto, colorSeleccionado, posX, posY);
        modalCrear.style.display = "none";

    } catch (error) {
        console.error("Error al guardar en Firestore:", error);
    }
});