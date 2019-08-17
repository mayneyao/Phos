import React, { useReducer } from 'react';

const PhosPlayerContext = React.createContext();

const NOTION_BASE = "https://notion.so"

const initState = {

    // data
    data: {}, // 音乐数据 
    currentPlaySong: {}, // 当前播放的音乐
    currentPlaylist: [], // 不会被存储的当前播放列表
    playlistName: undefined, // 默认为空，显示全部


    // player
    url: '', // 
    volume: 1, // 0-1 音量 
    muted: false, // 
    playing: false, // 是否播放
    isReady: false, // 当前歌曲是否加载完毕，可以播放
    isBufferEnd: false, //当前播放的歌曲缓存是否结束

    shuffle: false,
    repeat: 'none', // ['none','one','list'] 不循环 | 单曲循环 | 列表循环

    // player state
    phosColor: "#38d4c9",
    playingState: {},
    openSettings: false, // 是否打开配置
    loading: true

}


// reducer

function phosReducer(state, action) {
    const { currentPlaySong, currentPlaylist } = state
    switch (action.type) {
        case 'loadData':
            return {
                ...state,
                data: action.payload.data
            }
        case 'play':
            if (state.currentPlaySong.title) {
                return {
                    ...state,
                    playing: !state.playing
                }
            } else {
                return state
            }
        case 'loading':
            return {
                ...state,
                loading: !state.loading
            }
        case 'playOneSong':
            if (action.payload.song.file) {
                // 当前播放列表名称
                const { playlistName } = state
                let _currentPlaylist = []
                let songsCanPlay = state.data.songs.rows.filter(song => !!song.file)
                if (!playlistName) {
                    // 全部歌曲列表 > 当前播放列表
                    _currentPlaylist = songsCanPlay
                } else {
                    // 点击的歌单 > 当前播放列表
                    _currentPlaylist = songsCanPlay.filter(song => song.playlist && song.playlist.includes(playlistName))
                }

                document.title = `${action.payload.song.title} - ${action.payload.song.artist.map(a => a.name).join(",")}`
                //
                return {
                    ...state,
                    currentPlaySong: action.payload.song,
                    url: `${NOTION_BASE}/signed/${encodeURIComponent(action.payload.song.file[0]).replace("s3.us-west", "s3-us-west")}`,
                    isReady: false,
                    playing: true,
                    isBufferEnd: false,
                    currentPlaylist: _currentPlaylist
                }
            } else {
                return state
            }

        case 'changeVolume':
            return {
                ...state,
                volume: action.payload.volume
            }
        case 'updatePlayingState':
            return {
                ...state,
                playingState: action.payload.playingState
            }
        case 'setVolume':
            return {
                ...state,
                volume: action.payload.volume
            }
        case 'setPlaylistName':
            return {
                ...state,
                playlistName: action.payload.playlistName
            }
        case 'setPlayerConfig':
            // 配置基础 player 参数
            return {
                ...state,
                [action.payload.name]: action.payload.value
            }
        case 'setRepeat':
            let repeatStateList = ['none', 'list', 'one']
            let newRepeatIndex = (repeatStateList.indexOf(state.repeat) + 1) % repeatStateList.length
            let repeat = repeatStateList[newRepeatIndex]
            return {
                ...state,
                repeat
            }
        case 'prev':
            //上一曲
            if (currentPlaySong.title) {
                let prevSongIndex
                if (currentPlaylist.findIndex(i => i.title === currentPlaySong.title) === 0) {
                    prevSongIndex = currentPlaylist.length - 1
                } else {
                    prevSongIndex = (currentPlaylist.findIndex(i => i.title === currentPlaySong.title) - 1) % currentPlaylist.length
                }
                let prevSong = currentPlaylist[prevSongIndex]
                document.title = `${prevSong.title} - ${prevSong.artist.map(a => a.name).join(",")}`
                return {
                    ...state,
                    currentPlaySong: prevSong,
                    url: `${NOTION_BASE}/signed/${encodeURIComponent(prevSong.file[0]).replace("s3.us-west", "s3-us-west")}`,
                }
            } else {
                return state
            }
        case 'next':
            //下一曲
            if (currentPlaySong.title) {
                let nextSongIndex = (currentPlaylist.findIndex(s => s.title === currentPlaySong.title) + 1) % currentPlaylist.length
                let nextSong = currentPlaylist[nextSongIndex]
                document.title = `${nextSong.title} - ${nextSong.artist.map(a => a.name).join(",")}`
                // fixme
                return {
                    ...state,
                    currentPlaySong: nextSong,
                    url: `${NOTION_BASE}/signed/${encodeURIComponent(nextSong.file[0]).replace("s3.us-west", "s3-us-west")}`,
                }
            } else {
                return state
            }
    }
}


const PhosPlayerProvider = (props) => {
    const [state, dispatch] = useReducer(phosReducer, initState);

    return (
        <PhosPlayerContext.Provider value={{ state, dispatch }}>
            {props.children}
        </PhosPlayerContext.Provider>
    );
}

export { PhosPlayerContext, PhosPlayerProvider };