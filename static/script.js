const commandsArray = [
    ['turn on switch 1', 'Okay, Turning Switch 1 ON'],
    ['turn off switch 1', 'Okay, Turning Switch 1 OFF'],
    ['turn on switch 2', 'Okay, Turning Switch 2 ON'],
    ['turn off switch 2', 'Okay, Turning Switch 2 OFF'],
    ['turn on switch 3', 'Okay, Turning Switch 3 ON'],
    ['turn off switch 3', 'Okay, Turning Switch 3 OFF'],
    ['turn on switch 4', 'Okay, Turning Switch 4 ON'],
    ['turn off switch 4', 'Okay, Turning Switch 4 OFF'],
    ['turn on all switches', 'Okay, Turning All Switches ON'],
    ['turn off all switches', 'Okay, Turning All Switches OFF']
];

const numberWords = { 'one': '1', 'to': '2', 'three': '3', 'four': '4' };

const normalizeCommand = (cmd) => cmd.toLowerCase().replace(/\b(one|to|three|four)\b/g, (m) => numberWords[m]);

let selectedVoice;

const initVoice = () => {
    const voices = speechSynthesis.getVoices();
    selectedVoice = voices.find(voice => voice.lang === 'en-US') || voices[1];
};

const speakResponse = (response) => {
    const utterance = new SpeechSynthesisUtterance(response);
    utterance.voice = selectedVoice;
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    speechSynthesis.speak(utterance);
};

const sendCommand = (transcript) => {
    const cmd = commandsArray.find(pair => normalizeCommand(pair[0]) === transcript);
    if (cmd) {
        speakResponse(cmd[1]);
        response_back.innerText= cmd[1];
        fetch('/cmd_in', {
            method: 'POST',
            body: new URLSearchParams({ response: transcript })
        }).then(() => console.log("Command sent to ESP8266!"));
    } else {
        speakResponse("Sorry, I didn't get that!");
        response_back.innerText= "Sorry, I didn't get that!";
    }
};

const initRecognition = () => {
    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = 'en-US';
    recognition.continuous = true;
    recognition.interimResults = false;
    let state = false;

    mic_In.addEventListener('click', (e) => {
        e.preventDefault();
        state = !state;
        if (state) {
            recognition.start();
            listen_animation.style.display = 'flex';
            setTimeout(() => {
                recognition.stop();
                listen_animation.style.display = 'none';
            }, 5000);
        } else {
            recognition.stop();
            listen_animation.style.display = 'none';
        }
    });

    recognition.onresult = (event) => {
        const transcript = normalizeCommand(event.results[event.results.length - 1][0].transcript);
        sendCommand(transcript);
    };

    recognition.onerror = (event) => alert(`Speech recognition error: ${event.error}`);
};

const handleSubmit = (e) => {
    e.preventDefault();
    const transcript = normalizeCommand(textCommand.value);
    sendCommand(transcript);
    textCommand.value = '';
};

if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window && 'speechSynthesis' in window) {
    speechSynthesis.onvoiceschanged = initVoice;
    initVoice();

    initRecognition();

    send_btn.addEventListener('click', handleSubmit);
    textCommand.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') handleSubmit(e);
    });
} else {
    alert('Not supported in this browser!');
}
