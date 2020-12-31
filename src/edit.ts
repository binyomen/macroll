window.addEventListener('load', () => {
    const moduleName = window.location.hash.slice(1);
    document.getElementById('heading')!.innerText = `Editing '${moduleName}'`;
});
