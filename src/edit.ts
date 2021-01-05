window.addEventListener('load', () => {
    const moduleName = window.location.hash.slice(1);

    const headerText = moduleName.length === 0 ?
        'New module' :
        `Editing '${moduleName}'`;

    document.getElementById('heading')!.innerText = headerText;
});
