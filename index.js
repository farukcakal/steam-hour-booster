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

    client.setPersona(SteamUser.EPersonaState.Online); // Çevrimiçi ol
    console.log('Çevrimiçi durumuna geçildi.');
});

client.on('friendMessage', (steamID, message) => {
    console.log(`Gelen mesaj (${steamID}): ${message}`);

    // Mesajı kontrol et ve komutları uygula
    if (message.toLowerCase() === 'start') {
        console.log('Oyun başlatılıyor...');
        startGame(client);
    } else if (message.toLowerCase() === 'stop') {
        console.log('Oyun durduruluyor...');
        stopGame(client);
    } else {
        console.log(`Bilinmeyen komut: ${message}`);
    }
});

client.on('error', (err) => {
    console.error('Hata: ', err);
});

// Oyun başlatma fonksiyonu
const startGame = (client) => {
    console.log('CS:GO başlatılıyor...');
    client.gamesPlayed([gameId]); // Oyun başlat
    client.setPersona(SteamUser.EPersonaState.Online); // Çevrimiçi durumu koru
}

// Oyun durdurma fonksiyonu
const stopGame = (client) => {
    console.log('CS:GO durduruluyor...');
    client.gamesPlayed([]); // Oyun durdur
    client.setPersona(SteamUser.EPersonaState.Online); // Hala çevrimiçi ol
}