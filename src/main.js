const innerHTMLPolicy = trustedTypes.createPolicy("passthrough", {
  createHTML: (html) => html,
});

async function navigatePage(hash) {
  // fetch resources
  // #pathname/xxx/yyy
  const href = hash.substring(1);

  // virtual url for SPA
  const url = new URL(`${location.origin}/${href}`);

  const uri = `page${url.pathname}.html`;
  const response = await fetch(uri, {
    cache: url.search === '' ? undefined : 'no-store' // cache only if no search param
  });

  const appBody = document.getElementById('app');
  if (response.ok) {
    appBody.innerHTML = await response.text();

    const lastResource0 = _loadSharedResources(url.pathname);

    // import all script in <module></module> tag
    const lastResource1 = _loadIndividualResources(appBody);

    try {
      await lastResource0;
      await lastResource1;
    } finally {
      // last step, if any
    }
  }
  else {
    appBody.innerHTML = '<b>404</b>';
    console.error({ response });
  }
  console.log({ url, uri });
}

function _loadSharedResources(pathname) {
  // partial page, load dir general shared resources
  // only load sub dir under `/page/`
  // load /src/page/(**/dir.js) if any; assume js filename as same dir name
  let lastResource0 = null;
  const paths = pathname.split('/'), len = paths.length - 1;
  for (let i = 1; i < len; ++i) {
    if (paths[i] === '') continue;
    const src = `/src/page/${paths[i]}/${paths[i]}.js`;
    lastResource0 = import(src).catch(console.warn);
  }
  return lastResource0;
}

/** @param {HTMLElement} appBody */
function _loadIndividualResources(appBody) {
  // partial page, load individual file specific resources
  // specified in each file top <module></module> tag
  // load /src/page/(file.js|/**/file.js) if any
  let lastResource1 = null;
  const module = appBody.getElementsByTagName('module')[0];
  if (module !== undefined) {
    const scripts = module.getElementsByTagName('script'), len = scripts.length;
    for (let i = 0; i < len; ++i) {
      const src = scripts[i].getAttribute('src');
      if (src === null || src === '') continue;
      lastResource1 = import(src).catch(console.warn);
    }
  }
  return lastResource1;
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
  await navigatePage(location.hash); // to behave as SPA
  // window.stop(); this.location.reload();  // to behave as MPA
};


if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js');
}