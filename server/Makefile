COREF := -Wall -Werror -march=native -flto -fuse-linker-plugin -ffat-lto-objects -lm -pthread -lshnet -lwebsockets
FLAGS := -O3 -g3 -ggdb $(COREF)
DEBUG := -Og -g3 -ggdb $(COREF)

.PHONY: build
build:
	gcc ws.c main.c grid.c consts.c commands.c areas/*.c -o main $(FLAGS) || exit

	rm -f /etc/systemd/system/evading_server.service
	install evading_server.service /etc/systemd/system/
	systemctl daemon-reload
ifneq ($(RUN),0)
	systemctl enable evading_server
	systemctl restart evading_server
else
	systemctl stop evading_server
	systemctl disable evading_server
endif
	rm -f /etc/systemd/system/evading_server_js.service
	install evading_server_js.service /etc/systemd/system/
	systemctl daemon-reload
	systemctl enable evading_server_js
	systemctl restart evading_server_js

.PHONY: debug
debug:
	gcc ws.c main.c grid.c consts.c commands.c areas/*.c -o main $(DEBUG) || exit

	rm -f /etc/systemd/system/evading_server.service
	install evading_server.service /etc/systemd/system/
	systemctl daemon-reload
ifneq ($(RUN),0)
	systemctl enable evading_server
else
	systemctl disable evading_server
endif
	systemctl stop evading_server
	rm -f /etc/systemd/system/evading_server_js.service
	install evading_server_js.service /etc/systemd/system/
	systemctl daemon-reload
	systemctl enable evading_server_js
	systemctl restart evading_server_js
ifneq ($(RUN),0)
	valgrind --track-origins=yes --leak-check=full --show-leak-kinds=all ./main
endif
