FROM ubuntu

# Install nginx
RUN apt-get update && apt-get install -y nginx

# Set things up so that when it starts up, it does not daemonize.
RUN printf "daemon off;\nerror_log /dev/stderr info;\n" >> /etc/nginx/nginx.conf

RUN rm /etc/nginx/sites-available/* /etc/nginx/sites-enabled/*
COPY etc/nginx/sites-available/* /etc/nginx/sites-available/
COPY var/www /var/www
RUN bash -c 'for file in /etc/nginx/sites-available/*; do ln -s "../sites-available/$(basename "$file")" "${file/sites-available/sites-enabled}"; done'

CMD [ "/usr/sbin/nginx" ]

EXPOSE 80
