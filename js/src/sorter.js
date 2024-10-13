let music;

document.addEventListener('musickitloaded', async () => {
    try {
        await MusicKit.configure({
            developerToken: `eyJhbGciOiJFUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IjY4OUc3OFZMWFcifQ.eyJpYXQiOjE3MjgzNjE4NTksImV4cCI6MTc0MzkxMzg1OSwiaXNzIjoiSDhGUlk0MjM1MyJ9.mwSGlFxrrD35AeRHFNlJ-S9-MbD6hNP4dAMKX9k2X8euJmcAtk70L3tyRgCnyUvlx0FHtoAYsIEy9YnojJQOpA`,
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
        await music.authorize();
    } catch (error) {
        console.log(error);
    }

    const playlist = await getPlaylist('Bangers');
    const songs = await getSongs(playlist);
    const ranked = await rank(songs);
    document.getElementById('grid').style.display = 'none';
    console.log(ranked);
});

async function getPlaylist(playlistName) {
    let playlistID;

    try {
        const response = await music.api.library.playlists();
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

        song1Element.src = `https://embed.music.apple.com/us/song/${song1.id}`;
        song2Element.src = `https://embed.music.apple.com/us/song/${song2.id}`;

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
