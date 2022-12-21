declare var chrome;
const $ = document.querySelector.bind(document);
function save() {
    const stardustJSON = $('#stardustJSON').value;
    chrome.storage.sync.set({
        stardustJSON: stardustJSON
    }, function() {
        const status = $('#status');
        status.textContent = 'Options saved.';
        setTimeout(function() {
            status.textContent = '\u00a0';
        }, 1500);
    });
}

function load() {
    chrome.storage.sync.get({
        stardustJSON: 'https://stevebeeblebrox.github.io/stardust/stardust.json',
    }, function(data) {
        $('#stardustJSON').value = data.stardustJSON;
    });
}

document.addEventListener('DOMContentLoaded', load);
$('button').addEventListener('click', save);