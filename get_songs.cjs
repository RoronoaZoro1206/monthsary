async function getPlaylistTracks(url) {
  const r = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }
  });
  const t = await r.text();
  const tracks = [...new Set([...t.matchAll(/spotify:track:([a-zA-Z0-9]+)/g)].map(m => m[1]))];
  return tracks;
}

async function run() {
  // Try OPM Romance first
  const opm = await getPlaylistTracks('https://open.spotify.com/playlist/37i9dQZF1DXcZDD7cfEKhW'); 
  // Then Global Romance
  const global = await getPlaylistTracks('https://open.spotify.com/playlist/37i9dQZF1DWTR4ZOXTfd9K'); 
  
  let candidates = [...opm, ...global];
  console.log('Found candidates:', candidates.length);
  
  let good = [];
  for (let id of candidates) {
    if (good.length >= 24) break;
    try {
      const r = await fetch('https://open.spotify.com/embed/track/' + id);
      const text = await r.text();
      if (!text.includes('Page not found') && !text.includes('We can')) {
        good.push(id);
        console.log('Found good:', id);
      }
    } catch(e){}
  }
  
  const fs = require('fs');
  fs.writeFileSync('final_songs.json', JSON.stringify(good, null, 2));
  console.log('Saved to final_songs.json');
}
run();
