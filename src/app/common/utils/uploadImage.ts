export function customUpload(url) {
  return (blobInfo, success, failure) => {
    let xhr: XMLHttpRequest;
    let formData: FormData;
    xhr = new XMLHttpRequest();
    xhr.withCredentials = false;
    xhr.open('POST', url);
    xhr.onload = () => {
      let json;
      if (xhr.status !== 200) {
        failure('HTTP Error: ' + xhr.status);
        return;
      }
      json = JSON.parse(xhr.responseText);
      if (!json || typeof json.data !== 'string') {
        failure('Invalid JSON: ' + xhr.responseText);
        return;
      }
      success(json.data);
    };
    formData = new FormData();
    formData.append('file', blobInfo.blob(), blobInfo.filename());
    xhr.send(formData);
  };
}
