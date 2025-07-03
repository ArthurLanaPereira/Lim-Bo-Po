/*objeto de objetos*/
const state = {
    score: {
        playerScore: 0,
        computerScore: 0,
        scoreBox: document.getElementById("score_points"),
    },
    bestRun: {
        bestRunBox: document.getElementById("best_run"),
    },
    cardSprites: {
        avatar: document.getElementById("card-image"),
        name: document.getElementById("card-name"),
        type: document.getElementById("card-type"),
    },
    fieldCards: {
        player: document.getElementById("player-field-card"),
        computer: document.getElementById("computer-field-card"),
    },
    playerSides: {
        player1BOX: document.querySelector("#player-cards"),
        computerBOX: document.querySelector("#computer-cards"),
    },
    actions: {
        button: document.getElementById("next-duel"),
    },
};

/*Configração do localStorage*/

class webstore {
    constructor(key, defaultValue) {
        this.key = key;
        this.defaultValue = defaultValue;
        const stored = localStorage.getItem(this.key);
        this.value = stored !== null ? JSON.parse(stored) : this.defaultValue;
    }

    get() {
        return this.value;
    }

    set(value) {
        this.value = value;
        localStorage.setItem(this.key, JSON.stringify(value));
    }
}


const melhorRun = new webstore('recorde_wins', 0); //inicialização da variável da melhor run no localStorage

const playerSides = {
    player1: "player-cards",
    computer: "computer-cards",
}

/* Enumeração das cartas */

const pathImages = "./src/assets/icons/"

const cardData = [
    {
        id: 0,
        name: "Lover",
        type: "Paper",
        img: `${pathImages}card-lover.png`,
        WinOf: [1],
        LoseOf: [2],
    },
    {
        id: 1,
        name: "Death",
        type: "Rock",
        img: `${pathImages}card-death.png`,
        WinOf: [2],
        LoseOf: [0],
    },
    {
        id: 2,
        name: "Hooked",
        type: "Scissors",
        img: `${pathImages}card-hooked.png`,
        WinOf: [0],
        LoseOf: [1],
    },
]

/*Atualização do melhor recorde*/
function atualizarRecorde(vitoriasAtuais) {
    const recordeAtual = melhorRun.get();

    if (vitoriasAtuais > recordeAtual) {
        melhorRun.set(vitoriasAtuais);
    }

    return;
}

async function getRandomCardId() {
    const randomIndex = Math.floor(Math.random() * cardData.length);
    return cardData[randomIndex].id;
}

async function createCardImage(IdCard, fieldSide) {
    const cardImage = document.createElement("img");
    cardImage.classList.add("card", "card-img");
    cardImage.setAttribute("src", "./src/assets/icons/card-back.png");
    cardImage.setAttribute("data-id", IdCard);
    cardImage.classList.add("card");

    if (fieldSide === playerSides.player1) {
        cardImage.addEventListener("click", () => {
            setCardsField(cardImage.getAttribute("data-id"));
        });

        cardImage.addEventListener("mouseover", () => {
            drawSelectCard(IdCard);
        })
    }
    return cardImage;
}

async function setCardsField(cardID) {
    /* Remove todas as cartas antes */
    await removeAllCardsImages();

    let computerCardId = await getRandomCardId();

    await showHiddenCardFieldsImages(true);

    await hiddenCardDetails();

    await drawCardsInField(cardID, computerCardId)

    let duelResults = await checkDuelResults(cardID, computerCardId);

    await updateScore();

    await updatebestRun();

    await drawButton(duelResults);
}

async function drawCardsInField(cardID, computerCardId) {
    state.fieldCards.player.src = cardData[cardID].img;
    state.fieldCards.computer.src = cardData[computerCardId].img;
}

async function showHiddenCardFieldsImages(value) {
    if (value == true) {
        state.fieldCards.player.style.display = "block";
        state.fieldCards.computer.style.display = "block";
    }

    if (value == false) {
        state.fieldCards.player.style.display = "none";
        state.fieldCards.computer.style.display = "none";
    }
}

async function hiddenCardDetails() {
    state.cardSprites.avatar.src = "";
    state.cardSprites.name.innerText = "";
    state.cardSprites.type.innerText = "";

}

async function drawButton(text) {
    state.actions.button.innerText = text;
    state.actions.button.style.display = "block";
}

async function updateScore() {
    state.score.scoreBox.innerText = `Win: ${state.score.playerScore} | Lose: ${state.score.computerScore}`;
}

async function updatebestRun() {
    state.bestRun.bestRunBox.innerText = `Best score: ${melhorRun.get()}`;
}

async function checkDuelResults(playerCardId, ComputerCardId) {
    let duelResults = "DRAW"
    let playerCard = cardData[playerCardId];

    /* Se na condição vence de, da minha carta tiver o id da carta que ele vence dá vitória */
    if (playerCard.WinOf.includes(ComputerCardId)) {
        duelResults = "WIN"
        await playAudio(duelResults);
        state.score.playerScore++;
        atualizarRecorde(state.score.playerScore);
        console.log();
    }

    if (playerCard.LoseOf.includes(ComputerCardId)) {
        duelResults = "LOSE"
        await playAudio(duelResults);
        state.score.computerScore++;
    }

    return duelResults;
}

async function removeAllCardsImages() {
    let { computerBOX, player1BOX } = state.playerSides;
    let imgElements = computerBOX.querySelectorAll("img");
    imgElements.forEach((img) => img.remove());
    /* Pega a imagem das cartas*/
    imgElements = player1BOX.querySelectorAll("img");
    /* Remove a carta */
    imgElements.forEach((img) => img.remove());
}

async function drawSelectCard(index) {
    state.cardSprites.avatar.src = cardData[index].img;
    state.cardSprites.name.innerText = cardData[index].name;
    state.cardSprites.type.innerText = "Attribute : " + cardData[index].type;
}

async function drawCards(cardNumbers, fieldSide) {
    const fragment = document.createDocumentFragment();

    for (let i = 0; i < cardNumbers; i++) {
        const randomIdCard = await getRandomCardId();
        const cardImage = await createCardImage(randomIdCard, fieldSide);
        fragment.appendChild(cardImage);
    }

    document.getElementById(fieldSide).appendChild(fragment);
}

async function resetDuel() {
    state.cardSprites.avatar.src = "";
    state.actions.button.style.display = "none";

    state.fieldCards.player.style.display = "none";
    state.fieldCards.computer.style.display = "none";

    init();
}

async function playAudio(status) {
    const audio = new Audio(`./src/assets/audios/${status}.wav`);
    audio.play();
}

function init() {

    updatebestRun();

    showHiddenCardFieldsImages(false);

    drawCards(5, playerSides.player1);
    drawCards(5, playerSides.computer);

    const bgm = document.getElementById("bgm");
    bgm.play();
}

init();