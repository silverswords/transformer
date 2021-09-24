const fetch = require("node-fetch")

async function post(data, url) {
    try {
        const response = await fetch(url, {
            body: JSON.stringify(data),
            method: "POST",
            headers: {
                'Content-Type': 'application/json;charset=utf-8',
            }
        })

        console.log(response.statusText)
    } catch (err) {
        console.log(err.message)
    }
}

module.exports = {
    post
}