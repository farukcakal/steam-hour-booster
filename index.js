require('dotenv').config();
const SteamUser = require('steam-user');

const client = new SteamUser();

const username = process.env.STEAM_USERNAME;
const password = process.env.STEAM_PASSWORD;
const gameId = process.env.STEAM_GAME_ID;

// Giriş yaparken beklenen Steam Guard kodunu al
client.logOn({
    accountName: username,
    password: password
});

// Oturum açma işlemi başarılı olduğunda
client.on('loggedOn', () => {
    console.log('Giriş yapıldı!');

    // Kullanıcıyı çevrimiçi olarak ayarlayın
    
    client.playingState = {
        blocked: false,
        appid: [gameId]
    }

    client.setPersona(SteamUser.EPersonaState.Online)

    // Oyun başlatma işlemi
    client.gamesPlayed([gameId]);
});

// Steam Guard doğrulama kodu gerekli olduğunda
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

// Hata durumu
client.on('error', (err) => {
    console.error('Hata: ', err);
});