build:
	gcc *.c areas/*.c -o main -Wall -Werror -O3 -march=native -ffast-math -flto -lm -pthread -lshnet
	rm -f /etc/systemd/system/evading_server.service
	install evading_server.service /etc/systemd/system/
	systemctl enable evading_server
	systemctl restart evading_server
	rm -f /etc/systemd/system/evading_server_js.service
	install evading_server_js.service /etc/systemd/system/
	systemctl enable evading_server_js
	systemctl restart evading_server_js
