function doGet() {
    return HtmlService.createHtmlOutputFromFile("Main.html");
}

function getQBReaderQuestion(keywords, difficultiesArray, categoriesArray) {
    let searchType;
    let exactPhrase;
    let keyword;
    if (keywords.length == 0) {
        keyword = "";
        searchType = "all";
        exactPhrase = false;
    } else {
        if (keywords[keywords.length - 1] != "&r") {
            keyword = keywords[Math.floor(Math.random() * (keywords.length))];
        } else {
            let rando = Math.random();
            if (rando >= 0.5) {
                keyword = keywords[keywords.length - 2];
            } else {
                keyword = keywords[Math.floor(Math.random() * (keywords.length - 2))];
            }
        }
        if (keyword.substring(0, 1) == "*") {
            keyword = keyword.substring(1, keyword.length);
            searchType = "answer";
            exactPhrase = true;
        } else if (keyword.substring(0, 1) == "?") {
            keyword = keyword.substring(1, keyword.length);
            searchType = "question";
            exactPhrase = true;
        } else {
            searchType = "all";
            exactPhrase = true;
        }
    }
    let difficulties = "";
    for (let i = 0; i < difficultiesArray.length; i++) {
        difficulties += difficultiesArray[i];
        difficulties += ",";
    }
    difficulties = difficulties.substring(0, difficulties.length - 1);
    let categories = "";
    for (let i = 0; i < categoriesArray.length; i++) {
        categories += categoriesArray[i];
        categories += ",";
    }
    categories = categories.substring(0, categories.length - 1);

    const url = `https://qbreader.org/api/query?queryString=${keyword}&questionType=tossup&searchType=${searchType}&exactPhrase=${exactPhrase}&ignoreWordOrder=true&randomize=true&difficulties=${difficulties}&categories=${categories}&minYear=2016&maxReturnLength=1`;

    var response = UrlFetchApp.fetch(url);
    var jsonResponse = JSON.parse(response.getContentText());
    return jsonResponse;
}

function normalizedLevenshtein(a, b) {
    if (!/ /.test(a) && / /.test(b)) {
        let minVal = Infinity;
        let newB = b.split(/ /);
        let actB;
        for (let i = 0; i < newB.length; i++) {
            let dist = normalizedLevenshtein(a, newB[i]);
            if (dist < minVal) {
                minVal = dist;
                actB = newB[i];
            }
        }
        const average = (a.length + actB.length) / 2;
        return minVal / average;
    }
    const matrix = [];

    for (let i = 0; i <= a.length; i++) {
        matrix[i] = [i];
    }
    for (let j = 0; j <= b.length; j++) {
        matrix[0][j] = j;
    }

    for (let i = 1; i <= a.length; i++) {
        for (let j = 1; j <= b.length; j++) {
            const cost = a[i - 1] === b[j - 1] ? 0 : 1;

            matrix[i][j] = Math.min(
                matrix[i - 1][j] + 1,     // deletion
                matrix[i][j - 1] + 1,     // insertion
                matrix[i - 1][j - 1] + cost  // substitution
            );
        }
    }

    const error = matrix[a.length][b.length];
    const average = (a.length + b.length) / 2;
    return error / average;
}
