const{ipcRenderer} = require('electron')
const{$, currentFmtTime} =  require('../common/common.js')
const path = require('path')

const AutoMusic = new Audio()
let AllMusic
let currentTrack

$('addMuscToQk').addEventListener('click',() => {
    ipcRenderer.send('addMusicQk')
})
//构造列表显示
//text-secondary颜色变浅、mr-2靠右两个像素、
const indexRenderListHTML = (tracks) => {
    const indexMusicList = $('indexMusicList')
    const indexMusicItemsHtml = tracks.reduce((html, music, index) => {
        html +=  '<li class="row music-track list-group-item d-flex justify-content-between align-items-center">'
        + '<div class="col-10"> '
        + '<i class="fas fa-music mr-2 text-secondary"></i><b>' + music.fileName +'</b>'
        + '</div>'
        + '<div class="col-2">'
        + '<i class="fas fa-play mr-5" data-id="'+ music.id+ '"></i>'
        + '<i class="fas fa-trash-alt" data-id="'+ music.id+ '"></i>'
        + '</div>'
        + '</li>'
        return html
    }, '')
    console.log(indexMusicItemsHtml)
    const emptyTrackHTML = '<div class="alert alert-primary">还没有添加任何音乐</div>'
    indexMusicList.innerHTML = tracks.length ? '<ul class="list-group list-group-flush ">'+indexMusicItemsHtml+'</ul>' : emptyTrackHTML
}
const renderPalyerHtml = (name, duration) => {
    const palyStatus = $('palyer-status')
    const html = '<div class="col font-weight-bold">'
        + '正在播放：' + name
        + '</div>'
        + '<div class="col">'
        + ' <span id="current-seeker">00:00</span>/' + currentFmtTime(duration)
        + '</div>'
    palyStatus.innerHTML = html
}

const updateProgressHTML = (currteTime, duration) => {
    //计算progress是当前要解决的问题
    const bar = $('progressBar')
    const progress = Math.floor(currteTime / duration * 100)
    bar.innerText = progress + "%"
    bar.style.width =  progress + "%"

    const seeker = $('current-seeker')
    seeker.innerHTML = currentFmtTime(currteTime)
}

//主进程回调方法
ipcRenderer.on('import-music-index-file',(event, path)=>{
    if (Array.isArray(path)) {
        indexRenderListHTML(path)
        AllMusic = path
    }
})

AutoMusic.addEventListener('loadedmetadata',() => {
//渲染播放器状态
renderPalyerHtml(currentTrack.fileName, AutoMusic.duration)
})

AutoMusic.addEventListener('timeupdate',() => {
//更新播放器状态
updateProgressHTML(AutoMusic.currentTime, AutoMusic.duration)
})


$('indexMusicList').addEventListener('click',(event) => {
    
    event.preventDefault()//取消一切默认型为
    const{ dataset, classList } = event.target
    const id = dataset && dataset.id 
    if (id && classList.contains('fa-play')) {   
        //这里播放音乐   
        if (currentTrack && currentTrack.id == id) {//判断是否已经有音乐正在播放
            AutoMusic.play()
        } else {
            currentTrack = AllMusic.find(track => track.id === id)//发现ID相同的
            AutoMusic.src = currentTrack.path
            AutoMusic.play()
            const resetIcoEle = document.querySelector('.fa-pause')
            if (resetIcoEle) {
                resetIcoEle.classList.replace('fa-pause', 'fa-play')
            }
        }
        classList.replace('fa-play', 'fa-pause')
    } else  if (id && classList.contains('fa-pause')) {
        //这里暂停音乐 
        classList.replace('fa-pause', 'fa-play')
        AutoMusic.pause()
    } else  if (id && classList.contains('fa-trash-alt')) {
        //这里删除音乐 
        ipcRenderer.send('delete-track', id)
    }
})