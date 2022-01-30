// GET - string
// RETURN - bool
function isJson(str) {
  try {
    JSON.parse(str)
  } catch (e) {
    return false
  }
  return true
}

// GET - int
// RETURN - array
//
//Function for translate RGB value in dec max"16777215" to array[3] = R, G, B dec values
function decToRgb(value){
  const r = Math.floor(value / (256*256));
  const g = Math.floor(value / 256) % 256;
  const b = value % 256;
  return [r, g, b];
}