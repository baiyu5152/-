const{app,BrowserWindow,ipcMain,dialog} = require('electron')
//自动更新
// const autoUpdater = require("electron-updater").autoUpdater
// autoUpdater.setFeedURL('http://localhost:8899/')//设置检测更新地址（参数为 软件所在位置）
// autoUpdater.checkForUpdates() //检测是否有新版本,如果有新版本则自动下载；
// autoUpdater.on('update-downloaded', function () { //下载完成后执行 quitAndInstall
//     autoUpdater.quitAndInstall();  //关闭软件并安装新版本
// })

const DataStroe = require('./common/MusicDataStore')
const myStroe = new DataStroe({'name':'Music Data'})
//打印文件所属路径
//console.log(app.getPath('userData'))

class AppWindow extends BrowserWindow{
    constructor(config, fileLocation){
        const baseWindows = {
            width:800,
            height:600,
            webPreferences:{
                nodeIntegration:true
            }
        }
        //const finalConfig = Object.assign(config,baseWindows)
        const finalConfig = { ...baseWindows, ...config}      
        super(finalConfig)
        this.loadFile(fileLocation)
        this.on('ready-to-show',()=>{
            this.show()
        })
    }

}

app.on('ready',()=>{
    const mainWindows = new AppWindow({},'./view/index.html')
    mainWindows.webContents.on('did-finish-load',() => {
        mainWindows.send('import-music-index-file', myStroe.getTracks())
    })

    ipcMain.on('addMusicQk',(event,arg)=>{
        const addWindows = new AppWindow({
            width:500,
            height:400,
            parent:mainWindows
        },"./view/add.html")  
        ipcMain.on('import-music-file',(event, files) => { 
            addWindows.destroy()
        })
    })
    ipcMain.on('import-music-file',(event, files) => { 
        if (Array.isArray(files)) {
            const updateStroe = myStroe.addTracks(files).getTracks()
            mainWindows.send('import-music-index-file', updateStroe)
        }        
    })
    ipcMain.on('delete-track',(event, deleteId) => {
        const updateStroe = myStroe.deleteTracks(deleteId).getTracks()
        mainWindows.send('import-music-index-file', updateStroe)
    })
    ipcMain.on('select-music-file',(event,arg) => {
        dialog.showOpenDialog({ 
            properties: ['openFile', 'multiSelections'],
            filters:[{name: 'Music', extensions: ['mp3']}]
        }).then(result => {
            event.sender.send('selected-file',result)
        }).catch(err => {
            console.log(err)
        })
    })
    
})
