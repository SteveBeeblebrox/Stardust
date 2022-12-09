const $ = document.querySelector.bind(document);
function save() {
    const stardustServer = $('#stardustServer').value;
    chrome.storage.sync.set({
        stardustServer: stardustServer
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
        stardustServer: 'https://stevebeeblebrox.github.io/stardust_temp',
    }, function(data) {
        $('#stardustServer').value = data.stardustServer;
    });
}

document.addEventListener('DOMContentLoaded', load);
$('button').addEventListener('click', save);