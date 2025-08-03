{ // init page
  if (location.pathname !== '/') {
    const href = location.pathname + location.search + location.hash;
    const uri = location.protocol + '//' + location.host + '/page' + href;

    window.history.pushState({}, '', href);
    const response = await fetch(uri);
    const appBody = document.getElementById('app');
    if (response.ok) {
      appBody.innerHTML = await response.text();
    }
    else {
      appBody.innerHTML = '<b>404</b>';
    }
    console.log({ href, uri });
  }
}


document.body.addEventListener('click', async function (e) { // navigation
  if (e.target.tagName !== 'A') return;

  const href = e.target.getAttribute('href');
  if (href.startsWith('/') === false) return;
  const uri = location.protocol + '//' + location.host + '/page' + href;
  e.preventDefault();

  if ((location.pathname + location.search + location.hash) !== href) {
    window.history.pushState({}, '', href);
  }
  const response = await fetch(uri);
  const appBody = document.getElementById('app');
  if (response.ok) {
    appBody.innerHTML = await response.text();
  }
  else {
    appBody.innerHTML = '<b>404</b>';
  }
  console.log({ href, uri });

});

window.onpopstate = async function handleNavBack(ev) { // go back
  ev.preventDefault();
  console.log(ev, location);
  const uri = location.protocol + '//' + location.host + '/page' + location.pathname + location.search + location.hash;
  const response = await fetch(uri);
  document.getElementById('app').innerHTML = await response.text();
};


if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js');
}