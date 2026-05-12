const progressBar = document.getElementById("progressBar");
const percentText = document.getElementById("percent");

let progress = 0;

const interval = setInterval(() => {

    progress++;

    progressBar.style.width = progress + "%";
    percentText.innerText = progress + "%";

    if(progress >= 100){

        clearInterval(interval);

        window.location.href = "./dashboard.html";

    }

}, 25);