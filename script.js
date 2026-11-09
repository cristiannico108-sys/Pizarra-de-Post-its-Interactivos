import { addDoc, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { db, notasRef } from "./firebase_config.js";

/*==================================================
                VARIABLES GLOBALES
  ================================================== */
var btnCrear = document.getElementById("btn-crear");

// Modal exclusivo para CREAR
var modalCrear = document.getElementById("modal-crear");
var btnCancelarCrear = document.getElementById("btn-cancelar-crear");
var btnGuardarCrear = document.getElementById("btn-guardar-crear");

// Modal para ACTUALIZAR / EDITAR
var modalEdicion = document.getElementById("modal-edicion");
var btnCancelarEdicion = document.getElementById("btn-cancelar-edicion");
var btnGuardar = document.getElementById("btn-guardar");

// Modal para BORRAR
var modalBorrar = document.getElementById("modal-borrar");
var btnConfirmarBorrar = document.getElementById("btn-confirmar-borrar");
var btnCancelarBorrar = document.getElementById("btn-cancelar-borrar");

var pizarra = document.getElementById("pizarra");

// Variables para el flujo de borrado y selección de color
var notaABorrar = null;
var posInicialLeft = 0;
var posInicialTop = 0;
var colorSeleccionado = "#fffa65"; // Color por defecto (amarillo)

/*==================================================
                MENÚ CREAR / PALETA DE COLORES
  ================================================== */

// Abrir el modal de creación al pulsar "+"
btnCrear.addEventListener("click", function() {
    document.getElementById("input-texto-crear").value = "";
    modalCrear.style.display = "flex";
});

// Cerrar modal de creación
btnCancelarCrear.addEventListener("click", function() {
    modalCrear.style.display = "none";
});

// Selección de color mediante la paleta de botones
var botonesColor = document.querySelectorAll(".btn-color");
botonesColor.forEach(function(boton) {
    boton.addEventListener("click", function() {
        botonesColor.forEach(b => b.classList.remove("activo"));
        this.classList.add("activo");
        colorSeleccionado = this.dataset.color;
    });
});

// Cerrar modal de edición
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

        // Guardamos posición y tiempo inicial para detectar swipe y para restituir
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

        // Swipe horizontal rápido (más de 90px en menos de 400ms)
        let esSwipeHorizontal = Math.abs(deltaX) > 90 && Math.abs(deltaY) < 60 && deltaTime < 400;

        if (esSwipeHorizontal) {
            notaABorrar = elem;
            posInicialLeft = startX - offsetX;
            posInicialTop = startY - offsetY;

            modalBorrar.style.display = "flex";
        }
    });
}

/*====================================================================
            FLUJO DE CONFIRMACIÓN DE BORRADO (MODAL)
  ==================================================================== */
btnConfirmarBorrar.addEventListener("click", async function() {
    if (notaABorrar) {
        let idNota = notaABorrar.dataset.id;

        try {
            if (idNota) {
                await deleteDoc(doc(db, "Post-It", idNota));
                console.log("Nota eliminada de Firebase");
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

/*====================================================================
            CREACIÓN VISUAL Y SUBIDA AL FIRESTORE
  ==================================================================== */
var postItInicial = document.getElementById("postIt");
if (postItInicial) {
    hacerArrastrable(postItInicial);
}

btnGuardarCrear.addEventListener("click", async function() {
    let texto = document.getElementById("input-texto-crear").value;

    if (texto.trim() === "") {
        alert("Escribe algo antes de guardar.");
        return;
    }

    let posX = 50;
    let posY = 100;

    try {
        // 1. Guardar en Firestore
        let docRef = await addDoc(notasRef, {
            texto: texto,
            color: colorSeleccionado,
            coordenadaX: posX,
            coordenadaY: posY
        });

        // 2. Crear el post-it en la pantalla
        var nuevaNota = document.createElement("div");
        nuevaNota.className = "post-it";
        nuevaNota.style.backgroundColor = colorSeleccionado;
        nuevaNota.style.left = `${posX}px`;
        nuevaNota.style.top = `${posY}px`;

        nuevaNota.dataset.id = docRef.id;

        var parrafo = document.createElement("p");
        parrafo.innerText = texto;

        nuevaNota.appendChild(parrafo);
        pizarra.appendChild(nuevaNota);

        hacerArrastrable(nuevaNota);

        modalCrear.style.display = "none";

    } catch (error) {
        console.error("Error al guardar en Firestore:", error);
    }
});