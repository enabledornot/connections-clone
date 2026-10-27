const date = document.querySelector(".date");

setInterval(() => {
    date.textContent = new Date().toLocaleString();
}, 1000);

const gameDate = document.querySelector("#selectDate");
gameDate.value = new Date().toLocaleDateString("en-CA");
gameDate.addEventListener("change", updateBoard);
async function updateBoard() {
    const selectedDate = gameDate.value;
    if (!selectedDate) {
        return;
    }
    const url = `https://www.nytimes.com/svc/connections/v2/${selectedDate}.json`;
    const response = await fetch(`https://proxy.cors.dev/${encodeURIComponent(url)}`);
    const data = await response.json();
    for (const category of data.categories) {
        for (const card of category.cards) {
            const label = document.querySelector(`label[for='word${card.position}']`);
            label.textContent = card.content;
        }
    }
}

const form = document.querySelector("form");
const submit = form.querySelector("button[type=submit]");


form.addEventListener("submit", (event) => {
    event.preventDefault();

    const selected = form.querySelectorAll("input[type=checkbox]:checked");

    console.log(`Submitted: ${selected.length} entries`);
    if(selected.length !== 4) {
        alert(`Submitted ${selected.length} entries rather than 4`);
    }
});

function updateSubmit() {
    const count = form.querySelectorAll("input[type=checkbox]:checked").length;
    submit.disabled = count !== 4;
}

form.addEventListener("change", updateSubmit);

const grid = form.querySelector(".connectionsGrid");

document.querySelector("#shuffle").addEventListener("click", () => {
    const tiles = [];
    for (const tile of grid.children) {
        tiles.push(tile);
    }
    for (let i = tiles.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const tmp = tiles[i];
        tiles[i] = tiles[j];
        tiles[j] = tmp;
    }
    for (let i = 0; i < tiles.length; i++) {
        grid.appendChild(tiles[i]);
    }
});

document.querySelector("#deselect").addEventListener("click", () => {
    checked = form.querySelectorAll(".connectionsGrid input");
    for(let i = 0; i < checked.length; i++) {
        checked[i].checked = false;
    }
    updateSubmit();
});


updateBoard();