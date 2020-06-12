/* eslint-disable @typescript-eslint/no-var-requires, no-console */
const path       = require('path')
const express    = require('express')
const session    = require('express-session')
const bodyParser = require('body-parser')
const routes     = require('./api/routes')

const app  = express()
const port = 3000

// add middleware
app.use(session({ secret: 's3cR3t' }))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

// serving static file and @webauthn-lib/client lib
app.use(express.static('public'))
app.get('/lib/webauthn-client.js', (request, response) => {
  response.sendFile(path.resolve(__dirname, './node_modules/@webauthn-lib/client/dist/client.min.js'))
})

// add routes
app.use(routes)

// starting server
app.listen(port, '0.0.0.0', () => {
  console.log('Server starting at port', port)
})
