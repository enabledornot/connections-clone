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


const app = express();
const PORT = process.env.PORT || 3000;





// This serves public as public to make deployment easier
app.use(express.static(path.join(__dirname, 'public')));

app.use(express.json());
app.get('/api/fetch_board', async (req, res) => {
    const { date } = req.query;
    let pattern;
    if (!date) {
        pattern = default_pattern;
    }
    else if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        return res.status(400).json({"error": "invalid date format. Use YYYY-MM-DD"});
    }
    else {
        req_url = `https://www.nytimes.com/svc/connections/v2/${date}.json`;
        try {
            const response = await fetch(req_url);
            if (response.status === 404) {
                return res.status(404).json({"error": `no board found for ${date}`});
            }
            pattern = await response.json();
        }
        catch (err) {
            console.log(`request error for ${req_url}`);
            return res.status(502).json({"error": "cannot fetch from NYT"});
        }

    }
    return res.json(pattern);

});


app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
