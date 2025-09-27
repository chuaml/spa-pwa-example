const innerHTMLPolicy = trustedTypes.createPolicy("passthrough", {
  createHTML: (html) => html,
});

/** @type {Object<string, (_: any) => Promise<any>} */
const modules = import.meta.glob('./page/**/*.js', { eager: false });

/** @type {Object<string, (_: any) => Promise<any>} */
const pages = import.meta.glob('./page/**/*.html', { eager: false, query: 'raw' });
console.log('pages', pages);

/** @param {string} hash - should begin with '#/xxx' */
async function navigatePage(hash) {
  // fetch resources
  // #/pathname/xxx/yyy
  const href = hash.substring(1);
  console.assert(href && href.startsWith('/'), `invalid href: ${href}`);

  // virtual url for SPA
  const url = new URL(`${location.origin}${href}`);

  // use `fetch` if load html file from `/public`
  // const uri = `page${url.pathname}.html`;
  // const response = await fetch(uri, {
  //   cache: url.search === '' ? undefined : 'no-store' // cache only if no search param
  // });

  const appBody = document.getElementById('app');
  const pathname = url.pathname;
  if (pathname.endsWith('.png')
    || pathname.endsWith('.webp')
    || pathname.endsWith('.jpg')
    || pathname.endsWith('.jpeg')
    || pathname.endsWith('.gif')
    || pathname.endsWith('.svg')
    || pathname.endsWith('.avif')
    || pathname.endsWith('.apng')
  ) {
    showPicture(url, appBody);
    return;
  }

  const src = `./page${url.pathname}.html`;
  const page = pages[src];
  console.log({ url, src, page });

  if (page === undefined) return;

  const html = await page();
  // console.log({ html }, html.default);
  appBody.innerHTML = innerHTMLPolicy.createHTML(html.default);

  const lastResource0 = _loadSharedResources(url.pathname, modules);
  const lastResource1 = _loadIndividualResources(url.pathname, modules);
  const lastResource2 = _loadSharedResources2(url.pathname, modules);

  try {
    // await last imported files
    if (lastResource0 !== null) await lastResource0;
    if (lastResource1 !== null) await lastResource1;
    if (lastResource2 !== null) await lastResource2;
  } finally {
    // last step, if any
  }

  console.log({ url, src });
}

/** 
 * @param {string} pathname - absolute path, e.g. `/abcPage`
 * @param {Object<string, (_: any) => Promise<any>} modules
 */
function _loadSharedResources(pathname, modules) {
  // partial page, load dir general shared resources
  // console.assert(pathname && pathname.startsWith('/'), `invalid pathname: ${pathname}`);

  // import _shared.js file of each dir (if any)
  // from top to bottom (deepest) dir
  let lastResource0 = null;
  const paths = pathname.split('/').reverse();
  for (let path = paths.pop(); paths.length > 0;) {
    const src = `./page/${path}_shared.js`;
    path += `${paths.pop()}/`;
    const module = modules[src];
    console.log({ src, module });
    if (!module) continue;
    lastResource0 = module().catch(console.error);
  }


  return lastResource0;

  // alt algo; in reverse
  // for shared cleanup and reactive actions?

  // { // from bottom (deepest|closest) to top dir
  //   for (let path = pathname; path !== '';) {
  //     const h = path.lastIndexOf('/');
  //     path = path.substring(0, h);
  //     const src = `./page${path}/_shared.js`;
  //     console.log(src);
  //   }
  // }

}

/** 
 * @param {string} pathname - absolute path, e.g. `/abcPage`
 * @param {Object<string, (_: any) => Promise<any>} modules
 */
function _loadSharedResources2(pathname, modules) {
  // partial page, load dir general shared resources
  // console.assert(pathname && pathname.startsWith('/'), `invalid pathname: ${pathname}`);

  // import _onload.js file of each dir (if any)
  // from bottom to top; deepest | closest to top
  // for shared cleanup and reactive actions
  let lastResource2 = null;
  for (let path = pathname; path !== '';) {
    const h = path.lastIndexOf('/');
    path = path.substring(0, h);
    const src = `./page${path}/_onload.js`;
    console.log(src);
  }
  return lastResource2;
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

/** 
 * @param {URL} url 
 * @param {HTMLElement} appBody
 * */
function showPicture(url, appBody) {
  const img = document.createElement('img');
  // minimum size before loading
  img.setAttribute('width', '128'),
    img.setAttribute('height', '128');

  img.onload = function () {
    img.setAttribute('width', img.naturalWidth),
      img.setAttribute('height', img.naturalHeight);
  };

  img.setAttribute('role', 'img');
  img.setAttribute('', 'img');

  img.setAttribute('src', `page${url.pathname}${url.search}${url.hash}`);
  appBody.appendChild(img);
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
  // window.stop(); window.location.reload();  // to behave as MPA
};


if (location.origin.startsWith('https'))
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js');
  }