var DR = DR || {};
DR.BroenGallery = {};

DR.BroenGallery.config = {
    jsonDataUrl: '/blochin/_design/b3/_list/getDatajsonPersonwithMedia/personwithmedia/',

    votingEnabled: false,
    voteEndpoint: 'Quickpoll/front/vote',

    faces: {
        url: 'img/faces/',
        size: 80
    }
};

var host = document.location.host;
