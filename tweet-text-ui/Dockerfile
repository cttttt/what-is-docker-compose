FROM ubuntu:14.04
RUN apt-get update && apt-get install -y nodejs npm curl build-essential
RUN ln -s /usr/bin/nodejs /usr/bin/node
RUN npm install -g npm@3.10.8
RUN npm install -g n
RUN rm /usr/bin/node
RUN n 6.5.0
RUN useradd -m node
COPY package.json /home/node/package.json
RUN chown node ~node
RUN sudo -HE -u node bash -c 'cd ~node && npm install'
COPY . /home/node
RUN chown -R node ~node
CMD sudo -HE -u node bash -c 'cd ~node && PORT=8080 npm start'
