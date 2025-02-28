const tilstander = {
    OK: {
        led: 'green',
        knapp: 'off',
        tekst:
            'Status for røykvarsler: OK',
    },
    UTLØST: {
        led: 'red',
        knapp: 'red',
        blinkende: true,
        lyd: '1_advarsel_loop.wav',
        gjentaLyd: true,
        nedtelling: 120,
        tilstandEtterNedtelling: 'TILKALT',
        tekst:
            'Røykvarsler utløst<br>' +
            'Alarm til brannsentral om <span id="nedtelling"></span><br>' +
            'Trykk på knappen for å avbryte',
    },
    SLUMRET: {
        led: 'yellow',
        knapp: 'yellow',
        blinkende: true,
        lyd: '2_alarm_kvittert_loop.wav',
        gjentaLyd: true,
        nedtelling: 300,
        tilstandEtterNedtelling: 'TILKALT',
        tekst:
            'Vennligst luft ut<br>' +
            'Trykk så på knappen for å reaktivere<br>' +
            'Alarm reaktiveres om <span id="nedtelling"></span>',
    },
    TILKALT: {
        led: 'red',
        knapp: 'off',
        lyd: '4_utløpt_tid_loop.wav',
        gjentaLyd: true,
        tekst:
            'Varsel er sendt til brannsentral<br>' +
            'Venter på utrykning',
    },
    NULLSTILT: {
        led: 'green',
        knapp: 'green',
        lyd: '5_røyken_er_borte.wav',
        nedtelling: 7,
        tilstandEtterNedtelling: 'OK',
        tekst:
            'Ingen røyk registrert<br>' +
            'Alarm avbrutt <img id="hakemerke" src="assets/checkmark.gif" alt="">',
    },

}

const utløsAlarmEtter = 5;  // i sekunder
const blinkHastighet = 750; // i millisekunder

let nåværendeTilstand;
let forrigeTid = Date.now();
let nedtelling;
let blinkIntervall;

function settTilstand(nyTilstand) {

    console.log(`Tilstand endret til ${nyTilstand} etter ${Date.now() - forrigeTid} ms fra forrige registrerte tid`);
    forrigeTid = Date.now();

    nåværendeTilstand = nyTilstand;
    const tilstand = tilstander[nyTilstand];

    // Logikk for blinkende knapp og LED-lys, for de tilstandene som har dette.
    // Variabelen alternativ holder styr på om elementene skal blinke av eller på, og toggles fortløpende.
    let alternativ = false;
    const byttGrafikk = () => {
        if (!alternativ) {
            $('#knapp-bilde').attr('src', `assets/button_${tilstand.knapp}.png`);
            $('#led-bilde').attr('src', `assets/LED_${tilstand.led}.png`);
        } else {
            $('#knapp-bilde').attr('src', `assets/button_off.png`);
            $('#led-bilde').attr('src', ``);
        }
        alternativ = !alternativ;
    }

    // Stopp eventuell blinking fra forrige tilstand.
    clearInterval(blinkIntervall);

    // Hvis gjeldende tilstand skal være blinkende, kaller vi byttGrafikk() kontinuerlig.
    if (tilstand.blinkende) {
        blinkIntervall = setInterval(byttGrafikk, blinkHastighet);
    }

    // Uavhengig av om vi er i en blinkende tilstand, kaller vi byttGrafikk() én gang for å
    // oppdatere til riktig grafikk for tilstanden vi bytter til.
    byttGrafikk();
    $('#display').html(tilstand.tekst);

    // Spill av riktig lyd for tilstanden gjennom statisk lydelement på siden.
    $('#lyd').attr('src', `audio/${tilstand.lyd}`);
    if (tilstand.gjentaLyd)
        $('#lyd').prop('loop', true);
    else
        $('#lyd').removeProp('loop');
    $('#lyd')[0].play();

    // Stopp eventuell nedtelling fra forrige tilstand.
    clearInterval(nedtelling);

    // Hvis tilstanden skal inneholde en nedtelling i displayet, lager vi et intervall som endrer teksten
    // på riktig sted i displayet fortløpende. Forutsetter at teksten inneholder en span med ID-en "nedtelling".
    if (tilstand.nedtelling) {
        let sekunder = tilstand.nedtelling;
        const oppdaterDisplay = () => {
            if (sekunder < 0) {
                clearInterval(nedtelling); // Egentlig overflødig siden settTilstand uansett stopper nedtellingen
                settTilstand(tilstand.tilstandEtterNedtelling);
            }
            $('#nedtelling').text(
                Math.floor(sekunder / 60) + ':' +
                (sekunder % 60).toString().padStart(2, '0')); // Formater gjenstående tid på formen m:ss
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
            // Dette er ikke en del av den faktiske funksjonaliteten, men bare en lettvint måte
            // å starte brukertesten på. Alarmen går 5 sekunder etter at knappen er trykket.
            clearTimeout(nedtelling);
            nedtelling = setTimeout(() => settTilstand('UTLØST'), utløsAlarmEtter * 1000);
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