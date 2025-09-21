const innerHTMLPolicy = trustedTypes.createPolicy("passthrough", {
  createHTML: (html) => html,
});

/** @type {Object<string, (_: any) => Promise<any>} */
const modules = import.meta.glob('./page/**/*.js', { eager: false });


/** @param {string} hash - should begin with '#/xxx' */
async function navigatePage(hash) {
  // fetch resources
  // #/pathname/xxx/yyy
  const href = hash.substring(1);
  console.assert(href && href.startsWith('/'), `invalid href: ${href}`);

  // virtual url for SPA
  const url = new URL(`${location.origin}${href}`);

  const uri = `page${url.pathname}.html`;
  const response = await fetch(uri, {
    cache: url.search === '' ? undefined : 'no-store' // cache only if no search param
  });

  const appBody = document.getElementById('app');
  if (response.ok) {
    appBody.innerHTML = innerHTMLPolicy.createHTML(await response.text());

    const lastResource0 = _loadSharedResources(url.pathname, modules);
    const lastResource1 = _loadIndividualResources(url.pathname, modules);

    try {
      // await last imported files
      if (lastResource0 !== null) await lastResource0;
      if (lastResource1 !== null) await lastResource1;
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

/** 
 * @param {string} pathname - absolute path, e.g. `/abcPage`
 * @param {Object<string, (_: any) => Promise<any>} modules
 */
function _loadSharedResources(pathname, modules) {
  // partial page, load dir general shared resources
  // only load sub dir under `/page/`
  // load /src/page/(**/dir.js) if any; assume js filename as same dir name
  // console.assert(pathname && pathname.startsWith('/'), `invalid pathname: ${pathname}`);

  let lastResource0 = null;
  const paths = pathname.split('/'), len = paths.length - 1;
  for (let i = 1; i < len; ++i) {
    if (paths[i] === '') continue;
    const src = `./page/${paths[i]}/${paths[i]}.js`; // is to /src/page/dir/dir.js
    const module = modules[src];
    if (!module) continue;
    lastResource0 = module().catch(console.error);
  }
  return lastResource0;
}

/** 
 * @param {string} pathname - absolute path, e.g. `/abcPage`
 * @param {Object<string, (_: any) => Promise<any>} modules
 * */
function _loadIndividualResources(pathname, modules) {
  // partial page, load individual file specific resources
  // load /src/page/(file.js|/**/file.js) if any
  // console.assert(pathname && pathname.startsWith('/'), `invalid pathname: ${pathname}`);

  if (pathname === '/') return null;
  const src = `./page${pathname}.js`; // is to /src/page/**/*.js
  // console.log({ src, modules });
  const module = modules[src];
  if (!module) return null;
  return module().catch(console.error);
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