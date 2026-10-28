// DATA
let default_pattern = {
    "print_date": "2026-10-26",
    "categories": [
        {
            "title": "RESPONSES TO \"HOW ARE YOU?\"",
            "cards": [
                {
                    "content": "CHILLING",
                    "position": 2
                },
                {
                    "content": "MANAGING",
                    "position": 10
                },
                {
                    "content": "NOT BAD",
                    "position": 15
                },
                {
                    "content": "SAME OLD",
                    "position": 12
                }
            ]
        },
        {
            "title": "KINDS OF MATS",
            "cards": [
                {
                    "content": "PRAYER",
                    "position": 7
                },
                {
                    "content": "WELCOME",
                    "position": 0
                },
                {
                    "content": "WRESTLING",
                    "position": 11
                },
                {
                    "content": "YOGA",
                    "position": 4
                }
            ]
        },
        {
            "title": "AKC DOG BREED GROUPS",
            "cards": [
                {
                    "content": "HERDING",
                    "position": 14
                },
                {
                    "content": "HOUND",
                    "position": 9
                },
                {
                    "content": "SPORTING",
                    "position": 6
                },
                {
                    "content": "TOY",
                    "position": 3
                }
            ]
        },
        {
            "title": "HORROR MOVIES WITH LAST LETTER CHANGED",
            "cards": [
                {
                    "content": "HALLOWEEK",
                    "position": 1
                },
                {
                    "content": "HOSTED",
                    "position": 13
                },
                {
                    "content": "JAWN",
                    "position": 5
                },
                {
                    "content": "PSYCHS",
                    "position": 8
                }
            ]
        }
    ]
}

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
    if (selectedDate) {
        const url = `https://www.nytimes.com/svc/connections/v2/${selectedDate}.json`;
        const response = await fetch(`https://proxy.cors.dev/${encodeURIComponent(url)}`);
        data = await response.json();
    }
    else {
        data = default_pattern;
    }
    current_data = data;
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