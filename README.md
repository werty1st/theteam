diebruecke
==========


shrink images
find . -iname '*.jpg' -exec mogrify -resize 734x413 -quality 85 {} +; touch timestamp
find . -iname '*.jpg' -newer timestamp -exec mogrify -resize 734x413 -format png {} +; touch timestamp



//dateiname vor ext ändern
find . -name "*.jpg" -exec sh -c 'echo "$1"; echo "$(echo "$1" | sed s/.jpg\$/_s.jpg/)"' _ {} \;
//dateiname mit prefix versehen
find . -name "*.jpg" -exec sh -c 'echo "$1"; echo $(dirname $1)/s79_$(basename $1)' _ {} \;


//thumbnails erstellen
find . -name "*.jpg" -exec sh -c 'convert -resize 79x79 -quality 85 "$1" $(dirname $1)/s79_$(basename $1)' _ {} \;
//v2
find . -name "*.jpg" -exec sh -c 'convert -resize 79x79^ -gravity Center -crop 79x79+0+0 -quality 85 "$1" $(dirname $1)/s79_$(basename $1)' _ {} \;


//alles lowercase
for f in `find`; do mv -v $f `echo $f | tr '[A-Z]' '[a-z]'`; done

//laden -> login status klären
//login -> login status klären
//logout -> login status klären
//todo login auf startseite ziehen


dateinamen alle kleingeschrieben ohne leerzeichen und sonderzeichen
Video Spec:
		breite = 734;
		höhe = 413;
		H.264 / AVC;		
Fotos:
		breite = 734;
		höhe = 413;
		jpg/png


Todo:

Backend
Personen Verknüpfungen bearbeiten und mit datum versehen
übersichtseite mit enddatum der einzelnen episoden


Data.json 00-10

data0-10 einlesen, zu jeder person einen datensatz anlegen
person.text = array wenn text unterschiedlich echo"xxx"
person.longtext = array wenn text unterschiedlich echo"xxx"
image immer gleich uder per css classe
wenn person zum erstenmal erkannt wird dateiname=freischaltzeit
wenn person:_sterbezeit=wenn person.image enthält "_ude.jpg" zum ersten mal

relationen = array mit slug, name ,text, freischaltzeit

 "saga": {

    "name": "Saga Noren",
    "slug": "saga",
    "text" : array 0-5
    "longText": array 0-5
    "image": "saga.jpg",
    freischalt:
    ude

    "relations": [
      {
        "slug": "martin",
        "name": "Martin",
        "text": "Sagas politimakker i Danmark."
        freischalt
      },
     
    ],

    "media": [
      {


window.addEventListener('message', receiveMessage);
 
function receiveMessage(event) {
  if (event.origin !== 'http://sofa01.zdf.de')
    return;
 
 
  var height = parseInt(event.data) + 100;
  document.getElementById("bruecke2").height = height
}      	