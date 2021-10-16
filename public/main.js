const { ipcRenderer, remote, shell, BrowserWindow, screen } = require('electron');

const isUrl = urlString => {
    return urlString.match(/^((http(s?)?):\/\/)?([wW]{3}\.)?[a-zA-Z0-9\-.]+\.[a-zA-Z]{2,}(\.[a-zA-Z]{2,})?$/g);
}

const getFavicon = domain => `https://www.google.com/s2/favicons?domain=${domain}`

// document.querySelector(".search").addEventListener("keyup", function(event) {
//     if (event.keyCode === 13) {
//         let url = event.target.value;
//         let _URL = isUrl(url) ? (url.indexOf("http://") === 0 || url.indexOf("https://") === 0) ? url : `https://${url}` : `https://yandex.ru/search/?text=${url}`;
//         ipcRenderer.send('ipcOn', {
//             type: 'openURL',
//             data: { url: _URL}
//         })
//         event.target.value = ''
//     }
// });

document.querySelector('.menu .back').addEventListener('click', () => ipcRenderer.send('ipcOn', { type: 'backPage' }))
document.querySelector('.menu .forward').addEventListener('click', () => ipcRenderer.send('ipcOn', { type: 'forwardPage' }))
document.querySelector('.menu .reload').addEventListener('click', () => ipcRenderer.send('ipcOn', { type: 'reloadPage' }))
document.querySelector('.menu .main').addEventListener('click', () => ipcRenderer.send('ipcOn', { type: 'openMainMenu' }))

document.querySelector('.window .pin').addEventListener('click', () => ipcRenderer.send('ipcOn', { type: 'pinWindow' }))
document.querySelector('.window .min').addEventListener('click', () => ipcRenderer.send('ipcOn', { type: 'minimizeWindow' }))
document.querySelector('.window .close').addEventListener('click', () => ipcRenderer.send('ipcOn', { type: 'closeWindow' }))


ipcRenderer.on('ipcOn:setImage', (event, url) => {
    let img = document.querySelector('.menu img')
    img.setAttribute('src', getFavicon(new URL(url).hostname))
    img.setAttribute('onclick', `ipcRenderer.send('ipcOn', { type: 'openURL', data: { url: '${new URL(url).origin}' } })`) // new URL(url).origin
})