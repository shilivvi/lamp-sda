@@include('html.js');

let colorPicker = '';
let curMode = '';
let allModes = '';

let defaultColor = '#f00';
let defaultSpeed = 32765;
let defaultBr = 150;

window.addEventListener('DOMContentLoaded', () => {

  //hack svg sprite
  getSvgSprite( 'https://test-wp.proykey.by/wp-content/themes/sda-lamp2/src/img/sprite.svg' );

  document.querySelector('body').insertAdjacentHTML('afterbegin', html);

  //get defaults settings
  getVal( 'defaults' )
    .then( data => {
      //data = '65280;3530;255;0;0,1,2,3;16777215,16777215,16777215,16777215,16777215';
      const splitStr = data.split(';')

      defaultColor = decToRgb( parseInt(splitStr[0], 10) )
      defaultSpeed = splitStr[1]
      defaultBr = splitStr[2]
      curMode = parseInt(splitStr[3])

      initRowDefaultColors( splitStr[5].split(',') )
      initPowerBtn( splitStr[6] )

      setDefaultSettings()
      displayCurColor(parseInt(splitStr[0], 10))
      initHeaderNav()
      initFavoritePopup()

      getVal( 'modes' )
        .then( data => {
          //data = 'Статичный,Моргание,Дыхание,Сдвиг,Сдвиг обратный,Сдвиг случайный,Случайный цвет,Радуга,Радуга колесо,Сканер,Двойной сканер,Бегущие огни,Мерцание,Разряды,Стробоскоп,Мульти стробоскоп,Змейка случаный,Змейка радуга,Цветовой свайп случайный,Комета,Салют,Салют случайный,#ЯБАТЬКА&#128104;&#8205;&#129459;,БЧБ&#128015;,САЛО&#128055;,Mr.Putin&#128526;,'
          allModes = data.split(',')
          initRowDefaultModes( splitStr[4].split(',') )
          initModesPage()
        })
    })

});

function setDefaultSettings(){

  /* colorPicker */
  colorPicker = new iro.ColorPicker("#picker", {
    width: 330,
    color: {
      r: defaultColor[0], 
      g: defaultColor[1], 
      b: defaultColor[2],
      alpha: 1
    }
  })

  colorPicker.on('input:end', function(color){
    const rgb = color.rgb
    const selectedColor = rgb['r'] * 65536 + rgb['g'] * 256 + rgb['b']
    submitVal('c', selectedColor)
    displayCurColor(rgb['r'] * 65536 + rgb['g'] * 256 + rgb['b'])
  })
  colorPicker.on('input:change', function(color){
    setRGBForm(colorPicker.color.rgb)
  })

  setRGBForm(colorPicker.color.rgb)
  initEventRGBForm()

  //imageData.data[0] * 65536 + imageData.data[1] * 256 + imageData.data[2];

  /* sliders brightness init */
  const brightnessSlider = document.querySelector('#brightness')
  brightnessSlider.value = parseInt(defaultBr)
  const brightnessValue = brightnessSlider.value
  brightnessSlider.style.background = `linear-gradient(to right, #1083ff, #1083ff ${brightnessValue/2.55}%, #ccc ${brightnessValue/2.55}%)`;

  /* sliders speed init  */
  const speedSlider = document.querySelector('#speed')
  speedSlider.value = parseInt(defaultSpeed)
  const speedValue = speedSlider.value
  speedSlider.style.background = `linear-gradient(to right, #1083ff, #1083ff ${speedValue/655.35}%, #ccc ${speedValue/655.35}%)`;
}

function initHeaderNav(){
  const headerItems = document.querySelectorAll('.header__item')
  headerItems.forEach( item => {
    item.addEventListener('click', (e) => {
      e.preventDefault()
      if( item.hasAttribute('data-menu') ){
        if( item.dataset.menu == 'settings' ){
          window.open('/_ac', '_self')
        }
        document.querySelectorAll('.active-menu').forEach( activeMenu => activeMenu.classList.remove('active-menu') )
        document.querySelector(`.${item.dataset.menu}`).classList.add('active-menu')
      }
    })
  })
}
// init favorite colors 
function initRowDefaultColors(colors){
  const items = document.querySelectorAll('#favorite-colors .colors-rgb__item')

  //set colors from default settings 
  colors.forEach( (color, index) => {
    if(color != '0'){
      const rgb = decToRgb( parseInt(color, 10) );
      const element = items[index];

      element.style.background = `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`
      element.classList.add('colors-rgb__item--set')
      element.dataset.color = color
    }    
  })

  //set events (press, long press)
  items.forEach( (item, index) => {

    const clickFunction = () => {
      if( !item.hasAttribute('data-color') ){
        const rgb = colorPicker.color.rgb
        item.style.background = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`
        item.classList.add('colors-rgb__item--set')
        item.dataset.color = rgb.r * 65536 + rgb.g * 256 + rgb.b
        submitVal(`fc${index+1}`, item.dataset.color)
      }else{
        const color = item.dataset.color
        const rgb = decToRgb( parseInt(color, 10) );
        submitVal('c', color)
        colorPicker.color.rgb = { r: rgb[0], g: rgb[1], b: rgb[2] }
        setRGBForm({ r: rgb[0], g: rgb[1], b: rgb[2] })
        displayCurColor(color)
      }
    }

    const longPressFunction = () => {
      if( item.hasAttribute('data-color') ){
        const popup = document.querySelector('.favorite-popup')
        popup.dataset.row = 'color'
        popup.dataset.col = index
        popup.classList.add('favorite-popup--active') 
      }else{
        const rgb = colorPicker.color.rgb
        item.style.background = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`
        item.classList.add('colors-rgb__item--set')
        item.dataset.color = rgb.r * 65536 + rgb.g * 256 + rgb.b
        submitVal(`fc${index+1}`, item.dataset.color)
      }
    }

    longPressEvent(item, clickFunction, longPressFunction);

  })
}
// init favorite modes
function initRowDefaultModes(modes){
  const items = document.querySelectorAll('#favorite-modes .modes-rgb__item')

  modes.forEach( (mode, index) => {
    if(mode != '?' && mode < allModes.length){
      const $el = items[index]
      $el.querySelector('.modes-rgb__name').innerHTML = allModes[mode]
      $el.dataset.mode = mode
      $el.classList.add('modes-rgb__item--set')
    }
  })

  items.forEach( (item, index) => {

    const clickFunction = () => {
      if( !item.hasAttribute('data-mode') ){
        if( curMode != '' ){
          item.dataset.mode = curMode
          item.querySelector('.modes-rgb__name').innerHTML = allModes[curMode]
          item.classList.add('modes-rgb__item--set')
          submitVal(`fm${index+1}`, curMode)
        }
      }else{
        const mode = item.dataset.mode
        curMode = mode
        submitVal('m', mode)
        displayCurMode()
      }
    }

    const longPressFunction = () => {
      if( item.hasAttribute('data-mode') ){
        const popup = document.querySelector('.favorite-popup')
        popup.dataset.row = 'mode'
        popup.dataset.col = index
        popup.classList.add('favorite-popup--active') 
      }else{
        if( curMode != '' ){
          item.dataset.mode = curMode
          item.querySelector('.modes-rgb__name').innerHTML = allModes[curMode]
          item.classList.add('modes-rgb__item--set')
          submitVal(`fm${index+1}`, curMode)
        }
      }
    }

    longPressEvent(item, clickFunction, longPressFunction);

  })

}
// init favorite popup
function initFavoritePopup(){
  const popup = document.querySelector('.favorite-popup')
  const wrap = document.querySelector('.favorite-popup__wrap')
  const btn = popup.querySelector('.favorite-popup__row')

  const closePopup = () => {
    popup.removeAttribute('data-row')
    popup.removeAttribute('data-col')
    popup.classList.remove('favorite-popup--active')
  }

  wrap.addEventListener('click', closePopup)

  btn.addEventListener('click', (e) => {
    e.stopPropagation()

    const row = popup.dataset.row
    const col = popup.dataset.col

    if( row == 'color' ){
      const elem = document.querySelectorAll('#favorite-colors .colors-rgb__item')[col]
      elem.style.background = ''
      elem.classList.remove('colors-rgb__item--set')
      elem.removeAttribute('data-color')
      submitVal(`fc${parseInt(col)+1}`, '000000')
    }

    if( row == 'mode' ){
      const elem = document.querySelectorAll('#favorite-modes .modes-rgb__item')[col]
      elem.classList.remove('modes-rgb__item--set')
      elem.removeAttribute('data-mode')
      submitVal(`fm${parseInt(col)+1}`, '?')
    }

    closePopup()
  })

}

function initPowerBtn(status){
  //console.log(status)
  const powerBtn = document.querySelector('.power-btn')

  if( parseInt(status) == 1 ){
    powerBtn.classList.toggle('on')
    powerBtn.dataset.on = 'on'
  }

  powerBtn.addEventListener('click', () => {
    powerBtn.classList.toggle('on')
    if( powerBtn.hasAttribute('data-on') ){
      powerBtn.removeAttribute('data-on')
      submitVal('stat', '0')
    }else{
      powerBtn.dataset.on = 'on'
      submitVal('stat', '1')
    }
  })
}

function initModesPage(){
  const wrap = document.querySelector('.modes__wrap')
  const tpl = document.querySelector('#modes-item')

  allModes.forEach( (mode, index) => {
    if(mode != ''){
      const elem = tpl.content.cloneNode(true)
      elem.querySelector('.modes__item').dataset.mode = index
      elem.querySelector('.modes__name').innerHTML = mode
      wrap.append(elem)
    }    
  })

  document.querySelectorAll('.modes .modes__item').forEach( item => {
    item.addEventListener('click', (e) => {
      e.preventDefault()
      if( item.hasAttribute('data-mode') ){
        const mode = item.dataset.mode
        curMode = mode
        submitVal('m', mode)
      }
      displayCurMode()
    })
  })

  displayCurMode()
}


//call always when change brightness
function brightnessSliderChanged(e){
	let br = e.value; // brightness
	e.style.background = `linear-gradient(to right, #1083ff, #1083ff ${br/2.55}%, #ccc ${br/2.55}%)`;
}
//call when change brightness is end
function changeEventBrightnessSlider(e){
  let br = e.value; // brightness
  submitVal('b', br);
}


//call always when change speed
function speedSliderChanged(e){
	let sp = e.value; // speed
	e.style.background = `linear-gradient(to right, #1083ff, #1083ff ${sp/655.35}%, #ccc ${sp/655.35}%)`;  
}
//call when change speed is end
function changeEventSpeedSlider(e){
  const delta = e.max - e.value
  if( delta <= 0 ){
    submitVal('s', 1)
    return
  }
  if( delta >= e.max ){
    submitVal('s', e.max)
    return
  }
  submitVal('s', delta);
}


function setRGBForm(color){
  const redInput = document.querySelector('.picker-rbg__form input[name="red"]')
  const greenInput = document.querySelector('.picker-rbg__form input[name="green"]')
  const blueInput = document.querySelector('.picker-rbg__form input[name="blue"]')

  redInput.value = color.r
  greenInput.value = color.g
  blueInput.value = color.b
}
function initEventRGBForm(){
  const inputs = document.querySelectorAll('.picker-rbg__form input')
  inputs.forEach( input => {
    input.addEventListener('change', () =>{
      const val = input.value

      if( val < 0 || val == ''){
        input.value = 0
      }
      if( val > 255 ){
        input.value = 255
      }

      const red = parseInt(document.querySelector('.picker-rbg__form input[name="red"]').value)
      const green = parseInt(document.querySelector('.picker-rbg__form input[name="green"]').value)
      const blue = parseInt(document.querySelector('.picker-rbg__form input[name="blue"]').value)
      const selectedColor = red * 65536 + green * 256 + blue
      
      colorPicker.color.rgb = { r: red, g: green, b: blue }
      submitVal('c', selectedColor)
      displayCurColor(selectedColor)
    })
  })  
}
function displayCurMode(){
  const $elem = document.querySelectorAll(`[data-mode="${curMode}"]`)

  if( $elem.length <= 0 ){
    return
  }

  document.querySelectorAll('.cur-mode').forEach(item => item.classList.remove('cur-mode'))
  $elem.forEach(item => item.classList.add('cur-mode'))
}
function displayCurColor(color){
  const $elem = document.querySelector(`[data-color="${color}"]`)
  //console.log($elem)
  if( $elem == null ){
    return
  }

  document.querySelectorAll('.cur-color').forEach(item => item.classList.remove('cur-color'))
  $elem.classList.add('cur-color')
}

//GET - node|function|function
//custom event long press
function longPressEvent($nodeEl, clickFunction, longPressFunction){
  let longpress = false;
  let presstimer = null;

  let cancel = function(e) {
    if (presstimer !== null) {
      clearTimeout(presstimer);
      presstimer = null;
    }

    //this.classList.remove("longpress");
  };

  let click = function(e) {
    if (presstimer !== null) {
      clearTimeout(presstimer);
      presstimer = null;
    }

    //this.classList.remove("longpress");

    if (longpress) {
      return false;
    }

    // click function
    clickFunction()
  };

  let start = function(e) {

    if (e.type === "click" && e.button !== 0) {
      return;
    }

    longpress = false;

    //this.classList.add("longpress");

    if (presstimer === null) {
      presstimer = setTimeout(function() {

        //longpress function
        longPressFunction();

        longpress = true;
      }, 500);
    }

    return false;
  };

  $nodeEl.addEventListener("mousedown", start);
  $nodeEl.addEventListener("touchstart", start);
  $nodeEl.addEventListener("click", click);
  $nodeEl.addEventListener("mouseout", cancel);
  $nodeEl.addEventListener("touchend", cancel);
  $nodeEl.addEventListener("touchleave", cancel);
  $nodeEl.addEventListener("touchcancel", cancel);
}

@@include('request.js');
@@include('help.js');