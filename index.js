require('dotenv').config();
const fs = require('fs');
const path = require('path');
const SteamUser = require('steam-user');

const client = new SteamUser();

const username = process.env.STEAM_USERNAME;
const password = process.env.STEAM_PASSWORD;
const gameId = parseInt(process.env.STEAM_GAME_ID, 10);
const allowedProfile = process.env.STEAM_ALLOWED_PROFILE;

let gameTimer;
const gameInterval = 3 * 60 * 60 * 1000; // 3 saatlik süreyi milisaniye olarak ayarla

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
    
    // Mesajları log dosyasına yaz
    logMessage(steamID.getSteamID64(), message);

    if (steamID.getSteamID64() === allowedProfile) {
        if (message.toLowerCase() === 'start') {
            console.log('Oyun başlatılıyor...');
            startGame(client);
        } else if (message.toLowerCase() === 'stop') {
            console.log('Oyun durduruluyor...');
            stopGame(client);
        } else {
            console.log(`Bilinmeyen komut: ${message}`);
        }
    } else {
        console.log('Bu komut izin verilen profil dışında bir kullanıcıdan geldi, işlem yapılmadı.');
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

    clearTimeout(gameTimer);
    gameTimer = setTimeout(() => {
        console.log('3 saat doldu, oyun durduruluyor ve yeniden başlatılıyor...');
        stopGame(client);
        startGame(client);
    }, gameInterval);
}

// Oyun durdurma fonksiyonu
const stopGame = (client) => {
    console.log('CS:GO durduruluyor...');
    client.gamesPlayed([]); // Oyun durdur
    client.setPersona(SteamUser.EPersonaState.Online);
    clearTimeout(gameTimer);
}

// Mesajları günlük dosyalara log tutma fonksiyonu
const logMessage = (steamID, message) => {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD formatında tarih al
    const logFileName = `${today}.txt`; // Günlük dosya ismi
    const logFilePath = path.join(__dirname, 'logs', logFileName); // logs klasöründe dosyayı sakla

    const logMessage = `[${new Date().toLocaleTimeString()}] (${steamID}): ${message}\n`;

    // Dosyaya mesajı yaz
    fs.appendFile(logFilePath, logMessage, (err) => {
        if (err) {
            console.error('Mesaj loglanırken bir hata oluştu:', err);
        } else {
            console.log('Mesaj log dosyasına kaydedildi.');
        }
    });
}

// logs klasörünün var olup olmadığını kontrol et, yoksa oluştur
if (!fs.existsSync(path.join(__dirname, 'logs'))) {
    fs.mkdirSync(path.join(__dirname, 'logs'));
}