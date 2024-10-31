module.exports = function parseString(string, data) {
	return string.replace(/\{([^\}]+)\}/g, (match, path) => {
		let keys = path.split('.');
		let value = data;

		for (let key of keys) {
			value = value[key];
			if (value === undefined) {
				return match;
			}
		}

		return value;
	});
}