const http = require('http');
const fs = require('fs/promises');
const path = require('path')

const port = 3000;


const inventory = [];
// path
const textFilePath = path.join(__dirname, 'inventory.json')

// read function
const readFileFunc = async () => {
    try {
        const data = await fs.readFile(textFilePath, "utf-8")
        console.log(data)

        return JSON.parse(data)

    } catch (error) {
        console.log(error)
    }
}


// write function
const writeFileFunc = async (content) => {
    try {
        const data = await fs.writeFile(textFilePath, JSON.stringify(content))
        console.log(data)
    } catch (error) {
        console.log(error)
    }

}


const handleResponse = (req, res) => ({ code = 200, error = null, data = null }) => {
    res.setHeader('content-type', 'application/json')
    res.writeHead(code)
    res.write(JSON.stringify({ data, error }))
    res.end()
}

const bodyParser = (req, res, callback) => {
    const body = [];

    req.on('data', (chunk) => {
        body.push(chunk)
    })

    req.on('end', () => {
        if (body.length) {
            const parsedBody = Buffer.concat(body).toString()
            req.body = JSON.parse(parsedBody);
        }

        callback(req, res)
    })
}

const handleRequest = (req, res) => {
    const response = handleResponse(req, res)

    if (req.url === '/inventory' && req.method === 'POST') {


        readFileFunc().then((inventoryList) => {
            inventoryList.push(req.body)

            writeFileFunc(inventoryList).then(() => {

                return response({ data: inventoryList, code: 200 })
            })

        })

    }


    if (req.url.startsWith('/inventory/') && req.method === 'GET') {
        const id = req.url.split('/')[2]; // Extract the ID from the URL
        console.log(id)

        const item = inventory.find((item) => item.id === parseInt(id)); // Find the item by ID
        console.log(item)

        if (!item) { // Check if item with given ID exists
            return response({ code: 404, error: 'item not found' }); // Return a 404 response
        }

        return response({ data: item, code: 200 }); // Return the found item
    }


    if (req.url.startsWith('/inventory') && req.method === 'GET') {

        readFileFunc().then((res) => {
            return response({ data: res, code: 200 })
        })

    }


    if (req.url.startsWith('/inventory/') && req.method === 'PATCH') {


        const id = req.url.split('/')[2]

        console.log(id)

        const itemIndex = inventory.findIndex((item) => item.id === parseInt(id));

        console.log(itemIndex)

        if (itemIndex === -1) {
            return response({ code: 404, error: 'Item not found' })
        }

        const item = { ...inventory[itemIndex], ...req.body }

        return response({ data: item, code: 200 })
    }


    if (req.url.startsWith('/inventory/') && req.method === 'DELETE') {
        const id = req.url.split('/')[2]


        readFileFunc().then((inventoryList) => {

            const newInventoryList = inventoryList.filter(item => item?.id !== parseInt(id))

            writeFileFunc(newInventoryList).then(() => {

            })
            return response({ data: newInventoryList, code: 200 })
        })

    }
}

const server = http.createServer((req, res) => bodyParser(req, res, handleRequest))

server.listen(port, () => {
    console.log(`Listening on port: ${port}`)
})