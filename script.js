const tilstander= {
    OK: {
        led: 'green',
        button: 'off',
        tekst: 'Status for røykvarsler: OK',
    },
    UTLØST: {
        led: 'red',
        button: 'red',
        blinkende: true,
        lyd: '1_advarsel_loop.wav',
        gjentaLyd: true,
        nedtelling: 120,
        tilstandEtterNedtelling: 'TILKALT',
        tekst: 'Røykvarsler utløst<br>' +
            'Alarm til brannsentral om <span id="nedtelling"></span><br>' +
            'Trykk på knappen for å avbryte',
    },
    SLUMRET: {
        led: 'yellow',
        button: 'yellow',
        blinkende: true,
        lyd: '2_alarm_kvittert_loop.wav',
        gjentaLyd: true,
        nedtelling: 300,
        tilstandEtterNedtelling: 'TILKALT',
        tekst: 'Vennligst luft ut<br>' +
            'Trykk så på knappen for å reaktivere<br>' +
            'Alarm reaktiveres om <span id="nedtelling"></span>',
    },
    TILKALT: {
        led: 'red',
        button: 'off',
        lyd: '4_utløpt_tid_loop.wav',
        gjentaLyd: true,
        tekst: 'Varsel er sendt til brannsentral<br>' +
            'Venter på utrykning',
    },
    NULLSTILT: {
        led: 'green',
        button: 'green',
        lyd: '5_røyken_er_borte.wav',
        nedtelling: 7,
        tilstandEtterNedtelling: 'OK',
        tekst: 'Ingen røyk registrert<br>' +
            'Alarm avbrutt <img id="hakemerke" src="assets/checkmark.gif" alt="">',
    },

}

let nåværendeTilstand = 'OK';
const utløsAlarmEtter = 5;  // i sekunder
const blinkHastighet = 750; // i millisekunder
const innlastingstid = Date.now();
let forrigeTid = Date.now();
let nedtelling;

let blinkIntervall;


function settTilstand(nyTilstand) {

    console.log(`Tilstand endret til ${nyTilstand} etter ${Date.now() - forrigeTid} ms fra forrige registrerte tid`);
    forrigeTid = Date.now();

    nåværendeTilstand = nyTilstand;
    const tilstand = tilstander[nyTilstand];

    let alternativ = false;
    const byttGrafikk = () => {
        if (!alternativ) {
            $('#knapp-bilde').attr('src', `assets/button_${tilstand.button}.png`);
            $('#led-bilde').attr('src', `assets/LED_${tilstand.led}.png`);
        } else {
            $('#knapp-bilde').attr('src', `assets/button_off.png`);
            $('#led-bilde').attr('src', ``);
        }
        alternativ = !alternativ;
    }
    clearInterval(blinkIntervall);
    if (tilstand.blinkende) {
        blinkIntervall = setInterval(byttGrafikk, blinkHastighet);
    }
    byttGrafikk();
    $('#display').html(tilstand.tekst);

    $('#lyd').attr('src', `audio/${tilstand.lyd}`);
    if (tilstand.gjentaLyd)
        $('#lyd').prop('loop', true);
    else
        $('#lyd').removeProp('loop');
    $('#lyd')[0].play();

    clearInterval(nedtelling);

    if (tilstand.nedtelling) {
        let sekunder = tilstand.nedtelling;
        const oppdaterDisplay = () => {
            if (sekunder < 0) {
                clearInterval(nedtelling);
                settTilstand(tilstand.tilstandEtterNedtelling);
            }
            $('#nedtelling').text(
                Math.floor(sekunder / 60) + ':' +
                ('' + Math.floor(sekunder % 60)).padStart(2, '0'));
            --sekunder;
        }
        nedtelling = setInterval(oppdaterDisplay, 1000);
        oppdaterDisplay();
    }
}

function trykkKnapp() {
    console.log('Nåværende tilstand: ' + nåværendeTilstand + '. Bruker trykket på knappen.');
    switch (nåværendeTilstand) {
        case 'OK': {
            clearTimeout(nedtelling);
            nedtelling = setTimeout(() => {
                settTilstand('UTLØST');
                $('audio')[0].play();
            }, utløsAlarmEtter * 1000);
            break;
        }
        case 'UTLØST': {
            settTilstand('SLUMRET');
            break;
        }
        case 'SLUMRET': {
            settTilstand('NULLSTILT');
            break;
        }
        case 'NULLSTILT': {
            settTilstand('OK');
            break;
        }

    }
}

$(document).ready(() => {
    settTilstand('OK');
})