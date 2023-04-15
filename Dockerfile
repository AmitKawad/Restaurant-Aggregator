FROM ubuntu

WORKDIR /app

COPY package*.json ./
RUN apt-get update && apt install -y curl
RUN curl -sL https://deb.nodesource.com/setup_14.x | bash - 
RUN apt-get install -y nodejs

RUN npm install

RUN npm install -g typescript

RUN npm install -g ts-node




COPY . .

ENV PORT=3001

EXPOSE 3001

CMD [ "npm", "start" ]