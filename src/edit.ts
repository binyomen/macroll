window.addEventListener('load', () => {
    const moduleName = window.location.hash.slice(1);

    const moduleNameText = moduleName.length === 0 ?
        'New module' :
        moduleName;

    const moduleNameInput = document.getElementById('module-name')! as HTMLInputElement;
    moduleNameInput.value = moduleNameText;
});
