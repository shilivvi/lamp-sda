function sendRequest( method, url, body = null ){
  return new Promise( (resolve, reject) => {
    const xhr = new XMLHttpRequest();
    
    xhr.onload = () => {
      if(xhr.status >= 400){
        reject(xhr.response)
      }else{
        console.log( xhr.response )
        if( isJson( xhr.response ) ){
          resolve( JSON.parse(data) )
        }else{
          resolve( xhr.response )
        }
      }
    }

    xhr.onerror = () => {
      reject(xhr.response);
    }

    xhr.open(method, url);
    xhr.send(JSON.stringify(body))
  });
}

function getVal(name){
  return new Promise( (resolve, reject) => {
    const method = 'GET'
    const url = name

    sendRequest(method, url)
      .then( data => resolve(data) )
      .catch( data => resolve(data) )
  })
}

function submitVal(name, val) {
  const method = 'GET'
  const url = `set?${name}=${val}`

  //console.log( url )

  sendRequest(method, url)
}

function getSvgSprite(url){
  const ajax = new XMLHttpRequest();
  ajax.open('GET', url, true);
  ajax.send();
  ajax.onload = function(e) {
    const div = document.createElement("div");
    div.classList.add('svg-sprite');
    div.innerHTML = ajax.responseText;
    document.body.insertBefore(div, document.body.childNodes[0]);
  }
}