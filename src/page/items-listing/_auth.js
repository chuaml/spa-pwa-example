// js code will be loaded first for all .html page under /page/items-listing/ dir

export default function main(appBody) {
    console.log('1st generic shared code for all /page/items-listing/*.html');
    console.log({ 'document.readyState': document.readyState });

    console.log("sessionStorage['auth__items-listing']", sessionStorage['auth__items-listing']);

    if (sessionStorage['auth__items-listing'] === '0') {
        throw new Error('test auth fail, you are not allowed to view `/items-listing/*` pages');
    }

}