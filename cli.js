const http = require('http')
const prompt = require('prompt-sync')({ sigint: true })
const { loadUser, signInWithLink, loginWithEmailAndLink } = require('./firebaseClient')

let emailToLogin = null
let isVerificationLinkReceived = false

const showIntro = () => {
    const text = "Welcome to Unity CLI."
        + "\n\nSupported Commands are:"
        + "\n1. login  - Log in to Unity."
        + "\n2. start  - Start Unity services to manage clipboard after logging in."
        + "\n3. stop   - Stop Unity services to stop managing clipboard."
        + "\n4. list   - Take a peek at the unity clipboard history."
        + "\n4. select - Select any item from list to clipboard."
        + "\n5. help   - See supported commands."
    console.log(text)
}

const sendLinkForLoginAndWait = email => {
    signInWithLink(email)
        .then(() => {
            console.log('Link sent, login request will timeout in 5 minutes.')
            emailToLogin = email
            setTimeout(() => {
                if (!isVerificationLinkReceived) {
                    console.log('It has been 5 minutes, timing out.')
                    terminate()
                }
            }, 5 * 60 * 1000)
        })
        .catch(error => {
            console.log('Could not send link for email verification.', error.message)
            terminate()
        })
}

const verifyLoggedIn = () => {
    return new Promise((resolve, reject) => {
        loadUser()
            .then(user => {
                resolve(user)
            })
            .catch(error => {
                console.log(error.message)
                reject(error)
            })
    })
}

const server = http.createServer((request, response) => {
    const url = request.url
    if (url.startsWith('/signin')) {
        // send response that link was received, process it later
        response.writeHead(200, { 'Content-Type': 'text/html' });
        response.write('Email authentication link received.');
        response.end();

        const fullUrl = `${request.headers.host}${url}`

        console.log('Login link received, attempting sign in.')

        // avoid timing out
        isVerificationLinkReceived = true

        loginWithEmailAndLink(emailToLogin, fullUrl)
            .then(credentials => {
                console.log(`Login successfull with email ${emailToLogin}.`)
                terminate()
            })
            .catch(error => {
                console.log('Login failed.', error.message)
                terminate()
            })
    }
    else {
        response.writeHead(200, { 'Content-Type': 'text/html' });
        response.write('Invalid request to Unity server.');
        response.end();
    }
})

const startServer = (port) => {
    return new Promise((resolve, reject) => {
        server.listen(port)
            .on('listening', listener => {
                resolve(listener)
            })
            .on('error', error => {
                reject(error)
            })
    })
}

const terminate = () => {
    server.close()
    process.exit(0)
}

startServer(1627)
    .then(_listener => {
        if (process.argv.length > 2) {
            const arg1 = process.argv[2]
            const command = arg1.toLowerCase()
            switch (command) {
                case 'login':

                    const email = prompt('Enter an email: ')
                    sendLinkForLoginAndWait(email)

                    break;
                case 'list':

                    verifyLoggedIn()
                        .then(user => {

                        })
                        .catch(error => {
                            console.log('Cannot start clipboard management without loggin in.')
                        })
                        .finally(() => {
                            terminate()
                        })

                    break;
                case 'select':

                    verifyLoggedIn()
                        .then(user => {

                        })
                        .catch(error => {
                            console.log('Cannot start clipboard management without loggin in.')
                        })
                        .finally(() => {
                            terminate()
                        })

                    break;
                case 'start':

                    verifyLoggedIn()
                        .then(user => {

                        })
                        .catch(error => {
                            console.log('Cannot start clipboard management without loggin in.')
                        })
                        .finally(() => {
                            terminate()
                        })

                    break;
                case 'stop':

                    // stop clipboard management services
                    terminate()

                    break;
                case 'help':

                    showIntro()
                    terminate()

                    break;
                default:
                    console.error('Invalid command.')
                    showIntro()
                    terminate()
                    break;
            }
        }
        else {
            showIntro()
            terminate()
        }
    })
    .catch(error => {
        if (error.code === 'EADDRINUSE') {
            console.log('Another Unity shell alredy active. Please close that session or resuse.')
        }
        else {
            console.log('Some error occured.')
        }
    })

setTimeout(() => {

    console.log('\n\nTiming out this session.')
    terminate()

}, 10 * 60 * 1000)