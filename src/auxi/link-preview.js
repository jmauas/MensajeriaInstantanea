import linkPreviewGenerator from 'link-preview-generator';

export const  getLink = async (url) => {
    try {
        if (url!='' && url!=null) {
            url = url.toLowerCase();
            if (url.indexOf('http')>-1 || url.indexOf('.com')>-1 || url.indexOf('www')>-1) {
                if (url.indexOf('http')==-1) url = 'http://'+url; 
                const previewData = await linkPreviewGenerator(url);
                if (typeof previewData === 'object'){
                    if (previewData.title!='' && previewData.title!=undefined && previewData.title!=null) {
                        return renderPreview(previewData, url);
                    }else {
                        if (previewData.img!=null && previewData.img!='') {
                            const previewData2 = await linkPreviewGenerator(url);
                            if (previewData2.title!='' && previewData2.title!=undefined) {
                                return renderPreview(previewData2, url);
                            } else {
                                return '';
                            }
                        } else {
                            return '';
                        }
                    }
                }else {
                    return '';
                }
            } else {
                return '';
            }
        } else {
            return '';
        }
    } catch (err) {
        console.log(`ERROR CON ${url}: ${err}`)
        return '';
    }
}


const renderPreview = (previewData, url) => {
    let html = `
        <div class="preview-container">
            <div class="preview-data">`;
                if (previewData.img==null || previewData.img=='') {
                    if (previewData.favicon==null || previewData.favicon=='') {
                        html +=`
                        <a href="${url}" target="_blank">
                            <div class="img-container">
                                <img class="img" src="${previewData.favicon}"/>
                            </div>
                        </a>`;
                    } else {
                        html +=`
                            <a href="${url}" target="_blank" class="btn btn-lg btn-primary text-white m-5"><i class="bi bi-arrow-right-square"></i> Visitar Link</a>
                        `;
                    }
                } else {
                    html +=`
                        <a href="${url}" target="_blank">
                            <div class="img-container">
                                <img class="img" src="${previewData.img}"/>
                            </div>
                        </a>`;
                }
                html +=`
                    <a href="${url}" target="_blank" style="text-decoration: none; color:black;">
                        <div class="text-container">
                            <span class="domain">${previewData.domain}</span>
                            <span class="header">${previewData.title}</span>
                            <span class="description">${previewData.description}</span>
                        </div>
                    </a>
            </div>
        </div>`;
    return html;
}