const repoOwner = 'bigmonmulgrew';
const repoName = 'Pathfinder-Public-Guides';
let currentPath = '';

// When the user scrolls down 20px from the top of the document, show the button
window.onscroll = function() {scrollFunction()};

function scrollFunction() {
  if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
    document.getElementById("topBtn").style.display = "block";
  } else {
    document.getElementById("topBtn").style.display = "none";
  }
}

// When the user clicks on the button, scroll to the top of the document
function topFunction() {
  document.body.scrollTop = 0; // For Safari
  document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
}

function getRepoContents(path = '') {
    currentPath = path;
    document.getElementById('loader').style.display = 'block';
    axios.get(`https://api.github.com/repos/${repoOwner}/${repoName}/contents/${path}`)
        .then(function (response) {
            const fileList = document.getElementById('file-list');
            fileList.innerHTML = '';
            const breadcrumb = document.getElementById('breadcrumb');
            breadcrumb.innerHTML = '';
            response.data.forEach(function(item) {
                if (item.name.startsWith('.')) {
                    return;
                }

                const itemElement = document.createElement('p');
                if (item.type === 'dir') {
					itemElement.textContent = `${item.name}`;
					itemElement.className = 'folder-icon';  // Add this line
					itemElement.style.cursor = 'pointer';
					itemElement.onclick = function() {
						getRepoContents(item.path);
					};
				} else if (item.type === 'file' && item.download_url) {
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
					}
					itemElement.appendChild(itemLink);
				}

                fileList.appendChild(itemElement);
            });

            // Build the breadcrumb
			const parts = currentPath.split('/');
			let path = '';
			parts.forEach((part, index) => {
				const currentPathPart = path + part;
				const partElement = document.createElement('span');
				partElement.textContent = part + (index < parts.length - 1 ? ' / ' : '');
				partElement.style.cursor = 'pointer';
				partElement.onclick = function() {
					getRepoContents(currentPathPart);
				};
				breadcrumb.appendChild(partElement);
				path += part + '/';
			});

            document.getElementById('loader').style.display = 'none';
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
    viewer.innerHTML = `<iframe src="${url}" width="100%" height="100%"></iframe>`;
}

getRepoContents();
