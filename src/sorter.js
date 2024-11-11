let music;
let musicUserToken;

let developerToken;

async function getDevToken() {
    const response = await fetch('/dev_token');
    const data = await response.json();
    return data.dev_token;
}

document.addEventListener('musickitloaded', async () => {
    developerToken = await getDevToken();

    try {
        await MusicKit.configure({
            developerToken,
            app: {
                name: 'Playlist Ranker',
                build: '1.0.0',
            }
        });
    } catch (err) {
        console.log(err);
    }

    music = MusicKit.getInstance();
    try {
        musicUserToken = await music.authorize();
    } catch (error) {
        console.log(error);
    }

    //const playlist = await getPlaylist('Activities');
    //const playlist2 = await getPlaylist('Nu-disco');
    //const songs = await getSongs(playlist);
    //const ranked = await rank(songs);
    //document.getElementById('grid').style.display = 'none';
    //const rankedPlaylist = await createPlaylist('Ranked Nu-disco', ranked);
    //verifyPlaylist(ranked, rankedPlaylist.relationships.tracks.data);
    //document.getElementById('grid').style.display = 'grid';
    choosePlaylist();
    //const song1Element = document.getElementById('song1');
    //song1Element.src = embedPlaylist(playlist.attributes.playParams.globalId);
    //const song2Element = document.getElementById('song2');
    //song2Element.src = embedPlaylist(playlist2.attributes.playParams.globalId);
    //console.log(playlist);
});

async function getPlaylist(playlistName) {
    let playlistID;

    try {
        const response = await music.api.library.playlists({ limit: 100 });
        for (const playlist of response) {
            if (playlist.attributes.name === playlistName) {
                playlistID = playlist.id;
                break;
            }
        }
    } catch (error) {
        console.log(error);
    }

    if (playlistID) {
        try {
            return await music.api.library.playlist(playlistID);
        } catch (error) {
            console.log(error);
        }
    }

    return null;
}

async function choosePlaylist() {
    const playlistsElement = document.getElementById('playlists');
    playlistsElement.style.display = 'block';

    const playlists = await music.api.library.playlists();
    for (const pl of playlists) {
        const playlist = await music.api.library.playlist(pl.id);
        if (playlist.attributes.artwork) {
            const playlistElement = document.createElement('div');
            const cover = document.createElement('img');
            cover.src = playlist.attributes.artwork.url;
            playlistElement.appendChild(cover);
            playlistsElement.appendChild(playlistElement);
        }
    }
}

async function getSongs(playlist) {
    let songs = [];
    for (const playlistSong of playlist.relationships.tracks.data) {
        try {
            const playParams = playlistSong.attributes.playParams;
            const id = playParams.catalogId || playParams.purchasedId || playParams.reportingId;
            const song = await music.api.song(id);
            songs.push(song);
        } catch (error) {
            console.log(playlistSong, error);
        }
    }
    return songs;
}

async function createPlaylist(name, songs) {
    const response = await fetch('https://api.music.apple.com/v1/me/library/playlists', {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${developerToken}`,
            'Music-User-Token': musicUserToken
        },
        body: JSON.stringify({
            attributes: {
                name
            }
        })
    });
    const data = await response.json();
    const playlistID = data.data[0].id;

    await fetch(`https://api.music.apple.com/v1/me/library/playlists/${playlistID}/tracks`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${developerToken}`,
            'Music-User-Token': musicUserToken
        },
        body: JSON.stringify({
            data: songs.map(song => ({
                id: song.id,
                type: 'songs'
            }))
        })
    });
    
    return await music.api.library.playlist(playlistID);
}

async function verifyPlaylist(songs, playlist) {
    let i = 0, j = 0;
    while (i < songs.length) {
        if (songs[i].id !== playlist[j].id) {
            console.log(`${songs[i].attributes.playParams.catalogId} is missing`);
        } else {
            j++;
        }
        i++;
    }
}

/*async function embedSong(songNum, song) {
    const catalogID = song.attributes.playParams.catalogId;
    let albumID, songID;
    try {
        const song = await music.api.song(catalogID);
        albumID = song.relationships.albums.data[0].id;
        songID = song.id;
    } catch (error) {
        console.log(error);
    }
    const countryCode = music.storefrontId || 'us';
    const embedURL = `https://embed.music.apple.com/${countryCode}/album/${albumID}?i=${songID}&itscg=30200&itsct=music_box_player&app=music&theme=auto`;
    const songElement = document.getElementById(`song${songNum}`);
    songElement.src = embedURL;
    songElement.style.display = 'flex';
}*/

async function rank(songs) {
    document.getElementById('grid').style.display = 'grid';

    let sorted = [];
    for (let i = 0; i < songs.length; i++) {
        const song1 = songs[i];
        if (!sorted.length) {
            sorted.push(song1);
        } else {
            let low = 0, high = sorted.length - 1;
            while (low <= high) {
                let mid = Math.floor((low + high) / 2);
                const choice = await compareSongs(song1, sorted[mid]);
                if (!choice) {
                    return;
                }
                if (choice == 1) {
                    high = mid - 1;
                } else {
                    low = mid + 1;
                }
            }
            if (low === sorted.length) {
                sorted.push(song1);
            } else {
                sorted.splice(low, 0, song1);
            }
        }
    }
    
    return sorted;
}

async function compareSongs(song1, song2) {
    return new Promise(resolve => {
        document.getElementById('grid').style.display = 'grid';

        const song1Element = document.getElementById('song1');
        const song2Element = document.getElementById('song2');

        song1Element.src = embedSong(song1.id);
        song2Element.src = embedSong(song2.id);

        const choose1Element = document.getElementById('choose-1');
        const choose2Element = document.getElementById('choose-2');

        choose1Element.innerText = song1.attributes.name;
        choose2Element.innerText = song2.attributes.name;

        function choose1() {
            resolve(1);
            removeListeners();
        }

        function choose2() {
            resolve(2);
            removeListeners();
        }

        function removeListeners() {
            choose1Element.removeEventListener('click', choose1);
            choose2Element.removeEventListener('click', choose2);
        }

        choose1Element.addEventListener('click', choose1);
        choose2Element.addEventListener('click', choose2);
    });
}

const embedSong = id => `https://embed.music.apple.com/us/song/${id}`;
const embedPlaylist = id => `https://embed.music.apple.com/us/playlist/${id}`;
