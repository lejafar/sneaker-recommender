const sneakerWrapper = document.querySelector(".sneaker-wrapper")

// selecteer onze kleur paden en stop ze in variabele
const colorAccentTop = document.querySelectorAll(".accent_top")
const colorAccentBottom = document.querySelectorAll(".accent_bottom")
const colorBaseFront = document.querySelectorAll(".base_front")
const colorBaseBack = document.querySelectorAll(".base_back")

window.localStorage.trainingData = window.localStorage.trainingData || JSON.stringify([])

// huidige kleuren

const currentColors = {
  accent_top: {},
  accent_bottom: {},
  base_front: {},
  base_back: {},
}

// genereer random kleur

function getRandomRgb() {
  return {
    r: Math.round(Math.random()*205 + 50), // nummer tussen 50 en 255
    g: Math.round(Math.random()*205 + 50),
    b: Math.round(Math.random()*205 + 50),
  }
}

// random sneaker
function generateRandomSneaker() {

  currentColors.accent_top = getRandomRgb()
  currentColors.accent_bottom = getRandomRgb()
  currentColors.base_front = getRandomRgb()
  currentColors.base_back = getRandomRgb()

  for (let color of colorAccentTop) {
    color.style.fill = `rgb(${currentColors.accent_top.r},${currentColors.accent_top.g},${currentColors.accent_top.b})`
  }
  for (let color of colorAccentBottom) {
    color.style.fill = `rgb(${currentColors.accent_bottom.r},${currentColors.accent_bottom.g},${currentColors.accent_bottom.b})`
  }
  for (let color of colorBaseFront) {
    color.style.fill = `rgb(${currentColors.base_front.r},${currentColors.base_front.g},${currentColors.base_front.b})`
  }
   for (let color of colorBaseBack) {
    color.style.fill = `rgb(${currentColors.base_back.r},${currentColors.base_back.g},${currentColors.base_back.b})`
  }
}

// uitvoeren tijdens inladen
generateRandomSneaker()

// uitvoeren als er op sterretjes wordt geklikt

function saveTrainingData(score) {
  const data = JSON.parse(window.localStorage.trainingData)

  data.push({
    input: [
      Math.round(currentColors.accent_top.r/2.55) / 100, // divide by 255 and round to 2 decimal places
      Math.round(currentColors.accent_top.g/2.55) / 100,
      Math.round(currentColors.accent_top.b/2.55) / 100,
      Math.round(currentColors.accent_bottom.r/2.55) / 100,
      Math.round(currentColors.accent_bottom.g/2.55) / 100,
      Math.round(currentColors.accent_bottom.b/2.55) / 100,
      Math.round(currentColors.base_front.r/2.55) / 100,
      Math.round(currentColors.base_front.g/2.55) / 100,
      Math.round(currentColors.base_front.b/2.55) / 100,
      Math.round(currentColors.base_back.r/2.55) / 100,
      Math.round(currentColors.base_back.g/2.55) / 100,
      Math.round(currentColors.base_back.b/2.55) / 100,
    ],
    output: [score]
  })

  window.localStorage.trainingData = JSON.stringify(data)

  generateRandomSneaker()
  predictSneakerCombinations()
  countDataPoints()
}

const sneakers = document.getElementById("sneakers")

// Eens we onze dataset hebben, kunnen we suggesties doen
function predictSneakerCombinations() {
  const data = JSON.parse(window.localStorage.trainingData)

  if (data.length < 20) {
    sneakers.innerHTML = "Je hebt minstents 20 beoordeling nodig ..."
    return;
  }

  sneakers.innerHTML = ""

  const net = new brain.NeuralNetwork({activation: "leaky-relu"})
  net.train(data) // train het neuraal netwerk

  const results = []
  for (let i = 0; i < 100000; i++) {

    const accent_top = getRandomRgb()
    const accent_bottom = getRandomRgb()
    const base_front = getRandomRgb()
    const base_back = getRandomRgb()

    const colors = [
      Math.round(accent_top.r/2.55) / 100, // divide by 255 and round to 2 decimal places
      Math.round(accent_top.g/2.55) / 100,
      Math.round(accent_top.b/2.55) / 100,
      Math.round(accent_bottom.r/2.55) / 100,
      Math.round(accent_bottom.g/2.55) / 100,
      Math.round(accent_bottom.b/2.55) / 100,
      Math.round(base_front.r/2.55) / 100,
      Math.round(base_front.g/2.55) / 100,
      Math.round(base_front.b/2.55) / 100,
      Math.round(base_back.r/2.55) / 100,
      Math.round(base_back.g/2.55) / 100,
      Math.round(base_back.b/2.55) / 100,
    ]

    const [ score ] = net.run(colors)
    results.push({ accent_top, accent_bottom, base_front, base_back, score})
  }

  // sorteer de resultaten op basis van hun score
  const sortedResults = results.sort(function(a, b) {
    var a = a.score
    var b = b.score
    return b - a
  })

  // toon de 20 beste resultaten
  for (let i = 0; i < 20; i++) {
    addNewSneaker(sortedResults[i])
  }
}

// uitvoeren tijdens inladen
predictSneakerCombinations()

// voeg een sneaker toe aan de oplijsting van suggesties
function addNewSneaker({accent_top, accent_bottom, base_front, base_back, score}) {
  const newSneaker = sneakerWrapper.cloneNode(true)
  newSneaker.classList.add("predicted-sneaker")

  for (let color of newSneaker.querySelectorAll(".accent_top")) {
    console.log('setting colorAccentTop')
    color.style.fill = `rgb(${accent_top.r},${accent_top.g},${accent_top.b})`
  }
  for (let color of newSneaker.querySelectorAll(".accent_bottom")) {
    color.style.fill = `rgb(${accent_bottom.r},${accent_bottom.g},${accent_bottom.b})`
  }
  for (let color of newSneaker.querySelectorAll(".base_front")) {
    color.style.fill = `rgb(${base_front.r},${base_front.g},${base_front.b})`
  }
   for (let color of newSneaker.querySelectorAll(".base_back")) {
    color.style.fill = `rgb(${base_back.r},${base_back.g},${base_back.b})`
  }
  const newScore = document.createElement("span")
  newScore.innerHTML = `<p> Score ${score.toFixed(2)} </p>`
  newSneaker.appendChild(newScore)
  sneakers.appendChild(newSneaker)
}


// sterren configureren

const stars = document.querySelectorAll(".star")

stars.forEach((star, i) => {
  const score = i / 4
  star.addEventListener("mouseenter", setStars.bind(setStars, i))
  star.addEventListener("mouseleave", clearStars)
  star.addEventListener("click", saveTrainingData.bind(saveTrainingData, score))
})

function setStars(whichStar) {
  for (let i = 0; i < stars.length; i++) {
    stars[i].classList.add("gold")
    if (i >= whichStar) {
      break;
    }
  }
}

function clearStars() {
  for (const star of stars) {
    star.classList.remove("gold")
  }
}

// data reset

const flush = document.getElementById("flush")

function flushDataPoints() {
  window.localStorage.removeItem("trainingData")
  location.reload()
}
flush.addEventListener("click", flushDataPoints)

// update data punt teller

const data_size = document.getElementById("data_size")

function countDataPoints() {
  const data = JSON.parse(window.localStorage.trainingData)
  data_size.innerHTML = data.length
}

// uitvoeren bij inladen

countDataPoints()
