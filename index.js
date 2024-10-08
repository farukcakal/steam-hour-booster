require('dotenv').config();
const SteamUser = require('steam-user');

const client = new SteamUser();

const username = process.env.STEAM_USERNAME;
const password = process.env.STEAM_PASSWORD;
const gameId = parseInt(process.env.STEAM_GAME_ID, 10); // App ID'yi tamsayıya çevir

client.logOn({
    accountName: username,
    password: password
});

client.on('loggedOn', () => {
    console.log('Giriş yapıldı!');
    
    startGame(client); // Oyun başlat
});

client.on('chatMessage', (steamID, message) => {
    console.log(`Gelen mesaj (${steamID}): ${message}`);

    // Mesajı kontrol et
    if (message.toLowerCase() === 'start') {
        console.log('Oyun başlatılıyor...');
        startGame(client);
    } else if (message.toLowerCase() === 'stop') {
        console.log('Oyun durduruluyor...');
        stopGame(client);
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
    client.setPersona(SteamUser.EPersonaState.Online); // Çevrimiçi durumu ayarla

    // Oyun bilgilerini ayarla
    client.gamesPlayed([gameId]); // Oyun oynamaya başla
}

const stopGame = (client) => {
    client.setPersona(SteamUser.EPersonaState.Offline); // Çevrimdışı durumu ayarla
    client.gamesPlayed([]); // Oyun oynamayı durdur
}