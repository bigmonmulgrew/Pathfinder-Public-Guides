const repoOwner   = 'bigmonmulgrew';
const repoName    = 'Pathfinder-Public-Guides';
const repoBranch  = 'main';
const ignoreFiles = ['.gitattributes', '.gitignore', '_viewer.html', '_viewer'];
let currentPath   = '';

function createBreadcrumbElement(part, currentPathPart, index, partsLength) {
    const partElement = document.createElement('span');
    partElement.textContent = part + (index < partsLength - 1 ? ' / ' : '');
    partElement.style.cursor = 'pointer';
    partElement.onclick = function () {
        getRepoContents(currentPathPart);
    };
    return partElement;
}

function createFileElement(item) {
    const itemElement = document.createElement('p');
    const itemLink = document.createElement('a');
    itemLink.href = item.download_url;
    itemLink.target = '_blank';
    itemLink.textContent = `${item.name}`;
    itemLink.className = 'file-icon';
    const extension = item.name.split('.').pop();
    if (extension === 'txt' || extension === 'md') {
        itemLink.onclick = function (event) {
            event.preventDefault();
            viewTextFile(item.download_url);
        };
    } else if (extension === 'pdf') {  // Added separate handler for 'pdf'
        itemLink.onclick = function (event) {
            event.preventDefault();
            viewPDFFile(item.download_url);  // Call the PDF viewing function
        };
    } else if (extension === 'odt') {
		itemLink.onclick = function (event) {
			event.preventDefault();
			viewODTFile(item.download_url);
		};
	} else if (extension === 'doc' || extension === 'docx') {
        itemLink.onclick = function (event) {
            event.preventDefault();
            viewDOCFile(item.download_url);
        };
    } else if (extension === 'rtf') {
        itemLink.onclick = function (event) {
            event.preventDefault();
            viewRTFFile(item.download_url);
        };
    }
    itemElement.appendChild(itemLink);
    return itemElement;
}

function createFolderElement(item) {
    const itemElement = document.createElement('p');
    itemElement.textContent = `${item.name}`;
    itemElement.className = 'folder-icon';  // Add this line
    itemElement.style.cursor = 'pointer';
    itemElement.onclick = function () {
        getRepoContents(item.path);
    };
    return itemElement;
}

function handleResponseData(responseData) {
    const fileList = document.getElementById('file-list');
    fileList.innerHTML = '';
    const breadcrumb = document.getElementById('breadcrumb');
    breadcrumb.innerHTML = '';

    responseData.forEach(function (item) {
        if (ignoreFiles.includes(item.name) || item.name.startsWith('.')) {
            return;
        }

        const itemElement = item.type === 'dir' ? createFolderElement(item) : createFileElement(item);
        fileList.appendChild(itemElement);
    });

    const parts = currentPath.split('/');
    let path = '';
    parts.forEach((part, index) => {
        const currentPathPart = path + part;
        breadcrumb.appendChild(createBreadcrumbElement(part, currentPathPart, index, parts.length));
        path += part + '/';
    });

    document.getElementById('loader').style.display = 'none';
}

function getRepoContents(path = '') {
    currentPath = path;
    document.getElementById('loader').style.display = 'block';
    axios.get(`https://api.github.com/repos/${repoOwner}/${repoName}/contents/${path}?ref=${repoBranch}`)
        .then(function (response) {
            handleResponseData(response.data);
        })
        .catch(function (error) {
            console.log(error);
        });
}

async function viewTextFile(url) {
    try {
        const response = await axios.get(url);
        const viewer = document.getElementById('file-viewer');
        viewer.textContent = response.data;
    } catch (error) {
        console.error('Error viewing file:', error);
    }
}

function viewPDFFile(url) {
    const viewer = document.getElementById('file-viewer');
    viewer.innerHTML = `<iframe src="https://docs.google.com/viewer?embedded=true&url=${encodeURIComponent(url)}" width="100%" height="100%"></iframe>`;
}

function viewODTFile(url) {
    const viewer = document.getElementById('file-viewer'),
      odfcanvas = new odf.OdfCanvas(viewer);
	
    viewer.innerHTML = '';
    const canvas = document.createElement('canvas');
    viewer.appendChild(canvas);

	odfcanvas.load(url);
}

function viewDOCFile(url) {
    const viewer = document.getElementById('file-viewer');
    viewer.innerHTML = `<iframe src="https://docs.google.com/viewer?embedded=true&url=${encodeURIComponent(url)}" width="100%" height="100%"></iframe>`;
}

function viewRTFFile(url) {
    const viewer = document.getElementById('file-viewer');
    viewer.innerHTML = `<iframe src="https://docs.google.com/viewer?embedded=true&url=${encodeURIComponent(url)}" width="100%" height="100%"></iframe>`;
}

getRepoContents();
