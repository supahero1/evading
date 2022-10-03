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
	ufw default reject incoming
	ufw allow 22

.PHONY: website
website: prepare
	npm i -g google-closure-compiler
	npm install cssnano postcss postcss-cli --save-dev
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

	cd /tmp; \
	git clone https://github.com/supahero1/shnet
	$(MAKE) -C /tmp/shnet install DEBUG=1

	cd /tmp; \
	git clone https://github.com/madler/zlib --depth 1 --branch v1.2.11; \
	cd zlib; \
	./configure
	$(MAKE) -C /tmp/zlib
	$(MAKE) -C /tmp/zlib install
	
	cd /tmp; \
	git clone https://github.com/warmcat/libwebsockets; \
	cd libwebsockets; \
	mkdir build; \
	cd build; \
	cmake .. -DDISABLE_WERROR=ON; \
	make -j6; \
	sudo make install

	cd /usr/local/lib; \
	ldconfig
	cd /usr/local/lib64; \
	ldconfig

	ufw allow 80
	ufw allow 443
	snap install core
	snap refresh core
	snap install --classic certbot
	ln -sf /snap/bin/certbot /usr/bin/certbot
	echo "$(SERVER_NAME)" | certbot certonly -m balcerakfranciszek@gmail.com --agree-tos --standalone
	ufw deny 80
	ufw deny 443

	rm -f /etc/ufw/after.rules
	cp -f $(DIR_TOP)/after.rules /etc/ufw/after.rules
	ufw reload

	$(MAKE) -C $(DIR_TOP)/server
