const { app, BrowserWindow, Notification, globalShortcut, Menu, MenuItem, session, screen, ipcMain, Tray, BrowserView } = require('electron');
const fs = require('fs');

const _setting = require('./json/setting.json');

class App {
    constructor(props) {

        // Tray
        this.TrayMenu = null
        this.OpenWindow = false
        this.Window = null;
        this.View = null;

    }

    loadSetting(data) {
        return fs.writeFile('./json/setting.json', JSON.stringify(data), { encoding: 'utf-8' }, err => {
            if (err) return console.log(err);
            console.log(`Updated Setting...`);
        })
    }

    openWindow() {

        if (this.OpenWindow === true) return

        this.Window = new BrowserWindow({
            title: 'MiniBrowser',
            ..._setting.bounds,
            minWidth: 720,
            minHeight: 540,
            frame: false,
            webPreferences: {
                nodeIntegration: true,
                contextIsolation: false,
                enableRemoteModule: true
            }
        });

        this.openView()

        if (_setting.bounds.x === 0 && _setting.bounds.y === 0) this.Window.center()

        this.ipcSend = this.Window.webContents

        this.Window.loadFile(`./public/header.html`)
        // this.Window.center()

        let bounds = () => { return { x: 0, y: 24, width: this.Window.getBounds().width, height: this.Window.getBounds().height - 24 } }

        this.View.setBounds(bounds())
        this.View.webContents.loadFile('./public/main.html')

        this.Window.addBrowserView(this.View)

        this.OpenWindow = true

        this.Window.on('resize', () => {
            _setting.bounds = this.Window.getBounds();
            this.loadSetting(_setting);
            this.View.setBounds(bounds());
        })

        this.Window.on('move', (event, t) => {
            _setting.bounds = this.Window.getBounds();
            this.loadSetting(_setting);
        })

        this.Window.on('close', () => {
            this.OpenWindow = false
        })

    }

    openView() {
        this.View = new BrowserView({
            webPreferences: {
                nodeIntegration: true,
                contextIsolation: false,
                enableRemoteModule: true
            }
        });

        this.View.webContents.on('did-create-window', (window, details) => {
            window.close();
            this.openURL(details.url);
            this.ipcSend.send('ipcOn:setImage', details.url)
        })

        this.View.webContents.on('will-navigate', (event, url) => {
            this.openURL(url);
        })

        const ctxMenu = Menu.buildFromTemplate([
            {
                label: 'Dev Tools',
                click: () => this.View.webContents.openDevTools()
            }
        ]);

        this.View.webContents.on('context-menu', (e, params) => {
            ctxMenu.popup(this.View, params.x, params.y)
        })
    }

    openURL(url) {
        this.View.webContents.loadURL(url)
        _setting.history.push({ url, date: Date.now() })
        this.loadSetting(_setting);
    }

    Events(data) {
        const _data = data.data;
        switch(data.type) {
            case "closeWindow":
                this.Window.close()
                break;
            case "minimizeWindow":
                this.Window.minimize()
                break;
            case "pinWindow":
                this.Window.setAlwaysOnTop(!this.Window.isAlwaysOnTop(), 'screen-saver')
                break;

            case "openURL":
                this.openURL(_data.url)
                this.ipcSend.send('ipcOn:setImage', _data.url)
                break;

            case "backPage":
                this.View.webContents.goBack();
                break;
            case "forwardPage":
                this.View.webContents.goForward();
                break;
            case "reloadPage":
                this.View.webContents.reload();
                break;

            case "openMainMenu":
                this.View.webContents.loadFile('./public/main.html')
                break;

            case "getHistory":
                this.View.webContents.send('loadHistory', _setting.history)
                break;
        }
    }

    onStart() {

        ipcMain.on('ipcOn', (event, data) => this.Events(data))

        app.on('ready', () => {
            this.openWindow()
            console.log("Start: Mini Browser");
        });

    }

}

new App().onStart()