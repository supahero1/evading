build:
	$(MAKE) -C ../client/
	rm -f /etc/systemd/system/ev2_website.service
	install ev2_website.service /etc/systemd/system/
	systemctl enable ev2_website
	systemctl restart ev2_website

light:
	systemctl restart ev2_website
