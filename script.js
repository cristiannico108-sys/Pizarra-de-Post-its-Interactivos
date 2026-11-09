import { addDoc, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { db, notasRef } from "./firebase_config.js";

/*==================================================
                VARIABLES GLOBALES
  ================================================== */
var btnCrear = document.getElementById("btn-crear");
var modalEdicion = document.getElementById("modal-edicion");
var btnCancelarEdicion = document.getElementById("btn-cancelar-edicion");
var btnGuardar = document.getElementById("btn-guardar");
var pizarra = document.getElementById("pizarra");

// Variables para el modal de borrado
var modalBorrar = document.getElementById("modal-borrar");
var btnConfirmarBorrar = document.getElementById("btn-confirmar-borrar");
var btnCancelarBorrar = document.getElementById("btn-cancelar-borrar");

// Guardará la nota activa que se intenta borrar y su posición inicial
var notaABorrar = null;
var posInicialLeft = 0;
var posInicialTop = 0;

/*==================================================
                MENÚ CREAR / EDITAR
  ================================================== */
btnCrear.addEventListener("click", function() {
    document.getElementById("input-texto").value = "";
    document.getElementById("input-color").value = "#fffa65";
    document.getElementById("modal-titulo").innerText = "Nueva Nota";

    modalEdicion.style.display = "flex";
});

btnCancelarEdicion.addEventListener("click", function() {
    modalEdicion.style.display = "none";
});

/*====================================================================
            MOVIMIENTO DEL BOTÓN CREAR (+)
  ==================================================================== */
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

/*====================================================================
            MOVIMIENTO Y GESTO SWIPE EN POST-ITS
  ==================================================================== */
function hacerArrastrable(elem) {
    var offsetX, offsetY;
    var startX = 0;
    var startY = 0;
    var startTime = 0;

    elem.addEventListener("touchstart", function(e) {
        let rect = elem.getBoundingClientRect();
        offsetX = e.touches[0].clientX - rect.left;
        offsetY = e.touches[0].clientY - rect.top;

        // Guardamos posición y tiempo inicial para detectar swipe y para la restitución
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
        startTime = Date.now();

        // Le quitamos transiciones anteriores si las tenía
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

        // Criterio de Swipe: desplazamiento horizontal rápido (más de 90px en menos de 400ms)
        let esSwipeHorizontal = Math.abs(deltaX) > 90 && Math.abs(deltaY) < 60 && deltaTime < 400;

        if (esSwipeHorizontal) {
            // Guardamos la nota seleccionada y la posición donde empezó el arrastre
            notaABorrar = elem;
            posInicialLeft = startX - offsetX;
            posInicialTop = startY - offsetY;

            // Abrimos el modal de confirmación
            modalBorrar.style.display = "flex";
        }
    });
}

/*====================================================================
            FLUJO DE CONFIRMACIÓN DE BORRADO (MODAL)
  ==================================================================== */
// Si el usuario ACEPTA eliminar la nota
btnConfirmarBorrar.addEventListener("click", async function() {
    if (notaABorrar) {
        let idNota = notaABorrar.dataset.id;

        try {
            // 1. Borrar de Firestore (si tiene ID guardado)
            if (idNota) {
                await deleteDoc(doc(db, "Post-It", idNota));
                console.log("Nota eliminada de Firebase");
            }

            // 2. Eliminar del DOM
            notaABorrar.remove();
        } catch (error) {
            console.error("Error al eliminar la nota:", error);
        }
    }

    modalBorrar.style.display = "none";
    notaABorrar = null;
});

// Si el usuario CANCELA la eliminación
btnCancelarBorrar.addEventListener("click", function() {
    if (notaABorrar) {
        // Añadimos la clase CSS para que la animación de vuelta sea fluida
        notaABorrar.classList.add("restituir-posicion");
        
        // Devolvemos la nota a su coordenada original
        notaABorrar.style.left = `${posInicialLeft}px`;
        notaABorrar.style.top = `${posInicialTop}px`;
    }

    modalBorrar.style.display = "none";
    notaABorrar = null;
});

/*====================================================================
            CREACIÓN VISUAL Y SUBIDA AL FIRESTORE
  ==================================================================== */
var postItInicial = document.getElementById("postIt");
if (postItInicial) {
    hacerArrastrable(postItInicial);
}

btnGuardar.addEventListener("click", async function() {
    let texto = document.getElementById("input-texto").value;
    let color = document.getElementById("input-color").value;

    if (texto.trim() === "") {
        alert("Escribe algo antes de guardar.");
        return;
    }

    let posX = 50;
    let posY = 100;

    try {
        // 1. Guardar en Firestore y obtener la referencia del nuevo documento
        let docRef = await addDoc(notasRef, {
            texto: texto,
            color: color,
            coordenadaX: posX,
            coordenadaY: posY
        });

        // 2. Crear la nota visualmente en la pantalla
        var nuevaNota = document.createElement("div");
        nuevaNota.className = "post-it";
        nuevaNota.style.backgroundColor = color;
        nuevaNota.style.left = `${posX}px`; 
        nuevaNota.style.top = `${posY}px`;

        // Guardamos el ID único de Firebase en el elemento HTML
        nuevaNota.dataset.id = docRef.id;

        var parrafo = document.createElement("p");
        parrafo.innerText = texto;

        nuevaNota.appendChild(parrafo);
        pizarra.appendChild(nuevaNota);

        // Activamos los gestos en la nueva nota
        hacerArrastrable(nuevaNota);

        modalEdicion.style.display = "none";

    } catch (error) {
        console.error("Error al guardar en Firestore:", error);
    }
});