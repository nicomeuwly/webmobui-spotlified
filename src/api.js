// URL de base du serveur
const BASE_URL = 'https://webmob-ui-22-spotlified.herokuapp.com'

// Fonction loadJson utilisée à l'interne. Elle s'occupe de charger l'url passée en paramètre et convertir
// son résultat en json
async function loadJson(url) {
  const response = await fetch(url)
  const parsedJson = await response.json()
  return parsedJson
}

// Retourne une liste d'artistes
async function getArtists() {
  return await loadJson(`${BASE_URL}/api/artists`)
}

// Retourne la liste des chansons d'un ariste
async function getSongsForArtist(id) {
  return await loadJson(`${BASE_URL}/api/artists/${id}/songs`)
}

// Retourne un résultat de recherche
async function searchSongs(query) {
  return await loadJson(`${BASE_URL}/api/songs/search/${encodeURIComponent(query)}`)
}

async function getLyricsSong(id) {
  return await loadJson(`${BASE_URL}/api/songs/${id}`)
}

export { getArtists, getSongsForArtist, searchSongs, getLyricsSong }
