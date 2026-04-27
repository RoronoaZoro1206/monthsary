const puppeteer = require('puppeteer');

(async () => {
  const queries = [
    'Araw-Araw Ben&Ben',
    'Pasilyo SunKissed Lola',
    'Palagi TJ Monterde',
    'Mundo IV Of Spades',
    'Ikaw Lang NOBITA',
    'Paraluman Adie',
    'Mahika Adie',
    'Tadhana Up Dharma Down',
    'Tingin Cup of Joe',
    'Cupid FIFTY FIFTY',
    'Until I Found You Stephen Sanchez',
    'Those Eyes New West',
    'Dandelions Ruth B',
    'Here With Me d4vd',
    'Golden Hour JVKE',
    'Snooze SZA',
    'Lover Taylor Swift',
    'Sweet Nothing Taylor Swift',
    'Just The Way You Are Bruno Mars',
    'Nothing Gonna Change My Love For You',
    'You Are The Reason Calum Scott',
    'Perfect Ed Sheeran',
    'A Thousand Years Christina Perri',
    'Say You Wont Let Go James Arthur',
    'Make You Feel My Love Adele',
    'Endless Love Diana Ross',
    'Halo Beyonce',
    'My Girl The Temptations'
  ];
  
  const browser = await puppeteer.launch({headless: 'new'});
  const page = await browser.newPage();
  let results = [];
  
  for (let q of queries) {
    try {
      await page.goto('https://open.spotify.com/search/' + encodeURIComponent(q) + '/tracks');
      await page.waitForSelector('a[href^="/track/"]', {timeout: 3000});
      const href = await page.evaluate(() => {
        const a = document.querySelector('a[href^="/track/"]');
        return a ? a.href : null;
      });
      if (href) {
        const id = href.split('/track/')[1].split('?')[0];
        // verify embed
        const r = await fetch('https://open.spotify.com/embed/track/' + id);
        const t = await r.text();
        if (!t.includes('Page not found') && !t.includes('We can')) {
          results.push({q, id});
          console.log('SUCCESS:', q, id);
        } else {
          console.log('FAILED EMBED:', q, id);
        }
      }
    } catch(e) {
      console.log('ERROR:', q);
    }
  }
  await browser.close();
  const fs = require('fs');
  fs.writeFileSync('good_songs.json', JSON.stringify(results, null, 2));
})();
