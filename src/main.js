function getCurrentRootPath() {
  const l = document.createElement('link');
  l.setAttribute('href', './');
  l.getAttribute('href'); // do not use this, won't auto parsed to full url path 
  return l.href;
};
window.getCurrentRootPath = getCurrentRootPath;

const rootURL = getCurrentRootPath();

{ // init page
  if (location.href !== rootURL) {
    const href = location.search + location.hash;
    if (href.startsWith('/')) {
      window.history.pushState({}, '', href);
      const uri = rootURL + 'page' + href;
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

}


document.body.addEventListener('click', async function (e) { // navigation
  if (e.target.tagName !== 'A') return;
  if (e.ctrlKey) return;

  const href = e.target.getAttribute('href');
  if (href.startsWith('/') === false) return;
  const uri = rootURL + 'page' + href;
  e.preventDefault();

  if ((location.pathname + location.search + location.hash) !== href) {
    window.history.pushState({}, '', href + href.substring(0, href.length));
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
  const href = (location.href === rootURL ) ? 'index.html' : location.pathname + location.search + location.hash;
  const uri = rootURL + 'page' + href;
  const response = await fetch(uri);
  document.getElementById('app').innerHTML = await response.text();
};


if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js');
}