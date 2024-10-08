require('dotenv').config();
const SteamUser = require('steam-user');

const client = new SteamUser();

const username = process.env.STEAM_USERNAME;
const password = process.env.STEAM_PASSWORD;
const gameId = process.env.STEAM_GAME_ID;

client.logOn({
    accountName: username,
    password: password
});

client.on('loggedOn', () => {
    console.log('Giriş yapıldı!');
    
    startGame(client);
});

client.on('chatMessage', (steamID, message) => {
    console.log(`Gelen mesaj (${steamID}): ${message}`);

    // Mesajı kontrol et
    if (message.toLowerCase() === 'start') {
        console.log('Oyun başlatılıyor...');
        startGame()
    } else if (message.toLowerCase() === 'stop') {
        console.log('Oyun durduruluyor...');
        stopGame()
    }
});

client.on('newSession', (sessionID) => {
    console.log('Steam Guard kodu girin:');
    process.stdin.once('data', (data) => {
        const steamGuardCode = data.toString().trim();
        client.logOn({
            accountName: username,
            password: password,
            twoFactorCode: steamGuardCode
        });
    });
});

client.on('error', (err) => {
    console.error('Hata: ', err);
});

const startGame = (client) => {
    client.playingState = {
        blocked: false,
        appid: [gameId]
    }

    client.setPersona(SteamUser.EPersonaState.Online)

    client.gamesPlayed([gameId]);
}

const stopGame = (client) => {
    client.playingState = {
        blocked: false,
        appid: []
    }

    client.setPersona(SteamUser.EPersonaState.Offline)

    client.gamesPlayed([]);
}