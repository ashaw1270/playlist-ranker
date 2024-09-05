const songs = [];

async function rank() {
    document.getElementById('grid').style.display = 'grid';

    let sorted = [];
    for (let i = 0; i < songs.length; i++) {
        const song1 = songs[i];
        if (!songs.length) {
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
    displayRankedSongs(sorted);
}

function compareSongs(song1, song2) {
    return new Promise(resolve => {
        const song1Element = document.getElementById('song1');
        const song2Element = document.getElementById('song2');

        song1Element.querySelector('.song-title').innerHTML = song1;
        song2Element.querySelector('.song-title').innerHTML = song2;

        function choose1() {
            resolve(1);
            removeListeners();
        }

        function choose2() {
            resolve(2);
            removeListeners();
        }

        function removeListeners() {
            song1Element.removeEventListener('click', choose1);
            song2Element.removeEventListener('click', choose2);
        }

        song1Element.addEventListener('click', choose1);
        song2Element.addEventListener('click', choose2);
    });
}

function displayRankedSongs(ranked) {
    document.getElementById('song1').remove();
    document.getElementById('song2').remove();

    const gridElement = document.getElementById('grid');
    
    for (let song of ranked) {
        const songElement = document.createElement('div');
        songElement.classList.add('song');
        songElement.innerHTML = song;
        gridElement.appendChild(songElement);
    }
}

function readSong() {
    const songElement = document.getElementById('song-input');
    const song = songElement.value;
    if (song) {
        songs.push(song);
        songElement.value = '';
    }
}

function enterSongs() {
    document.addEventListener('keydown', event => {
        if (event.key === 'Enter') {
            readSong();
        }
    });

    const songElement = document.getElementById('song-input');
    const enterSong = document.getElementById('enter-song');
    const done = document.getElementById('done');

    enterSong.addEventListener('click', readSong);

    done.addEventListener('click', () => {
        readSong();
        songElement.style.display = 'none';
        enterSong.style.display = 'none';
        done.style.display = 'none';
        rank();
    });
}

enterSongs();