# Custom Single Page App with PWA

build tools:
* ViteJS -> Vanilla JS

without relying any front-end framework that shipped and run on client-side browser, custom built SPA + MPA hybraid app

# Explanation of App's Structure:

pages and .html files:
- 1st and only 1 entry point is `index.html`
- any other pages are treated as partial html
- all pages are `.html` files


pages logic:
- pages are consist of 1 partial `.html` file and `.js` file
    - partial `.html` file will be injected into body part of `/index.html` on page navigation or changes
- both (html,js) files will be automatically imported and loaded via es-module
- each html page file is in `/public/page/*` directory
- page (html,js) files must be group into a sub directory under `/public/page/(page_name)` directory 
    - e.g. `/public/page/page_name/(*.html)`
- both (html,js) files must be directly below a `page_name` directory
- both (html,js) files must be named `_` underscore; e.g. `_.html` and `_.js`
- ( URL -> pathname ) is derived from a virtual path which is place in after `location.hash`
    - e.g. `http://localhost/#/abs-path` then the virtual path will be `/abs-path`


## Reason of deisgn

Goal of design:
- a single template html on root `/` and serve as custom router
- 1 page, 1 partial html file, 1 js file correspondingly
- partial resources will be injector into template body
- template `index.html` is the general sturcture of html 
- template host and contains the shared styles.css and main.js


Why use `location.hash` as the URI path?
- this is designed to persists the navigated pages URL into browser history
    - but web app that is designed in SPA style would need to manually set and manipulate the path and history API
- it is difficult and error prompt
- i tried and tested extensively, but found that using `location.pathname` in a SPA to be incompatible in different scenario and environment
    - i.e. in local dev server  vs  local preview server  vs  production (e.g. Github Pages);
    - the bundled resources (in `/src/**/*`) filename cannot be determined and loaded dynamically
    - the actual root (home page) cannot be determined in production env like GitHub Pages, unless hard coded in,
    - making it imposible to set the correct path into browser history properly;
    - initial load on the wrong path or than the actual home page would cause error and failed
- thus, virtual path is used; `location.hash` is used to host the actual path for SPA to load partial html page

<!-- this has been outcome, workaround is to import partial html files and es-module rather than public resources -->
<!-- Why `.html` pages are place separately in `/public` directory?
- because Vite JS cannot import `.html` files without using hack or plugin
    - an error would be thrown 
    - Vite JS only can import html as js string
```
[plugin:vite:import-analysis] Failed to parse source for import analysis because the content contains invalid JS syntax. You may need to install appropriate plugins to handle the .html file format, or if it's an asset, add "**/*.html" to `assetsInclude` in your configuration.
```
- `/src` dir is for placing source code of app, and for import analysis, if any
    - including `*.js` module files and `*.css` files
    - files will be bundled and minimized
    - random files name will be generated after building it for on production
- files in the `/public` dir will not be bundled nor alter after building for production
    - filename.html is persisted and remain the same, 
    - allowing it to be loaded dynamically via js code `fetch` (to load them as resources)
- thus html page files must reside in `/public` instead along side with js code in `/src`

Why not just place js code and `<script>` tag in the partial html files as well
- all partial html pages `/public/**/*.html` are loaded via `fetch` and `innerHTML` into page when navigate upon
- any js code and `<script>` came from it will not be executed nor loaded by browser (for security purpose)
- thus `*.js` code still need to be imported
    - but will be imported dynamically on runtime (based on the navigated page) -->


## Known limitation

When pages are loaded as SPA style
- all dynamically imported `_.js` module of page is imported *once* only
    - no manual deduplication logic is needed
    - module code and state is persisted across pages, unless manually reload the page
- but the partial html pages `*.html` is always converted into new fresh DOM and injected every time
    - state of partial html is not persisted
    - resulting in inconsistent state of partial DOM elements and js code
- thus, js code logic that need re-run everytime must be wrapped in a `default` exported function, i.e a main function
    - especially DOM manipulation and `addEventListner` logic
- and, all global variables and listener are discourage and must cleanup it self
    - e.g. `document.body` will not change and persist across pages, 
    - using code such as `document.addEventListener` would cause problem when pages are navigated back-and-forward

inconsistent loading HTML elements loading sequence between DOM and js code are inevitable, unless all js code logic account SPA behavior
- the workaround is to change SPA loading style to hybraid MPA loading style
    - page is reloaded via `reload` instead of injecting dynamically via `fetch` for each page navigation
    - setting in `main.js` -> `window.onpopstate`