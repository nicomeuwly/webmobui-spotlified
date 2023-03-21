import formatTimestamp from "./lib/formatTimestamp";

const player = document.querySelector("#audio-player");
const playerControlPlay = document.querySelector("#player-control-play > span");
let songsList = [];
let currentSong = null;

function togglePlayPause() {
  if (player.paused) {
    player.play();
  } else {
    player.pause();
  }
}

function changeIcon(){
  if (player.paused) {
    playerControlPlay.innerHTML = "play_arrow";
  } else {
    playerControlPlay.innerHTML = "pause";
  }
}

function avancerPlayer(event) {
  player.currentTime = event.currentTarget.value;
}

function mettreAJourValeurMaxSlider(){
  document.querySelector("#player-time-duration").textContent = formatTimestamp(player.duration);
  document.querySelector("#player-progress-bar").max = player.duration;
}

function mettreAJourValeurSlider(){
  document.querySelector("#player-time-current").textContent = formatTimestamp(player.currentTime);
  document.querySelector("#player-progress-bar").value = player.currentTime;
}

function lireChanson(laChanson, leTableauDeChansons){
  currentSong = laChanson;
  songsList = leTableauDeChansons;
  player.src = laChanson.audio_url;
  document.querySelector("#player-thumbnail-image").src = laChanson.artist.image_url;
  document.querySelector("#player-infos-song-title").textContent = laChanson.title;
  document.querySelector("#player-infos-artist-name").textContent = laChanson.artist.name;
  player.play();
}

function chansonSuivante(){
  const id = songsList.indexOf(currentSong);
  const nextSong = songsList[id + 1];
  if (nextSong) {
    lireChanson(nextSong, songsList);
  } else {
    lireChanson(songsList[0], songsList);
  }
}

document.querySelector("#player-control-next").addEventListener("click", chansonSuivante);

document.querySelector("#player-control-previous").addEventListener("click", () => {
  const id = songsList.indexOf(currentSong);
  const previousSong = songsList[id - 1];
  const maxID = songsList.length - 1;
  if (previousSong) {
    lireChanson(previousSong, songsList);
  } else {
    lireChanson(songsList[0], songsList);
  }
});

player.addEventListener("ended", chansonSuivante);

player.addEventListener("play", changeIcon);
player.addEventListener("pause", changeIcon);
document.querySelector("#player-control-play").addEventListener("click", togglePlayPause);
player.addEventListener("durationchange", mettreAJourValeurMaxSlider);
player.addEventListener("timeupdate", mettreAJourValeurSlider);
document.querySelector("#player-progress-bar").addEventListener("change", avancerPlayer);

export default lireChanson;