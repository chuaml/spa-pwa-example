# Custom Single Page App with PWA

build tools:
* ViteJS -> Vanilla JS

without using any front-end framework, custom built SPA + MPA hybraid app

# Explanation of App's Structure:

pages and .html files:
- 1st and only 1 entry point is `index.html`
- any other pages are treated as partial html
- all pages are `.html` files

.html files:
<!-- - each html page file is in `/public/page/` directory
- html files may be group into a sub directory under `/public/page/(dirname)` directory 
    - e.g. `/public/page/dirname/(*.html)` -->
- each html page file is in `/src/page/` directory
- html files may be group into a sub directory under `/src/page/(dirname)` directory 
    - e.g. `/src/page/dirname/(*.html)`

- filename is derived from ( URL -> pathname -> split by `/` -> last bit ) and without extension e.g. `.html`
    - example: if URL = `/**/**/xxx` then filename is `xxx`
- ( URL -> pathname ) is derived from virtual path which is place in after `location.hash`
    - e.g. `http://localhost/#/abs-path` then the virtual path will be `/abs-path`

- the corresponding `.js` file with its filename same as the dirname will be loaded automatically, if any
    - e.g. if exists `/src/page/dirname/(dirname.js)` then `(dirname.js)` would be would be imported for all `dirname/*.html` html pages under the same dirname


.js files:
- each page file may have 0..1 corresponding `.js` javascript file with the same filename
    - `/src/page/*.js` file will be automatically loaded (aka imported)
    - if and only if the filename of html and js are matched and the same; e.g. `xxx.html` is to `xxx.js`



## Reason of deisgn

Goal of design:
- a single template html on root `/` and serve as custom router
- 1 page, 1 partial html file, 1 js file correspondingly
- partial resources will be injector into template body
- template `index.html` is the general sturcture of html 
- template host and contains the shared styles.css and main.js
- use no 3rd party plugins nor frameworks


Why use `locatioh.hash` as the URI path?
- this is designed to persists the navigated pages URL into browser history
    - but web app that is designed in SPA style would need to manually set and manipulate the path and history API
- it is difficult and error prompt
- it is proven to be incompatible in different environment
    - i.e. in local dev server  vs  local preview server  vs  production (e.g. Github Pages);
    - the bundled resources (in `/src/**/*`) filename cannot be determined and loaded dynamically
    - the actual root (home page) cannot be determined in production env like GitHub Pages, unless hard coded in,
    - making it imposible to set the correct path into browser history properly;
    - initial load on the wrong path or than the actual home page would cause error and failed
- thus, virtual path is used; `location.hash` is used to host the actual path for SPA to load partial html page

<!-- Why `.html` pages are place separately in `/public` directory?
- because Vite JS cannot import `.html` files without using hack or plugin
    - an error would be thrown 
    - Vite JS only can import html as js string
    - or import as raw by appending `?raw` to src path
- thus html page files must reside in `/public` instead along side with js code in `/src`
 -->
Why `.html` pages are imported with `?raw`
- because Vite JS cannot import `.html` files without using hack or plugin
    - an error would be thrown 
```
[plugin:vite:import-analysis] Failed to parse source for import analysis because the content contains invalid JS syntax. You may need to install appropriate plugins to handle the .html file format, or if it's an asset, add "**/*.html" to `assetsInclude` in your configuration.
```
- Vite JS can only load html data from `/public` as static assets
    - or import html data from `/src` as js string
        - e.g. import as raw by appending `?raw` to src path
    - or `/*.html`, but SPA style will only use 1 i.e. `/index.html` as entry point

- `/src` dir is for placing source code of app, and for import analysis, if any
    - including `*.js` module files and `*.css` files
    - files will be bundled and minimized
    - random files name will be generated after building it for on production
- files in the `/public` dir will not be bundled nor alter after building for production
    - filename.html is persisted and remain the same, 
    - allowing it to be loaded dynamically via js code `fetch` (to load them as resources)

- but to group and better organize `*.html` and `*.js` files, both are place into `/src`
- thus `/src/**/*.html` data load as js string via `?raw` module 
    - otherwise `*.html` files must either reside in `/public` as static asset be loaded on runtime e.g. via `fetch`



Why not just place js code and `<script>` tag in the partial html files as well
- all partial html pages `/public/**/*.html` are loaded via `fetch` and `innerHTML` into page when navigate upon
- any js code and `<script>` came from it will not be executed nor loaded by browser (for security purpose)
- thus `*.js` code still need to be imported
    - but will be imported dynamically on runtime (based on the navigated page)


## Known limitation

When pages are loaded as SPA style
- any dynamically imported `*.js` module is imported once only
    - no manual deduplication logic is needed
    - module code and state is persisted across pages, unless manually reload the page
- but the partial html pages `*.html` is always converted into new fresh DOM and injected every time
    - state of partial html is not persisted
    - resulting in inconsistent state of partial DOM elements and js code

- inconsistent state of partial DOM elements and js code are inevitable, unles js code logic account SPA behavior
- the workaround is to change SPA loading style to hybraid MPA loading style
    - page is reloaded via `reload` instead of injecting dynamically via `fetch` for each page navigation
    - setting in `main.js` -> `window.onpopstate`