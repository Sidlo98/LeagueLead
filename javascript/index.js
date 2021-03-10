// import riotKey from './riotkey.js'

const riotKey = '';
const output = document.querySelector('#output');
const form = document.querySelector('#sumSearch');
const gamesOutput = document.querySelector('#gamesOutput');

let activeSummoner = '';
let championArray = [];

const getChampionNames = function() {
  fetch('./Assets/11.5.1/data/en_US/champion.json')
  .then(response => response.json())
  .then(data => makeChampionsArray(data))
} 

getChampionNames();

const makeChampionsArray = function(data) {
  championArray = Object.values(data.data);
}

 const getSummoner = function(name) {
   fetch(`https://euw1.api.riotgames.com/lol/summoner/v4/summoners/by-name/${name}?api_key=${riotKey}`)
   .then(response => {
      if(response.ok)
      {return response.json()}})
   .then(data => {
     if(data !== undefined){displaySummoner(data)}
      else summonerNotFound()})
 }

 const displaySummoner = function(data) {
  activeSummoner = data.accountId;
  console.log(data);
  gamesOutput.innerHTML = ''
  output.innerHTML = `
  <div class="card rounded shadow bg-dark text-light w-100">
  <div class="card roundend shadow bg-dark text-light w-50">
  <img src="./Assets/11.5.1/img/profileicon/${data.profileIconId}.png" class="card-img-top" alt="">
  <div class="card-body">
    <h5 class="card-title fs-1">${data.name}</h5>
    <p class="card-text">Level: ${data.summonerLevel}</p>

    <div id="gamesFilter" class="d-flex flex-column">

      <div class="form-check">
        <input class="form-check-input" type="radio" value="420" name="flexRadioDefault" id="flexRadioDefault1">
        <label class="form-check-label" for="flexRadioDefault1">
          Ranked Games
        </label>
      </div>
      <div class="form-check">
        <input class="form-check-input" type="radio" value="400" name="flexRadioDefault" id="flexRadioDefault2" checked>
        <label class="form-check-label" for="flexRadioDefault2">
          Normal Games
        </label>
      </div>

      <div class="mb-2">
      <label class="mt-2" for=""champion>Champion</label>
      <select name="champion" class="form-select" aria-label="Default select example">
      <option value='' selected>All Champions</option>
      ${listChampions()}
      </select>
      </div>

      <button class="btn btn-light">Recent Games</button>
    </div>
  </div>
  </div>
  </div>
`
 }

 const summonerGames = function (summoner, gameType = '', champion = '', amount = 10) { 
   gamesOutput.innerHTML = '';
   fetch(`https://euw1.api.riotgames.com/lol/match/v4/matchlists/by-account/${summoner}?${champion}${gameType}&endIndex=${amount}&api_key=${riotKey}`)
   .then(response => response.json())
   .then(data => {Object.values(data.matches).forEach(game => gameData(game.gameId))})
 }

const gameData = function (gameId) {
  fetch(`https://euw1.api.riotgames.com/lol/match/v4/matches/${gameId}?api_key=${riotKey}`)
  .then(response => response.json())
  .then(data => displayGames(data))
}

  const displayGames = function (data) {
    let player = data.participantIdentities.filter(summoner => (summoner.player.currentAccountId === activeSummoner))[0].participantId;
    let playerStats = data.participants.filter(participant => (participant.participantId === player));
    let champion = getChampionName(playerStats[0].championId);
    let time = data.gameDuration;
    let winLose = playerStats[0].stats.win;
    let result = 'Victory';
    let resultClass = 'text-success';
    if(!winLose) {
      result = 'Lose'
      resultClass = 'text-danger'
    };


  
   
    gamesOutput.innerHTML += 
  `
  <div class="card mb-3 bg-dark text-light">
  <img src="./Assets/img/champion/splash/${champion.id}_0.jpg" class="card-img-top" alt="...">
  <div class="card-body d-flex justify-content-between flex-column flex-md-row">
    <div>
      <h5 class="card-title h2">${champion.name} / ${playerStats[0].timeline.lane}</h5>
      <p class="card-text fw-bolder">${playerStats[0].stats.kills}/${playerStats[0].stats.deaths}/${playerStats[0].stats.assists} <span class="fst-italic">${playerStats[0].stats.totalMinionsKilled + playerStats[0].stats.neutralMinionsKilled}</span></p>
      <p class="card-text"><small class="text-muted">Time: ${formatTime(time)} <br> ${checkGameType(data.queueId)}</small></p>
      <div class="d-flex justify-content-between">
      <p class="card-text text-warning p-3">Gold: ${playerStats[0].stats.goldEarned}</p>
      <p class="card-text text-danger p-3">Damage: ${playerStats[0].stats.totalDamageDealtToChampions}</p>
      <p class="card-text text-success p-3">Healing: ${playerStats[0].stats.totalHeal}</p>
      <p class="card-text text-primary p-3">CC: ${playerStats[0].stats.timeCCingOthers}Sec</p>
      </div>
    </div>
    
    <div class="p-3 h2 ${resultClass}">${result}</div>

    <div class="d-flex flex-wrap">
      <div>
        <img class="m-1" src="./Assets/11.5.1/img/item/${playerStats[0].stats.item0}.png" alt="">
      </div>
      <div>
        <img class="m-1" src="./Assets/11.5.1/img/item/${playerStats[0].stats.item1}.png" alt="">
      </div>
      <div>
        <img class="m-1" src="./Assets/11.5.1/img/item/${playerStats[0].stats.item2}.png" alt="">
      </div>
      <div>
        <img class="m-1" src="./Assets/11.5.1/img/item/${playerStats[0].stats.item3}.png" alt="">
      </div>
      <div>
        <img class="m-1" src="./Assets/11.5.1/img/item/${playerStats[0].stats.item4}.png" alt="">
      </div>
      <div>
        <img class="m-1" src="./Assets/11.5.1/img/item/${playerStats[0].stats.item5}.png" alt="">
      </div>
      <div>
        <img class="m-1" src="./Assets/11.5.1/img/item/${playerStats[0].stats.item6}.png" alt="">
      </div>
    </div>
  </div>
</div>
  `
  }
  
  const getChampionName = function(nr) {
    let champion = championArray.filter(champion => champion.key == nr)[0]
    return champion
  }

  const summonerNotFound = function() {
    activeSummoner = ''
    output.innerHTML = `
        <div class="card roundend shadow bg-dark text-light">
          <div class="card-body">
            <h5 class="card-title">Error Summoner Not Found!</h5>   
          </div>
        </div>`
  }

  form.addEventListener('submit', e => {
    e.preventDefault();
   getSummoner(form.sum.value);
   form.sum.value = '';
  })

  output.addEventListener('click', e => {
    if (e.target.classList.contains('btn-light')) {
      let game = ''
      if (e.target.parentNode.childNodes[1].children[0].checked)
        game = '&queue=420';
      else if (e.target.parentNode.childNodes[3].children[0].checked) {
        game = '&queue=400';
      }
      let champion = e.target.parentNode.childNodes[5].children[1].value 
 
      console.log(champion);

      summonerGames(activeSummoner, game, champion);
    }
  })


  const checkGameType = function(game) {
    switch(game) {
      case game = 400:
        return 'Normal Game'
      break;
      case game = 420:
        return 'Ranked Game'
    }
  }

  const formatTime = function(time) {
    let formatedTime = `${time.toString().slice(0, 2)}:${time.toString().slice(2, 4)}`
    return formatedTime;
  }

  const listChampions = function() {
    let championList = ''
      championArray.forEach(champion => {
        championList += `<option value="champion=${champion.key}">${champion.name}</option>`
      })
    return championList;
  }