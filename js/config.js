var DR = DR || {};
DR.BroenGallery = {};

DR.BroenGallery.config = {
    jsonDataUrl: '/diebruecke/_design/b2/_list/getDatajsonPersonwithMedia/personwithmedia/',
    jsonDataTestUrl: 'http://socialbld01.net.dr.dk/broen/test.json',

    votingEnabled: true,
    voteEndpoint: 'Quickpoll/front/vote',

    faces: {
        url: 'img/faces/',
        size: 80
    }
};

var host = document.location.host;
if(host == 'www.dr.dk') {
    DR.BroenGallery.config.jsonDataUrl = '/tjenester/broen2/data.json';
    DR.BroenGallery.config.faces.url   = '/tjenester/broen2/ansigter/';
}