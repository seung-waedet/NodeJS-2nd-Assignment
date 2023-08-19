const http = require('http');
const fs = require('fs');

const port = 3000;

const requestHandler = (req, res) => {
    if (req.url === '/') {
        const file = fs.readFileSync('./index.html')
        res.setHeader('content-type', 'text/html')
        res.writeHead(200)
        res.write(file)
        res.end()
    }

    if (req.url.endsWith('.html') && req.method === 'GET') {

        try {
            const splitUrl = req.url.split('/')
            const filename = splitUrl[1]
            const fileLocation = `./${filename}`

            const file = fs.readFileSync(fileLocation)
            res.setHeader('content-type', 'text/html')
            res.writeHead(200)
            res.write(file)
            res.end()
        }

        catch (error) {
            console.error("Error:", error);
            const file = fs.readFileSync('./404.html');
            res.setHeader('content-type', 'text/html');
            res.writeHead(404); // Use 404 status code for not found
            res.write(file);
            res.end();
        }
    }

}

const server = http.createServer(requestHandler)

server.listen(port, () => {
    console.log(`Listening on port: ${port}`)
})


