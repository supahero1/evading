DIR_TOP   := $(shell pwd)

ifndef WEBSITE_NAME

.PHONY: first
first:
	@echo "WEBSITE_NAME is not present"
	exit 1

endif

ifndef SERVER_NAME

.PHONY: first
first:
	@echo "SERVER_NAME is not present"
	exit 1

endif

ifndef SECURE_WEBSITE

.PHONY: first
first:
	@echo "SECURE_WEBSITE is not present"
	exit 1

endif

ifndef SECURE_SERVER

.PHONY: first
first:
	@echo "SECURE_SERVER is not present"
	exit 1

endif

ifdef SERVER_NAME
ifdef WEBSITE_NAME
ifdef SECURE_WEBSITE
ifdef SECURE_SERVER

.EXPORT_ALL_VARIABLES:

ifeq ($(SECURE_WEBSITE),1)
SECURE_WEBSITE_CHAR := s
else
SECURE_WEBSITE_CHAR := 
endif

ifeq ($(SECURE_SERVER),1)
SECURE_SERVER_CHAR := s
else
SECURE_SERVER_CHAR := 
endif

.PHONY: sed
sed:
	$(DIR_TOP)/sed_in

.PHONY: prepare
prepare:
	apt install npm nodejs net-tools -y
	npm i n -g
	n latest
	echo "y" | ufw enable
	ufw allow 22

.PHONY: website
website: prepare
	npm i -g google-closure-compiler
	$(DIR_TOP)/sed_in
	cd $(DIR_TOP)/website; \
	npm i express
ifeq ($(SECURE_WEBSITE),1)
	ufw allow 443
else
	ufw allow 80
endif
	$(MAKE) -C $(DIR_TOP)/website

.PHONY: server
server: prepare
	$(DIR_TOP)/sed_in
	ufw allow 80
	ufw allow 443
	cd /tmp; \
	git clone https://github.com/supahero1/shnet
	$(MAKE) -C /tmp/shnet install DEBUG=1
	npm i yarn -g
	cd $(DIR_TOP)/server; \
	yarn add uWebSockets.js@uNetworking/uWebSockets.js\#v20.10.0
	snap install core
	snap refresh core
	snap install --classic certbot
	ln -sf /snap/bin/certbot /usr/bin/certbot
	echo "$(SERVER_NAME)" | certbot certonly -m balcerakfranciszek@gmail.com --agree-tos --standalone
	ufw deny 80
	ufw deny 443
	ufw allow 8191
	iptables -A INPUT -p tcp --syn --dport 8191 -m connlimit --connlimit-above 1 --connlimit-mask 32 -j REJECT --reject-with tcp-reset
	$(MAKE) -C $(DIR_TOP)/server

endif
endif
endif
endif

