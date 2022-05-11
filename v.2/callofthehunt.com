server 
	{
	listen 80;
	listen [::]:80;
	
	server_name callofthehunt.com www.callofthehunt.com;
	return 302 https://$server_name$request_uri;
	
	rewrite ^(/.*)\.html(\?.*)?$ $1$2 permanent;
	rewrite ^/(.*)/$ /$1 permanent;
	try_files $uri/index.html $uri.html $uri/ $uri =404;

	location = /robots.txt {
	alias /var/www/callofthehunt.com/html/robots.txt;
	}

	}

server {
	# SSL configuration
	listen 443 ssl http2;
	listen [::]:443 ssl http2;
	# ssl on;
	ssl_certificate /etc/ssl/certs/cert.pem;
	ssl_certificate_key /etc/ssl/private/key.pem; 

	ssl_client_certificate /etc/ssl/cloudflare.crt;
	ssl_verify_client on;	
	
	server_name callofthehunt.com www.callofthehunt.com;
	root /var/www/callofthehunt.com/html;
	index index.html index.htm index.nginx-debian.html; 

	rewrite ^(/.*)\.html(\?.*)?$ $1$2 permanent;
	rewrite ^/(.*)/$ /$1 permanent;
	try_files $uri/index.html $uri.html $uri/ $uri =404;

	location = /robots.txt { 
	alias /var/www/callofthehunt.com/html/robots.txt;
	}

}
