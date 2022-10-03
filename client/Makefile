build:
	google-closure-compiler -O ADVANCED --js main.js --js_output_file main.min.js --assume_function_wrapper
	echo "!function(){" > main.min2.js
	tr -d '\n' < main.min.js >> main.min2.js
	echo "}()" >> main.min2.js
	tr -d '\n' < main.min2.js > main.min.js
	rm -f main.min2.js
	cd .. && npx postcss ./client/style.css > ./client/style.min.css
