build:
	#uglifyjs main.js -o main.min.js --compress --mangle --mangle-props --toplevel
	google-closure-compiler -O ADVANCED --js main.js --js_output_file main.min.js --assume_function_wrapper
	tr -d '\n' < main.min.js > main.min2.js
	