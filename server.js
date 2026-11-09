const express = require('express');
const path = require('path');

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

let patternsCache = {};

async function getBoard(date) {
    if (!date) {
        return default_pattern;
    }

    if (patternsCache[date]) {
        return patternsCache[date];
    }

    const requestUrl = `https://www.nytimes.com/svc/connections/v2/${date}.json`;
    const response = await fetch(requestUrl);
    if (response.status === 404) {
        const error = new Error(`no board found for ${date}`);
        error.status = 404;
        throw error;
    }
    if (!response.ok) {
        const error = new Error('cannot fetch from NYT');
        error.status = 502;
        throw error;
    }

    const pattern = await response.json();
    patternsCache[date] = pattern;
    return pattern;
}


const app = express();
const PORT = process.env.PORT || 3000;





// This serves public as public to make deployment easier
app.use(express.static(path.join(__dirname, 'public')));

app.use(express.json());
app.get('/api/fetch_board', async (req, res) => {
    const { date } = req.query;
    if (date && !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        return res.status(400).json({ error: 'invalid date format. Use YYYY-MM-DD' });
    }

    try {
        const pattern = await getBoard(date);
        return res.json(pattern);
    }
    catch (err) {
        console.log(`request error for ${date}`);
        return res.status(err.status || 502).json({ error: err.message || 'cannot fetch from NYT' });
    }

});

async function processGuess(date, guesses) {
    const board = await getBoard(date);
    for (let groupId = 0; groupId < board['categories'].length; groupId++) {
        const cat = board['categories'][groupId];
        let valid = true;
        for(card of cat['cards']) {
            if (!guesses.includes(card['position'])) {
                valid = false;
            }
        }
        if (valid) {
            return {"result": "success", "category": cat['title'], "groupId": groupId};
        }
    }
    return {"result": "failure"};
}

app.post('/api/submit_guess', async (req, res) => {
    const { date, guesses } = req.body;
    if (guesses.length !== 4) {
        return res.status(400).json({"error": "must be exactly 4 guesses"});
    }
    for(guess of guesses) {
        if (!Number.isInteger(guess)) {
            return res.status(400).json({"error": "guess not integer value"})
        }
    }
    return res.json(await processGuess(date, guesses));
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
