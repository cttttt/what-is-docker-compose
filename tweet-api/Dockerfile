FROM ubuntu:18.04
RUN apt-get update && apt-get install -y nodejs npm curl build-essential
RUN npm install -g npm@6.2.0
RUN npm install -g n
RUN rm /usr/bin/node
RUN n 8.11.3
RUN useradd -m node
COPY package.json /home/node/package.json
RUN chown node ~node
USER node
RUN cd /home/node && npm install
USER root
COPY . /home/node
RUN chown -R node ~node
WORKDIR /home/node
ENV PORT 8080
USER node
CMD [ "npm", "start" ]
