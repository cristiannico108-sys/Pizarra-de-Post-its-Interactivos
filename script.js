var postIt = document.getElementById("postIt");
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

postIt.addEventListener("touchmove", (e)=>{
    let toque = e.touches[0];

    postIt.style.top = `${toque.clientY-offsetY}px`;
    postIt.style.left = `${toque.clientX-offsetX}px`;
});

/*==================================================
                AL SOLTAR
  ==================================================
*/


/*
postIt.addEventListener("touchend",(e)=>{
    e.preventDefault();

    

});
*/




