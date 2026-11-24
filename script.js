import { addDoc, deleteDoc, doc, getDocs, query, where } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { signInWithPopup, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { db, notasRef, auth, provider } from "./firebase_config.js";

var btnCrear = document.getElementById("btn-crear");
var pizarra = document.getElementById("pizarra");

var modalLogin = document.getElementById("modal-login");
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

    // Vinculamos el elemento HTML del DOM con el ID único del documento en Firestore
    // mediante un atributo personalizado (data-id) para poder identificarlo al borrarlo
    nuevaNota.dataset.id = id;

    var parrafo = document.createElement("p");
    parrafo.innerText = texto;

    nuevaNota.appendChild(parrafo);
    pizarra.appendChild(nuevaNota);

    hacerArrastrable(nuevaNota);
}

async function cargarNotasUsuario(uid) {
    limpiarPizarra();
    try {
        // Filtramos en el servidor de Firestore para traer solo las notas del usuario conectado
        var consulta = query(notasRef, where("uid", "==", uid));
        var snapshot = await getDocs(consulta);

        limpiarPizarra();

        snapshot.forEach(function(documento) {
            var datos = documento.data();
            dibujarPostIt(
                documento.id,
                datos.texto,
                datos.color,
                datos.coordenadaX,
                datos.coordenadaY
            );
        });
    } catch (error) {
        console.error("Error al cargar las notas del usuario:", error);
    }
}

/* ==================================================
        AUTENTICACIÓN (GOOGLE OAUTH)
   ================================================== */
btnGoogleLogin.addEventListener("click", async function() {
    mensajeErrorLogin.innerText = "";
    try {
        // Abre la ventana emergente de Google; si tiene éxito, dispara automáticamente onAuthStateChanged
        await signInWithPopup(auth, provider);
    } catch (error) {
        console.error("Error al iniciar sesión con Google:", error);
        mensajeErrorLogin.innerText = "No se pudo iniciar sesión. Inténtalo de nuevo.";
    }
});

btnLogout.addEventListener("click", async function() {
    limpiarPizarra();
    try {
        await signOut(auth);
    } catch (error) {
        console.error("Error al cerrar sesión:", error);
    }
});

// Observador en tiempo real del estado de sesión: se ejecuta al entrar, salir o recargar la web
onAuthStateChanged(auth, async function(usuario) {
    if (usuario) {
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
    // Calculamos la distancia entre el dedo y el borde superior/izquierdo del botón
    // para que al moverlo no pegue un salto hacia la esquina del dedo
    let rect = btnCrear.getBoundingClientRect();
    offsetX = e.touches[0].clientX - rect.left;
    offsetY = e.touches[0].clientY - rect.top;
});

btnCrear.addEventListener("touchmove", (e) => {
    e.preventDefault(); // Bloquea el scroll nativo del móvil mientras arrastramos
    let toque = e.touches[0];

    // Anulamos bottom/right originales para poder posicionarlo libremente con top/left
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

        // Guardamos coordenadas y marca de tiempo (ms) al tocar para calcular la velocidad del swipe
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
        startTime = Date.now();

        // Quitamos la transición CSS durante el arrastre para que el movimiento sea instantáneo y sin retardo
        elem.classList.remove("restituir-posicion");
    });

    elem.addEventListener("touchmove", function(e) {
        e.preventDefault();
        let toque = e.touches[0];

        elem.style.left = `${toque.clientX - offsetX}px`;
        elem.style.top = `${toque.clientY - offsetY}px`;
    });

    elem.addEventListener("touchend", function(e) {
        // Usamos changedTouches[0] porque al levantar el dedo el array touches[] ya está vacío
        let toque = e.changedTouches[0];
        let deltaX = toque.clientX - startX;      // Desplazamiento horizontal total
        let deltaY = toque.clientY - startY;      // Desplazamiento vertical total
        let deltaTime = Date.now() - startTime;   // Tiempo que ha durado el gesto

        // Condición de Swipe: movimiento horizontal amplio (>90px), recto (<60px en Y) y rápido (<400ms)
        let esSwipeHorizontal = Math.abs(deltaX) > 90 && Math.abs(deltaY) < 60 && deltaTime < 400;

        if (esSwipeHorizontal) {
            notaABorrar = elem;
            // Reconstruimos la posición original exacta (top/left) por si el usuario cancela el borrado
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
                // doc() apunta al documento exacto dentro de "Post-It" usando el ID guardado en el HTML
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
        // Reactivamos la clase con transition CSS para que la nota vuelva suavemente a su sitio
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
        // addDoc crea un documento nuevo en Firestore con ID automático y devuelve su referencia (docRef.id)
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