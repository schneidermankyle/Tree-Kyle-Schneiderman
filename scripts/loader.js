Object.defineProperty(window, 'ROOT', {value: '/', writeable: false});

function include(module) {
	// Quick function for autoloading javascript scripts, in this case located in the class folder.
	// Two operations to handle strings and arrays being passed in.
	if (Object.prototype.toString.call(module) === '[object Array]') {
		for (var i = 0; i < module.length; i++) {
			append(module[i]);
		}
	} else if (typeof(module) === 'string') {
		append(module);
	}
};

function append(module) {
	$("body").append('<script src="'+ROOT+'scripts/classes/'+module+'.class.js"></script>');
};