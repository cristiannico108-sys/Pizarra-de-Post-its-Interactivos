import { addDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { notasRef } from "./firebase_config.js";

/*==================================================
                VARIABLES GLOBALES
  ================================================== */
var btnCrear = document.getElementById("btn-crear");
var modalEdicion = document.getElementById("modal-edicion");
var btnCancelarEdicion = document.getElementById("btn-cancelar-edicion");
var btnGuardar = document.getElementById("btn-guardar");
var pizarra = document.getElementById("pizarra");

/*==================================================
                MENÚ
  ================================================== */

/*=============================
        AL CLICKAR EN "+"
  =============================
*/

btnCrear.addEventListener("click", function() {
    document.getElementById("input-texto").value = "";
    document.getElementById("input-color").value = "#fffa65";
    document.getElementById("modal-titulo").innerText = "Nueva Nota";

    modalEdicion.style.display = "flex";
});

/*===================================
      Al pulsar en "Cancelar"
=====================================
*/
btnCancelarEdicion.addEventListener("click", function() {
    modalEdicion.style.display = "none";
});

/*====================================================================
            MOVIMIENTO DEL BOTÓN CREAR (+)
  ==================================================================== */
var offsetX, offsetY;

// CUANDO EMPIEZO A PULSAR EL BOTÓN
btnCrear.addEventListener("touchstart", (e) => {
    let rect = btnCrear.getBoundingClientRect();
    offsetX = e.touches[0].clientX - rect.left;
    offsetY = e.touches[0].clientY - rect.top;
});

// CUANDO ESTOY PULSANDO Y MOVIENDO EL BOTÓN
btnCrear.addEventListener("touchmove", (e) => {
    e.preventDefault();
    let toque = e.touches[0];

    btnCrear.style.bottom = "auto";
    btnCrear.style.right = "auto";

    btnCrear.style.top = `${toque.clientY - offsetY}px`;
    btnCrear.style.left = `${toque.clientX - offsetX}px`;
});

/*====================================================================
                MOVIMIENTO DE LOS POST-ITS
  ==================================================================== */

function hacerArrastrable(elem) {
    var offsetX, offsetY;

    elem.addEventListener("touchstart", function(e) {
        let rect = elem.getBoundingClientRect();
        offsetX = e.touches[0].clientX - rect.left;
        offsetY = e.touches[0].clientY - rect.top;
    });

    elem.addEventListener("touchmove", function(e) {
        e.preventDefault(); // Evita el scroll de la página en móviles
        let toque = e.touches[0];

        elem.style.left = `${toque.clientX - offsetX}px`;
        elem.style.top = `${toque.clientY - offsetY}px`;
    });
}

// Activar movimiento en la nota de prueba del HTML si existe
var postItInicial = document.getElementById("postIt");
if (postItInicial) {
    hacerArrastrable(postItInicial);
}

/*====================================================================
            CREACIÓN VISUAL Y SUBIDA AL FIRESTORE
  ==================================================================== */
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
        // 1. Guardar en Firestore
        await addDoc(notasRef, {
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

        var parrafo = document.createElement("p");
        parrafo.innerText = texto;

        nuevaNota.appendChild(parrafo);
        pizarra.appendChild(nuevaNota);

        // Activamos la función de arrastrar en la nueva nota recién creada
        hacerArrastrable(nuevaNota);

        modalEdicion.style.display = "none";

    } catch (error) {
        console.error("Error al guardar en Firestore:", error);
    }
});