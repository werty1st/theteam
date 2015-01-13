require.config({
	baseUrl: "",
	paths: {
        "swipejs": "js/libs/swipe",

	},
	shim: {
		"more": {
			exports: "MooTools.More"
		},
		"swipejs": {
            exports: "Swipe"
        }
	}
});
