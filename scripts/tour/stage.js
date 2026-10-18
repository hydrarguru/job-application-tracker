
  const $ = (id) => document.getElementById(id);
  window.stage = {
    caption(num, text) {
      const pill = $('pill');
      if (!text) { pill.classList.add('hide'); return; }
      pill.classList.add('hide');
      setTimeout(() => { $('num').textContent = num; $('cap').textContent = text; pill.classList.remove('hide'); }, pill.textContent.trim() ? 300 : 0);
    },
    card(id, show) { $(id).classList.toggle('show', show); },
    scene(id) { for (const s of document.querySelectorAll('.scene')) s.classList.toggle('show', s.id === id); },
    url(text) { $('url').textContent = text; },
    popup(open) { $('popup-wrap').classList.toggle('open', open); $('ext').classList.toggle('on', open); },
    cursor(x, y) { $('cursor').style.left = x + 'px'; $('cursor').style.top = y + 'px'; },
    cursorVisible(v) { $('cursor').style.opacity = v ? 1 : 0; },
    click() { const r = $('ring'); r.classList.remove('go'); void r.offsetWidth; r.classList.add('go'); },
    /* Converts a rect inside an iframe to stage coordinates. */
    toStage(frameId, rect) {
      const f = $(frameId); const b = f.getBoundingClientRect(); const s = b.width / f.offsetWidth;
      return { x: b.left + (rect.x + rect.width / 2) * s, y: b.top + (rect.y + rect.height / 2) * s };
    },
  };
