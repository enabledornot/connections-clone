let current_data;
let guesses = 0;
const MAX_GUESSES = 4;
const date = document.querySelector(".date");

setInterval(() => {
    date.textContent = new Date().toLocaleString();
}, 1000);

const gameDate = document.querySelector("#selectDate");
// gameDate.value = new Date().toLocaleDateString("en-CA");
gameDate.addEventListener("change", updateBoard);

async function updateBoard() {
    resetGame();
    const selectedDate = gameDate.value;
    guesses = 0;
    let data;
    let url;
    if (selectedDate) {
        url = `/api/fetch_board?date=${encodeURIComponent(selectedDate)}`;
    }
    else {
        url = '/api/fetch_board';
    }
    try {
        const response = await fetch(url);
        if (response.status === 404) {
            console.log(response.json());
            return;
        }
        data = await response.json();
    }
    catch (err) {
        console.log(err);
        return;
    } 
    current_data = data;
    for (const category of data.categories) {
        for (const card of category.cards) {
            const label = document.querySelector(`label[for='word${card.position}']`);
            label.textContent = card.content;
        }
    }
    unShuffleBoard();
}

const form = document.querySelector("form");
const submit = form.querySelector("button[type=submit]");


form.addEventListener("submit", (event) => {
    event.preventDefault();

    const selectedCheckboxes = form.querySelectorAll("input[type=checkbox]:checked");

    console.log(`Submitted: ${selectedCheckboxes.length} entries`);
    if(selectedCheckboxes.length !== 4) {
        alert(`Submitted ${selectedCheckboxes.length} entries rather than 4`);
        return;
    }
    let selected = [];
    for(let child of selectedCheckboxes) {
        const label = form.querySelector(`label[for='${child.id}']`);
        selected.push(label.textContent.toUpperCase());
    }

    selected.sort();
    for(let group of current_data.categories) {
        let success = true;
        for(let i = 0; i < 4; i++) {
            if (group.cards[i].content !== selected[i]) {
                success = false;
                break;
            } 
        }
        if(success) {
            guessSuccess(group.title);
            return;
        }
    }
    guessFailure();
});

function guessSuccess(group) {
    alert(`guess ${group} success`);
}

function guessFailure() {
    console.log("guess failure");
    guesses += 1;
    if(guesses >= MAX_GUESSES) {
        alert("WRONG! Thank you for playing");
    }
    deselectAll();
    reRenderGuesses();
}

const guessDisplay = document.querySelector(".guessCounter");

function reRenderGuesses() {
    updateSubmit();
    const cells = guessDisplay.querySelectorAll("div");
    for(let i = 0; i < 4; i++) {
        if(i < guesses) {
            cells[i].setAttribute('selected','');
        }
        else {
            cells[i].removeAttribute('selected');
        }
    }
}

function updateSubmit() {
    const count = form.querySelectorAll("input[type=checkbox]:checked").length;
    submit.disabled = count !== 4 || guesses >= MAX_GUESSES;
}

form.addEventListener("change", updateSubmit);

const grid = form.querySelector(".connectionsGrid");

document.querySelector("#shuffle").addEventListener("click", shuffleBoard);
function shuffleBoard() {
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
}

function unShuffleBoard() {
    for (let i = 0; i < 16; i++) {
        const cellDiv = document.querySelector(`#word${i}`).parentElement;
        grid.appendChild(cellDiv);
    }
}

document.querySelector("#deselect").addEventListener("click", deselectAll);

function deselectAll() {
    checked = form.querySelectorAll(".connectionsGrid input");
    for(let i = 0; i < checked.length; i++) {
        checked[i].checked = false;
    }
    updateSubmit();
}


document.querySelector("#resetButton").addEventListener("click", resetGame)

function resetGame() {
    guesses = 0;
    reRenderGuesses();
    deselectAll();
}

updateBoard();