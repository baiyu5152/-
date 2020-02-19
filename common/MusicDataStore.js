const Store = require('electron-store')
const uuidv4 = require('uuid/v4')
const path = require('path')

class DataStore extends Store {
    constructor(setting) {
        super(setting)
        this.tracks = this.get('tracks') || []
    }
    //保存
    saveTracks() {
        this.set('tracks', this.tracks)
        return this
    }
    //获取
    getTracks() {
        return this.get('tracks') || []
    }
    addTracks(tracks) {
        //重新组装对象
        const tracksWithPops = tracks.map(track => {
            return {
                id: uuidv4(),
                path: track,
                fileName: path.basename(track)
            }
        })
        .filter(track => {
            const currentTrackPath = this.getTracks().map(track => track.fileName)
            return currentTrackPath.indexOf(track.fileName) < 0
        })
        this.tracks = [...this.tracks, ...tracksWithPops]
        console.log(this.tracks)
        return this.saveTracks()
    }
    deleteTracks(deleteId) {
        this.tracks = this.getTracks().filter(track => track.id != deleteId)
        return this.saveTracks()
    }
}
module.exports = DataStore