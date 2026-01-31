// js code here will be loaded first for all .html page under /page/**/ dir and all sub dir

export default function main(appBody) {
    console.log('1st generic shared code for all /page/**/*.html');
    console.log({ 'document.readyState': document.readyState });

    console.log("sessionStorage['auth__']", sessionStorage['auth__']);

    if (sessionStorage['auth__'] === '0') {
        throw new Error('test auth fail');
    }

}