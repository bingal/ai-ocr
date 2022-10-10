// Modules to control application life and create native browser window
const { app, BrowserWindow } = require('electron')
const remote = require("@electron/remote/main")
remote.initialize()
// const url = require('url')
const path = require('path')

function createWindow() {
    // Create the browser window.
    const mainWindow = new BrowserWindow({
        minWidth: 800,
        minHeight: 500,
        width: 1200,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: true,
            contextIsolation: false
        },
        icon: path.join(__dirname, 'logo.ico')
    })
    if (process.platform === 'darwin') {
        app.dock.setIcon(path.join(__dirname, 'logo.png'));
    }

    // and load the index.html of the app.
    if (!app.isPackaged) {
        // mainWindow.loadURL('http://localhost:3000')
        mainWindow.loadFile(path.join(__dirname, 'build/index.html'))
    } else {
        mainWindow.loadFile(path.join(__dirname, 'build/index.html'))
    }
    
    // mainWindow.loadURL('http://localhost:3000/')
    // mainWindow.loadURL(url.format({
    //     pathname: path.join(__dirname, 'build/index.html'), 
    //     protocol: 'file:', 
    //     slashes: true
    // }))

    // Open the DevTools.
    if (!app.isPackaged) {
        mainWindow.webContents.openDevTools()
    }
    remote.enable(mainWindow.webContents)
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
    createWindow()

    app.on('activate', function () {
        // On macOS it's common to re-create a window in the app when the
        // dock icon is clicked and there are no other windows open.
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
    
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', function () {
    // if (process.platform !== 'darwin') app.quit()
    app.quit()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

let pyProc = null
let pyPort = null


const createPyProc = () => {
    // let script = path.join(__dirname, 'py-service', 'ocr_server.py')
    let script = path.join(__dirname, 'dist', 'ocr_server', 'ocr_server')
    if (app.isPackaged) {
        script = path.join(__dirname, 'ocr_server', 'ocr_server')
    }
    pyProc = require('child_process').spawn(script)
    if (pyProc != null) {
        console.log('child process success')
    }
    pyProc.stdout.on('data', (data) => {
        console.log(`stdout: ${data}`);
    });

    pyProc.stderr.on('data', (data) => {
        console.log(`stderr: ${data}`);
    });
}


const exitPyProc = () => {
    pyProc.kill()
    pyProc = null
    pyPort = null
}

app.on('ready', createPyProc)
app.on('will-quit', exitPyProc)