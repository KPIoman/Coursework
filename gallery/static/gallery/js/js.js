let images = Array.from(document.querySelectorAll("#content .column img"));
let currentIndex = 0;

function openModal(img) {
  currentIndex = images.indexOf(img);
  let modalImg = document.getElementById("img01");
  modalImg.src = img.src;
  let modal = document.getElementById("myModal");
  modal.style.opacity = 0;
  modal.style.display = "flex";
  document.getElementById('image-container').style.marginTop = document.getElementsByTagName('header')[0].clientHeight + 'px'
  fadeIn(modal);
}

function closeModal(event) {
    let modal = document.getElementById("myModal");
    fadeOut(modal);
}

function nextImage(event) {
  event.stopPropagation();
  currentIndex = (currentIndex + 1) % images.length;
  let modalImg = document.getElementById("img01");
  modalImg.src = images[currentIndex].src;
}

function prevImage(event) {
  event.stopPropagation();
  currentIndex = (currentIndex - 1 + images.length) % images.length;
  let modalImg = document.getElementById("img01");
  modalImg.src = images[currentIndex].src;
}

function fadeIn(element) {
  let op = 0.1;  // initial opacity
  let timer = setInterval(function () {
    if (op >= 1){
      clearInterval(timer);
    }
    element.style.opacity = op;
    op += op * 0.1;
  }, 10);
}

function fadeOut(element) {
  let op = 1;  // initial opacity
  let timer = setInterval(function () {
    if (op <= 0.1){
      clearInterval(timer);
      element.style.display = 'none';
    }
    element.style.opacity = op;
    op -= op * 0.1;
  }, 10);
}
