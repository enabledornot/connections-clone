const date = document.querySelector(".date");

const id = setInterval(() => {
    date.textContent = new Date().toLocaleString();
}, 1000);