document.addEventListener('DOMContentLoaded', ()=>{
  const toggle = document.querySelector('.nav-toggle');
  const nav = document.querySelector('.nav');
  toggle && toggle.addEventListener('click', ()=>{
    if(!nav) return;
    const shown = nav.style.display === 'flex' || window.getComputedStyle(nav).display === 'flex';
    nav.style.display = shown ? 'none' : 'flex';
  });

  // Smooth links
  document.querySelectorAll('a[href^="#"]').forEach(a=>{
    a.addEventListener('click', e=>{
      const href = a.getAttribute('href');
      if(href === '#' || href === '') return;
      const el = document.querySelector(href);
      if(el){
        e.preventDefault();
        el.scrollIntoView({behavior:'smooth',block:'start'});
        if(window.innerWidth <= 800 && nav) nav.style.display = 'none';
      }
    })
  })

  // Ensure external .top-arrow opens in new tab (safety handled by HTML attrs)
});

// --- Simulated real-time players & server ping updater ---
(function(){
  const servers = [
    // kept servers: Seoul Main, Seoul Trading Hub, Busan Gateway
    { id: 'seoul-main', title: 'Seoul Main · Prime', subtitle: 'Seoul, Korea (Primary)', tags:['Recommended','Korean UI','Full access'], minPlayers:80, maxPlayers:240, minPing:12, maxPing:28, note:'Best for competitive play' },
    { id: 'seoul-trade', title: 'Seoul Trading Hub', subtitle: 'Seoul, Korea', tags:['Trade focused','Korean / ENG'], minPlayers:40, maxPlayers:180, minPing:16, maxPing:36, note:'Active marketplace' },
    { id: 'busan', title: 'Busan Gateway', subtitle: 'Busan, Korea', tags:['Casual play','KR community'], minPlayers:20, maxPlayers:90, minPing:20, maxPing:40, note:'Relaxed atmosphere' }
  ];

  const serversGrid = document.getElementById('servers-grid');
  const playersCountEl = document.getElementById('players-count');

  function createServerCard(s){
    const card = document.createElement('div');
    card.className = 'server-card';
    card.id = `server-${s.id}`;
    const tagsHtml = (s.tags||[]).map(t=>`<span class="badge">${t}</span>`).join('');
    card.innerHTML = `
      <div class="card-header">
        <div class="icon" aria-hidden>
          <img class="server-icon" src="${s.id}.svg" alt="${s.title} logo">
        </div>
        <div class="title-block">
          <div class="server-name">${s.title}</div>
          <div class="server-sub">${s.subtitle}</div>
        </div>
      </div>
      <div class="badges">${tagsHtml}</div>
      <div class="ping-row">
        <span class="ping-dot" id="dot-${s.id}" aria-hidden></span>
        <div class="ping-text" id="pingtext-${s.id}">Ping average: --ms · ${s.note || ''}</div>
      </div>
      <div class="card-actions">
        <a class="server-join" href="https://roblox.com.ge/games/920587237/Adopt-Me?privateServerLinkCode=86052412669363265507291988127254" target="_blank" rel="noopener" aria-label="Join ${s.title}">Join Server</a>
      </div>
    `;
    return card;
  }

  // mount cards
  servers.forEach(s=>serversGrid.appendChild(createServerCard(s)));

  function randBetween(min,max){ return Math.floor(Math.random()*(max-min+1))+min }

  function updateOnce(){
    let total = 0;
    servers.forEach(s=>{
      const players = randBetween(s.minPlayers, s.maxPlayers);
      const ping = randBetween(s.minPing || 20, s.maxPing || 350);
      total += players;
      const card = document.getElementById(`server-${s.id}`);
      if(!card) return;
      const dot = document.getElementById(`dot-${s.id}`);
      const pingText = document.getElementById(`pingtext-${s.id}`);
      if(dot){
        dot.style.background = (ping <= 100) ? '#78e08f' : (ping <= 200 ? '#ffd166' : '#ff6b6b');
        dot.style.boxShadow = '0 6px 18px rgba(0,0,0,0.45)';
      }
      if(pingText){
        pingText.textContent = `Ping average: ${ping}ms · ${s.note || ''}`;
        pingText.style.color = 'rgba(255,255,255,0.85)';
      }
    });
    // hero visual: total players vs total capacity
    if(playersCountEl){
      const totalCapacity = servers.reduce((s,a)=>s + a.maxPlayers, 0);
      const pct = Math.round((total / totalCapacity) * 100);
      const playersFillHero = document.getElementById('players-fill');
      if(playersFillHero) playersFillHero.style.width = pct + '%';
      playersCountEl.textContent = total; // sr-only
    }
  }

  // initial update and periodic updates to simulate real-time
  updateOnce();
  setInterval(updateOnce, 3000);

  // Expose a simple hook to replace simulation with a real API
  window.RealtimeServers = {
    setData: function(data){
      // data: [{id:'asia', players:100, ping:45}, ...]
      let total = 0;
      data.forEach(d=>{
        const card = document.getElementById(`server-${d.id}`);
        if(!card) return;
        card.querySelector('.players-val').textContent = d.players;
        const pingEl = card.querySelector('.ping');
        pingEl.textContent = d.ping + ' ms';
        pingEl.classList.remove('ping--good','ping--warn','ping--bad');
        if(d.ping <= 100) pingEl.classList.add('ping--good');
        else if(d.ping <= 200) pingEl.classList.add('ping--warn');
        else pingEl.classList.add('ping--bad');
        total += d.players;
      });
      if(playersCountEl) playersCountEl.textContent = total;
    }
  };

})();
