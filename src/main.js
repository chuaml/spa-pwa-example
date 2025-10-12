// import { injectCustomCode } from '/src/code_injector.mjs';
const injectCustomCode = _ => { }; // do nothing

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
  const path = hash.substring(1);
  console.assert(path && path.startsWith('/'), `invalid path: ${path}`);

  // virtual url for SPA
  const url = new URL(`${location.origin}${path}`);

  // load img
  const pathname = url.pathname;
  if (pathname.endsWith('.png')
    || pathname.endsWith('.jpg')
    || pathname.endsWith('.jpeg')
    || pathname.endsWith('.gif')
    || pathname.endsWith('.svg')
    || pathname.endsWith('.webp')
    || pathname.endsWith('.avif')
    || pathname.endsWith('.apng')
  ) {
    return loadImageFile(url);
  }

  processSearchParams(url.searchParams);

  // load page
  const src = `./page${url.pathname === '/' ? '' : url.pathname}/_.html`;
  const page = pages[src];
  console.log({ url, src, page });

  const appBody = _resetAppBody();
  if (page === undefined) {
    appBody.innerHTML = innerHTMLPolicy.createHTML('<h1>404 page not found =( </h1>');
    return;
  }

  try {
    await _loadSharedResources(url.pathname, modules, appBody);
  } catch (err) {
    console.error(err);
    appBody.innerHTML = innerHTMLPolicy.createHTML(`<p>$${err.toString()}</p>`);
    return;
  }

  const html = await page();
  // console.log({ html }, html.default);
  appBody.innerHTML = innerHTMLPolicy.createHTML(html.default);

  const lastResource1 = _loadIndividualResources(url.pathname, modules, appBody);
  const lastResource2 = _loadSharedResources2(url.pathname, modules, appBody);

  // emulate page load event, for 3rd party mpa code to run
  const opt = { bubbles: true };
  try {
    // if (lastResource0 !== null) await lastResource0;
    if (lastResource1 !== null) await lastResource1;
    if (lastResource2 !== null) await lastResource2;

    setTimeout(_ => {
      injectCustomCode(localStorage['txtCodeBody'] || '', document.body);
    }, 0);
    setTimeout((appBody, opt) => { appBody.dispatchEvent(new Event('readystatechange', opt)); }, 0, appBody, opt);
  }
  finally {
    // emulate page load events,
    // for 3rd party mpa code to run
    setTimeout((appBody, opt) => { appBody.dispatchEvent(new Event('DOMContentLoaded', opt)); }, 0, appBody, opt);
    setTimeout((window, opt) => {
      window.dispatchEvent(new Event('load', opt));
      window.dispatchEvent(new PageTransitionEvent('pageshow', opt));
    }, 0, window, opt);
  }
  console.log({ url, src });
}

/** 
 * @param {string} pathname - absolute path, e.g. `/abcPage`
 * @param {Object<string, (_: any) => Promise<any>} modules
 * @param {HTMLElement} appBody - the main body of app
 */
async function _loadSharedResources(pathname, modules, appBody) {
  // partial page, load dir general shared resources
  console.assert(pathname && pathname.startsWith('/'), `invalid pathname: ${pathname}`);

  // import _auth.js file of each dir (if any)
  // from top to bottom (deepest) dir
  const paths = pathname.split('/').reverse();
  for (let path = paths.pop(); paths.length > 0;) {
    const src = `./page/${path}_auth.js`;
    path += `${paths.pop()}/`;
    const module = modules[src];
    console.log({ src, module });
    if (!module) continue;

    // must stop when getting any error 
    const m = await module()
      // .catch(console.error) // fail all if _auth.js throw any error
      ;
    m.default(appBody);
  }
}

/** 
 * @param {string} pathname - absolute path, e.g. `/abcPage`
 * @param {Object<string, (_: any) => Promise<any>} modules
 * @param {HTMLElement} appBody - the main body of app
 */
function _loadSharedResources2(pathname, modules, appBody) {
  // partial page, load dir general shared resources
  console.assert(pathname && pathname.startsWith('/'), `invalid pathname: ${pathname}`);

  // import _onload.js file of each dir (if any)
  // from bottom to top; deepest | closest to top
  // for shared cleanup and reactive actions
  let lastResource2 = null;
  for (let path = pathname; path !== '';) {
    const h = path.lastIndexOf('/');
    path = path.substring(0, h);
    const src = `./page${path}/_onload.js`;
    const module = modules[src];
    console.log({ src, module });
    if (!module) continue;
    lastResource2 = module().then(m => m.default(appBody)).catch(console.error);
  }
  return lastResource2;
}

/** 
 * @param {string} pathname - absolute path, e.g. `/abcPage`
 * @param {Object<string, (_: any) => Promise<any>} modules
 * @param {HTMLElement} appBody - the main body of app
 * */
function _loadIndividualResources(pathname, modules, appBody) {
  // partial page, load individual file specific resources
  // load /src/page/(file.js|/**/file.js) if any
  console.assert(pathname && pathname.startsWith('/'), `invalid pathname: ${pathname}`);

  if (pathname === '/') return null;
  const src = `./page${pathname}/_.js`; // is to /src/page/**/_.js
  // console.log({ src, modules });
  const module = modules[src];
  if (!module) return null;
  return module().then(m => m.default(appBody)).catch(console.error);
}

function _resetAppBody() {
  // this reset and remove all eventListeners on app body too
  const div2 = document.createElement('div');

  const div = document.getElementById('app');
  div2.setAttribute('id', 'app'),
    div.textContent = '',
    document.body.replaceChild(div2, div);
  return div2;
}


{ // init page
  if (location.hash !== '' && location.hash !== '#') {
    navigatePage(location.hash);
  }
  else {
    navigatePage('#/');
  }
}

window.onpopstate = async function navigateTo(ev) { // custom route
  await navigatePage(location.hash); // spa
  // window.stop(), this.location.reload();  // mpa
};



/** @param {URL} url */
async function loadImageFile(url) {
  const img = document.createElement('img');

  // minimum size before loading
  img.setAttribute('width', '128'),
    img.setAttribute('height', '128');

  img.onload = function () {
    img.setAttribute('width', img.naturalWidth);
    img.setAttribute('height', img.naturalHeight);
  };
  img.setAttribute('src', `page${url.pathname}${url.search}`);

  const appBody = _resetAppBody();
  appBody.appendChild(img);
}

/** @param {URLSearchParams} searchParams */
function processSearchParams(searchParams) {
  const xyz = searchParams.get('xyz');
  console.log({ searchParams, virtual_search_string: searchParams.toString() });
  // ...
}

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js', { scope: './' });

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    setTimeout(showInstallAppButton, 1000, e);
  }, { once: true });

  /** @param {BeforeInstallPromptEvent} deferredPrompt */
  function showInstallAppButton(deferredPrompt) {
    const btnInstallApp = document.getElementById('btnInstallApp');
    btnInstallApp.addEventListener('click', function (e) {
      if (e.isTrusted === false) return;
      deferredPrompt.prompt();
      btnInstallApp.style['display'] = 'none';
    });
    btnInstallApp.style['display'] = '';
  }

}

import { alert } from '/src/alert.mjs';

{ // error alert
  let qid = 0, d = false;
  window.onerror = function (e) {
    if (d) return;
    clearTimeout(qid);
    qid = setTimeout(_ => {
      alert('Ops... app got some unknown error');
      d = true;
    }, 1500);
  };
}

window.addEventListener('load', function (ev) {
  if (ev.isTrusted === false) return;
  setTimeout(async function preLoadModule() {
    for (const key of Object.keys(pages)) {
      await pages[key]().catch(console.error);
    }
    for (const key of Object.keys(modules)) {
      await modules[key]().catch(console.error);
    }

    console.log('all modules are loaded, offline experience is ready');
  }, 2000);
});
