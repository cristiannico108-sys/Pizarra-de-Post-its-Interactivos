
/*==================================================
                MENÚ
  ==================================================
*/

var btnCrear = document.getElementById("btn-crear");
var modalEdicion = document.getElementById("modal-edicion");
var btnCancelarEdicion = document.getElementById("btn-cancelar-edicion");

// Abrir el modal al pulsar "+"
btnCrear.addEventListener("click", function() {
    document.getElementById("input-texto").value = "";
    document.getElementById("input-color").value = "#fffa65";
    document.getElementById("modal-titulo").innerText = "Nueva Nota";

    modalEdicion.style.display = "flex";
});


// Cerrar el modal al pulsar "Cancelar"
btnCancelarEdicion.addEventListener("click", function() {
    modalEdicion.style.display = "none";
});


/*==================================================
        VINCULAR CON FIRESTORE
  ==================================================
*/



// 1. IMPORTACIONES DESDE LOS SERVIDORES DE GOOGLE (CDN)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";



/*====================================================================
            MOVIMIENTO DE LOS POST-IT
  ====================================================================
*/

var postIt = document.getElementById("postIt");
var btnCrear = document.getElementById("btn-crear");
var offsetX, offsetY;


/*==================================================
            CUANDO EMPIEZO A PULSAR
  ==================================================
*/




postIt.addEventListener("touchstart",(e)=>{
    e.preventDefault();

    offsetX = e.touches[0].clientX - postIt.offsetLeft;
    offsetY = e.touches[0].clientY - postIt.offsetTop;


});


/*==================================================
              CUANDO ESTOY PULSANDO
  ==================================================
*/



btnCrear.addEventListener("touchmove", (e)=>{
    let toque = e.touches[0];

    btnCrear.style.top = `${toque.clientY-offsetY}px`;
    btnCrear.style.left = `${toque.clientX-offsetX}px`;
});







