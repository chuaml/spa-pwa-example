async function navigatePage(hash) {
  // fetch resources
  // #pathname/xxx/yyy
  const href = hash.substring(1);

  // virtual url for SPA
  const url = new URL(`${location.protocol}//${location.host}/${href}`);

  const uri = `page${url.pathname}.html`;
  const response = await fetch(uri, {
    cache: url.search === '' ? undefined : 'no-store' // cache only if no search param
  });

  const appBody = document.getElementById('app');
  if (response.ok) {
    appBody.innerHTML = await response.text();
  }
  else {
    appBody.innerHTML = '<b>404</b>';
    console.error({ response });
  }
  console.log({ url, uri });
}

{ // init page
  if (location.hash !== '') {
    navigatePage(location.hash);
  }
}

// duplicated
// document.body.addEventListener('click', async function (e) { // navigation
//   if (e.target.tagName !== 'A') return;
//   if (e.ctrlKey) return;

//   const href = e.target.getAttribute('href');
//   if (href.startsWith('#') === false) return;

//   await navigatePage(href);
// });

window.onpopstate = async function _handlePageChange(ev) { // custom router
  await navigatePage(location.hash);
};


if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js');
}