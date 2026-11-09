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


/*====================================================================
            CREACIÓN VISUAL DEL POST-IT
  ==================================================================== */
btnGuardar.addEventListener("click", function() {
    let texto = document.getElementById("input-texto").value;
    let color = document.getElementById("input-color").value;

    if (texto.trim() === "") {
        alert("Escribe algo antes de guardar.");
        return;
    }

    var nuevaNota = document.createElement("div");
    nuevaNota.className = "post-it";
    nuevaNota.style.backgroundColor = color;
    
    nuevaNota.style.left = "50px"; 
    nuevaNota.style.top = "100px";

    var parrafo = document.createElement("p");
    parrafo.innerText = texto;

    nuevaNota.appendChild(parrafo);
    pizarra.appendChild(nuevaNota);

    // Activamos la función de arrastrar en la nueva nota recién creada
    hacerArrastrable(nuevaNota);

    modalEdicion.style.display = "none";
});