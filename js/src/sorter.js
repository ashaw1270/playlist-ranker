const songs = [];
let filename;

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('fileInput').addEventListener('change', event => {
        const file = event.target.files[0];
        filename = file.name;
    
        if (file) {
            const reader = new FileReader();
            
            reader.onload = e => {
                const fileContents = e.target.result;
                const lines = fileContents.split('\n');
                songs.push(...lines.slice(0, lines.length - 1));
                rank();
            };
            
            reader.onerror = () => console.error("Error reading file");
    
            reader.readAsText(file);
        }
    });
});

function downloadSongs(songs) {
    document.getElementById('song1').remove();
    document.getElementById('song2').remove();

    let text = "";
    for (const song of songs) {
        text += `${song}\n`;
    }

    const blob = new Blob([text], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${filename.slice(0, filename.length - 4)}Sorted.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

async function rank() {
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
    
    downloadSongs(sorted);
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
