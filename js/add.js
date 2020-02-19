const{ipcRenderer} = require('electron')
const{$} =  require('../common/common')
const path = require('path')
//监听添加音乐按钮
$('selectMusicBtn').addEventListener('click',()=>{
    ipcRenderer.send('select-music-file')
})
const i = 0
//构造列表显示

const renderListHTML = (pathes) => {
    const musicList = $('musicList')
    const musicItemsHtml = pathes.reduce((html, music, index) => {
        html +=  '<li class="list-group-item">'+path.basename(music)+'</>'
        return html
    }, '')
   
    musicList.innerHTML = '<ul class="list-group list-group-flush">'+musicItemsHtml+'</ul>'
}
//主进程回调方法
let renderList = []
ipcRenderer.on('selected-file',(event, path)=>{
    if (Array.isArray(path.filePaths)) {
        renderListHTML(path.filePaths)
        renderList = path.filePaths
    }
})
$('importMusicBtn').addEventListener('click',(event)=>{
    if (Array.isArray(renderList)) {
        ipcRenderer.send('import-music-file', renderList)
    }
})