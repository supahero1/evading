ifndef SERVERNAME
@echo "SERVERNAME is not present"
@exit 1
endif

ifndef WEBSITENAME
@echo "WEBSITENAME is not present"
@exit 1
endif

DIR_TOP = $(shell pwd)

.EXPORT_ALL_VARIABLES:

.PHONY: prepare
prepare:
	apt install npm nodejs net-tools
	npm i n -g
	n latest
	ufw enable
	ufw allow 443
	ufw allow 80
	$(DIR_TOP)/sed_in

.PHONY: website
website: prepare
	npm i -g google-closure-compiler
	cd $(DIR_TOP)/website; \
	npm i express
	$(MAKE) -C $(DIR_TOP)/website

.PHONY: server
server: prepare
	cd /tmp; \
	git clone https://github.com/supahero1/shnet
	$(MAKE) -C /tmp/shnet install DEBUG=1
	npm i yarn -g
	cd $(DIR_TOP)/server; \
	yarn add uWebSockets.js@uNetworking/uWebSockets.js\#v20.10.0
	iptables -A INPUT -p tcp --syn --dport 443 -m connlimit --connlimit-above 1 --connlimit-mask 32 -j REJECT --reject-with tcp-reset
	$(MAKE) -C $(DIR_TOP)/server
