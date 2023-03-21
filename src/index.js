import { getArtists, getSongsForArtist, searchSongs, getLyricsSong } from "./api";
import lireChanson from "./player";
import JsonStorage from "./lib/jsonStorage";

const searchInput = document.querySelector("#search-input");
const searchBtn = document.querySelector("#search-trigger");
const favoriteStorage = new JsonStorage({ name: "favorites", eventName: "favorites_update"});

window.addEventListener("offline", () => {
  document.querySelector(":root").style.setProperty("--primary-color", "#ff0404");
  document.querySelector(":root").style.setProperty("--primary-color-dark", "#500000");
})
window.addEventListener("online", () => {
  document.querySelector(":root").style.setProperty("--primary-color", "#0474ff");
  document.querySelector(":root").style.setProperty("--primary-color-dark", "#002450");
})

searchBtn.addEventListener("click", () => {
  if(!searchInput.classList.contains("active")){
    searchInput.classList.add("active");
  } else {
    searchInput.classList.remove("active");
  }
});
searchInput.addEventListener("change", (e) => {
  window.location.hash = `#search-${e.target.value}`;
  searchInput.classList.remove("active");
  searchInput.value = "";
})

function afficherDesSongs(songs){  
  // On obtient l'élément DOM qui nous servira de template pour un élément de la list
  const songListItemTemplate = document.querySelector("#list-item-template");

  // Element DOM de la liste à manipuler
  const songList = document.querySelector(".list");

  // On vide la liste de ses anciennes informations, pour en ajouter de nouvelles à jour
  songList.replaceChildren();

  // On itère sur chacune des chansons récupérées depuis l'API pour cet artiste
  songs.forEach((song) => {
    
    // Créer une copie du template et de son contenu pour avoir un nouvelle élément vierge
    // que l'on stock dans la variable newSongItem
    const newSongItem = songListItemTemplate.content.cloneNode(true);

    // On rempli le titre de la chanson dans ce nouvel élément, en sélectionnant l'élément
    // list-item-title à l'intérieur (!dans newSongItem! Pas dans document)
    newSongItem.querySelector(".list-item-title").innerHTML = song.title;

    newSongItem.querySelector(".play-button").addEventListener("click", () => {
      lireChanson(song, songs);
      window.location.hash = "player";
    });

    // Clic sur le titre pour afficher les paroles
    newSongItem.querySelector(".list-item-title").addEventListener("click", () => {
      window.location.hash = `#song-${song.id}`;
    })
    // newSongItem.querySelector("a").href = `#song-${song.id}`;

    newSongItem.querySelector(".add-button").addEventListener("click", (e) => {
      console.log(e.target)
      if(favoriteStorage.getItem(song.id)){
        console.log("C’est dedans!");
        favoriteStorage.removeItem(song.id);
        e.target.innerText = "playlist_add";
      } else {
        console.log("ça n’y est pas…");
        favoriteStorage.setItem(song.id, song);
        e.target.innerText = "playlist_remove";
      }      
    });
    if (favoriteStorage.getItem(song.id)) {
       newSongItem.querySelector(".add-button span").innerText = "playlist_remove";
    } else {
      newSongItem.querySelector(".add-button span").innerText = "playlist_add";
    }  

    // On l'ajoute à la liste de chansons
    songList.append(newSongItem);
  });
}
window.addEventListener("favorites_update",() => {
  if(window.location.hash === "#favorites"){
    afficherDesSongs(favoriteStorage.toArray().map((e) => e[1]));
  }
})

const displaySection = async (hash) => {
  if(hash == '') hash = '#home'

  const hashSplit = hash.split('-');
  // Supprime/Ajoute la classe active sur la section
  // On va chercher le lien actuellement affiché (n'importe quel lien qui a une classe active)
  document.querySelector(`nav a.active`)?.classList.remove('active')
  // On va chercher le lien avec pour url le hash en cours (car window.location.hash est égal au href du lien)
  // Exemple: <a href="#player">...</a> ===>>> window.location.hash vaudra '#player'
  document.querySelector(`nav a[href="${hashSplit[0]}"]`)?.classList.add('active')

  switch (hashSplit[0]) {
    case "#search":
      const searchedSongs = await searchSongs(hashSplit[1]);
      console.log(searchedSongs);
      hash = "#list";
      document.querySelector("#song-list-artist-title").innerHTML = `Résultats de recherche pour "${hashSplit[1]}"`;
      afficherDesSongs(searchedSongs);
    break;
    case "#artists":
      // S'il y a un paramètre derrière...? Ex: -> #artists-12 -> hashSplit[1] vaudra 12
      if (hashSplit[1]) {
        // Plus bas, on toggle les section en se servant de la variable hash. En la réécrivant,
        // Cela nous permet d'afficher la section générique "list"
        hash = "#list";
        // On récupère les songs d'un artiste depuis l'API, en se servant de son Id passé en paramètre
        const songs = await getSongsForArtist(hashSplit[1]);

        document.querySelector("#song-list-artist-title").innerHTML = `Artistes > ${songs[0].artist.name}`;

        afficherDesSongs(songs);
      } else {
        // On obtient l'élément DOM qui nous servira de template pour un élément de la liste d'artistes
        const artistListItemTemplate = document.querySelector(
          "#artist-list-item-template"
        );

        // Element DOM de la liste à manipuler
        const artistList = document.querySelector(".artist-list");

        // On vide la liste de ses anciennes informations, pour en ajouter de nouvelles à jour
        artistList.replaceChildren();

        // On récupère les artistes depuis l'API
        const artists = await getArtists();

        // On itère sur chacun des artistes récupérés depuis l'API
        artists.forEach((artist) => {
          // Créer une copie du template et de son contenu pour avoir un nouvelle élément vierge
          // que l'on stock dans la variable newArtistItem
          const newArtistItem = artistListItemTemplate.content.cloneNode(true);

          // On modifie l'url du lien qui se trouve à l'intérieur, pour avoir une URL du style #artists-12
          newArtistItem.querySelector("a").href = "#artists-" + artist.id;

          // On rempli le titre de l'artiste dans ce nouvel élément, en sélectionnant l'élément
          // artist-list-item-title à l'intérieur (!dans newArtistItem! Pas dans document)
          newArtistItem.querySelector(".artist-list-item-title").innerHTML =
            artist.name;

          // On modifie le src de l'image qui se trouve à l'intérieur, pour afficher la cover de l'artiste
          newArtistItem.querySelector("img").src = artist.image_url;

          // On l'ajoute à la liste d'artistes
          artistList.append(newArtistItem);
        });
      }

      break;

    case "#favorites":
      hash = "#list";
      document.querySelector("#song-list-artist-title").textContent = "Favoris";
      afficherDesSongs(favoriteStorage);
      break;

    case "#song":
      hash = "#lyrics";
      const wantedSong = await getLyricsSong(hashSplit[1]);
      const lyricsWrapper = document.querySelector("#lyrics-section");
      lyricsWrapper.querySelector("h4").textContent = wantedSong.title;
      lyricsWrapper.querySelector("h5").textContent = wantedSong.artist.name;
      lyricsWrapper.querySelector("p").textContent = wantedSong.lyrics;
      break;
  }

  // Comme pour le menu, on enlève la classe active à la section en cours
  document.querySelector(`section.active`)?.classList.remove('active')
  // et on essaie de trouver la section correspondante et l'afficher, en y ajoutant la classe active
  document.querySelector(`${hash}-section`)?.classList.add('active')
}

window.addEventListener('hashchange', () => displaySection(window.location.hash))

displaySection(window.location.hash)

navigator.serviceWorker.register(new URL('workerCacheFetched.js', import.meta.url))