build:
	gcc *.c -o main -Og -g3 -lm -march=native -ffast-math -flto -pthread -lshnet
	rm -f /etc/systemd/system/ev2_server.service
	install ev2_server.service /etc/systemd/system/
	systemctl enable ev2_server
	systemctl restart ev2_server
	rm -f /etc/systemd/system/ev2_server_js.service
	install ev2_server_js.service /etc/systemd/system/
	systemctl enable ev2_server_js
	systemctl restart ev2_server_js
