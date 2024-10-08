const tilstandsdefinisjoner= {
    OK: {
        led: 'green',
        button: 'off',
        tekst: 'Status for røykvarsler: OK<br>Linje 2<br>Linje 3<br>Linje 4',
    },
    UTLØST: {
        led: 'red',
        button: 'red',
        nedtelling: 120,
        tilstandEtterNedtelling: 'TILKALT',
        tekst: 'Røykvarsler utløst<br>' +
            'Alarm til brannsentral om <span id="nedtelling"></span><br>' +
            'Trykk på knappen for å avbryte',
    },
    SLUMRET: {
        led: 'yellow',
        button: 'yellow',
        nedtelling: 300,
        tilstandEtterNedtelling: 'TILKALT',
        tekst: 'Vennligst luft ut<br>' +
            'Trykk så på knappen for å reaktivere<br>' +
            'Alarm reaktiveres om <span id="nedtelling"></span>',
    },
    TILKALT: {
        led: 'red',
        button: 'off',
        tekst: 'Varsel er sendt til brannsentral<br>' +
            'Venter på utrykning',
    },
    NULLSTILT: {
        led: 'green',
        button: 'green',
        nedtelling: 5,
        tilstandEtterNedtelling: 'OK',
        tekst: 'Ingen røyk registrert<br>' +
            'Alarm avbrutt <img id="hakemerke" src="assets/checkmark.gif" alt="">',
    },

}

let nåværendeTilstand = 'OK';
const utløsAlarmEtter = 5;  // i sekunder
const nedtellingsekunder = 300;

let nedtelling;

function settTilstand(tilstand) {

    //console.log(`Tilstand endret til ${tilstand} etter)

    nåværendeTilstand = tilstand;
    const definisjon = tilstandsdefinisjoner[tilstand];
    $('#knapp-bilde').attr('src', `assets/button_${definisjon.button}.png`);
    $('#led-bilde').attr('src', `assets/LED_${definisjon.led}.png`);
    $('#display').html(definisjon.tekst);

    clearTimeout(nedtelling);

    if (definisjon.nedtelling) {
        let sekunder = definisjon.nedtelling;
        const oppdaterDisplay = () => {
            $('#nedtelling').text(
                Math.floor(sekunder / 60) + ':' +
                ('' + Math.floor(sekunder % 60)).padStart(2, '0'));
            --sekunder;
            if (!sekunder) {
                clearTimeout(nedtelling);
                settTilstand(definisjon.tilstandEtterNedtelling);
            }
        }
        nedtelling = setInterval(oppdaterDisplay, 1000);
        oppdaterDisplay();
    }
}

function trykkKnapp() {
    switch (nåværendeTilstand) {
        case 'OK': {
            settTilstand('UTLØST');
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

const innlastingstid = Date.now();

$(document).ready(() => {
    settTilstand('OK');
    setTimeout(() => settTilstand('UTLØST'), utløsAlarmEtter * 1000)
})