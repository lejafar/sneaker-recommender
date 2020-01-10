const sneakerWrapper = document.querySelector(".sneaker-wrapper")
const colorAccentTop = document.querySelectorAll(".accent_top")
const colorAccentBottom = document.querySelectorAll(".accent_bottom")
const colorBaseFront = document.querySelectorAll(".base_front")
const colorBaseBack = document.querySelectorAll(".base_back")
const stars = document.querySelectorAll(".star")
const sneakers = document.getElementById("sneakers")
const data_size = document.getElementById("data_size")
const flush = document.getElementById("flush")

window.localStorage.trainingData = window.localStorage.trainingData || JSON.stringify([])

// our current voting combination
const currentColors = {
  accent_top: {},
  accent_bottom: {},
  base_front: {},
  base_back: {},
}

generateRandomSneaker()
predictSneakerCombinations()
countDataPoints()

stars.forEach((star, i) => {
  const score = i / 4
  star.addEventListener("mouseenter", setStars.bind(setStars, i))
  star.addEventListener("mouseleave", clearStars)
  star.addEventListener("click", saveTrainingData.bind(saveTrainingData, score))
})

function flushDataPoints() {
  window.localStorage.removeItem("trainingData")
  location.reload()
}
flush.addEventListener("click", flushDataPoints)

function countDataPoints() {
  const data = JSON.parse(window.localStorage.trainingData)
  data_size.innerHTML = data.length
}
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

// once we have a good set of data, generate some color combinations!
function predictSneakerCombinations() {
  const data = JSON.parse(window.localStorage.trainingData)
  if (data.length < 20) {
    sneakers.innerHTML = "Je hebt minstents 20 beoordeling nodig ..."
    return;
  }

  sneakers.innerHTML = ""
  const net = new brain.NeuralNetwork({activation: "leaky-relu"});
  const results = []

  net.train(data)

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

  // sort results
  const sortedResults = results.sort(function(a, b) {
    var a = a.score
    var b = b.score
    return b - a
  })
  console.log(sortedResults)
  // keep the top 20 results!
  for (let i = 0; i < 20; i++) {

    addNewSneaker(sortedResults[i])
  }
}

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

function generateRandomSneaker() {

  currentColors.accent_top = getRandomRgb() // getRandomBackgroundRgb()
  currentColors.accent_bottom = getRandomRgb()
  currentColors.base_front = getRandomRgb()
  currentColors.base_back = getRandomRgb()

  for (let color of colorAccentTop) {
    console.log('setting colorAccentTop')
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

function getRandomRgb() {
  return {
    r: Math.round(Math.random()*205 + 50), // number between 50 and 255
    g: Math.round(Math.random()*205 + 50),
    b: Math.round(Math.random()*205 + 50),
  }
}

function getRandomBackgroundRgb() {
  return {
    r: Math.round(Math.random()*50), // number between 0 and 50
    g: Math.round(Math.random()*50),
    b: Math.round(Math.random()*50),
  }
}

function getRandomSoftRgb() {
  return {
    r: Math.round(Math.random()*55 + 200), // number between 200 and 255
    g: Math.round(Math.random()*55 + 200),
    b: Math.round(Math.random()*55 + 200),
  }
}
