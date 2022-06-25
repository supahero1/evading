build:
	$(MAKE) -C ../client/
	$(MAKE) -C ../map_editor/
	rm -f /etc/systemd/system/evading_website.service
	install evading_website.service /etc/systemd/system/
	systemctl enable evading_website
	systemctl restart evading_website

light:
	systemctl restart evading_website
