let win = false;
let turnnumber = 0;
let userInput;
let abletorecieve = true;
let shortlistarr = [];
let longlistarr = [];
let solution = [];

function reset() {
  win = false;
  turnnumber = 0;
  userInput = '';
  abletorecieve = true;
  shortlistarr = [];
  longlistarr = [];
  solution = [];
  
  for (let i = 0; i < 6; i++) {
      for (let k = 1; k < 6; k++) {
          let square = document.getElementById(`square${i}${k}`);
          square.classList.remove('green', 'yellow', 'grey');
          square.textContent = '';
      }
  }
}

async function fetchData() {
    try {
        const shortlistResponse = await fetch('https://raw.githubusercontent.com/a-stannis/clonewordle/main/wordle%20short%20list.json');
        if (!shortlistResponse.ok) {
            throw new Error(`Shortlist file not found or server error: ${shortlistResponse.statusText}`);
        }
        const shortlistData = await shortlistResponse.json();
        shortlistarr = shortlistData.map(item => item.word);

        const longlistResponse = await fetch('https://raw.githubusercontent.com/a-stannis/clonewordle/main/wordle%20short%20list.json');
        if (!longlistResponse.ok) {
            throw new Error(`Longlist file not found or server error: ${longlistResponse.statusText}`);
        }
        const longlistData = await longlistResponse.json();
        longlistarr = longlistData.map(item => item.word);

        game(); // Start the game after data is fetched
    } catch (error) {
        console.error('There was a problem with the fetch operation:', error);
        alert('Failed to load game data. Please check your connection or try again later.');
    }
}


function selectRandomWord() {
    if (shortlistarr.length > 0) {
        const randomIndex = Math.floor(Math.random() * shortlistarr.length);
        return shortlistarr[randomIndex];
    }
    return null;
}

function game() {
    const randomWord = selectRandomWord();
    if (randomWord) {
        solution = randomWord.split(''); // Ensure solution is an array
    } else {
        console.error('No solution found.');
        return;
    }

    document.getElementById('submitGuess').addEventListener('click', function() {
        if (abletorecieve) {
            recieve();
            if (turnnumber < 6 && !win) {
                turn();
            }
        }
    });

    document.getElementById('guessInput').addEventListener('keydown', function(event) {
        if (event.key === 'Enter') {
            document.getElementById('submitGuess').click();
        }
    });
}

function recieve() {
    userInput = document.getElementById('guessInput').value.toLowerCase();
    abletorecieve = false;
}

function turn() {
    document.getElementById('guessInput').value = '';
    if (userInput.length !== 5) {
        console.log("Invalid length. Try again.");
        abletorecieve = true;
        return;
    } else if (!longlistarr.includes(userInput)) {
        console.log("Invalid word. Try again.");
        abletorecieve = true;
        return;
    }

    turnnumber++;
    let guessResult = [];
    let solutionCopy = [...solution]; // Create a copy of the solution for processing

    for (let i = 0; i < 5; i++) {
        let square = document.getElementById(`square${turnnumber - 1}${i + 1}`);
        if (userInput[i] === solution[i]) {
            guessResult.push("V");
            square.textContent = userInput[i];
            square.classList.add('green');  // Green for correct letter and position
            solutionCopy[i] = null; // Mark this letter as matched
        } else {
            guessResult.push(null); // Placeholder for second pass
        }
    }

    // Second pass: Check for correct letters in wrong positions
    for (let i = 0; i < 5; i++) {
        if (guessResult[i] === null) { // Only process non-correct letters
            let square = document.getElementById(`square${turnnumber - 1}${i + 1}`);
            if (solutionCopy.includes(userInput[i])) {
                guessResult[i] = "+";
                square.classList.add('yellow');  // Yellow for correct letter, wrong position
                solutionCopy[solutionCopy.indexOf(userInput[i])] = null; // Remove matched letter from the copy
            } else {
                guessResult[i] = "X";
                square.classList.add('grey');   // Grey for incorrect letter
            }
            square.textContent = userInput[i];
        }
    }

    let correctCount = guessResult.filter(letter => letter === "V").length;
    if (correctCount === 5) {
        changeText("Good job!");
        showPopup();
        win = true;
    } else if (turnnumber === 6 && !win) {
        changeText("The word was " + solution.join(''));
        showPopup();
    }

    abletorecieve = true;
}

// Popup functions
const popup = document.getElementById('popup');
const closePopupButton = document.getElementById('closePopup');

function showPopup() {
    popup.style.display = 'block';
    reset();
    fetchData();
}

function hidePopup() {
    popup.style.display = 'none';
}

closePopupButton.addEventListener('click', hidePopup);
window.addEventListener('click', (event) => {
    if (event.target === popup) {
      console.log("done");
        hidePopup();
        
    }
});

function changeText(newContent) {
    document.getElementById('popuptext').innerHTML = newContent;
}



fetchData();
