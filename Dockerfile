FROM ubuntu:latest
MAINTAINER k_kanou

RUN apt-get update \
  && apt-get install python3 python3-pip curl git sudo cron -y \
  && apt-get clean \
  && rm -rf /var/lib/apt/lists/*

# Install build tools
RUN apt-get update && \
    apt-get install -y wget git build-essential unzip

WORKDIR /usr/local/src/


# Add our code
ADD ./webapp /opt/webapp/
WORKDIR /opt/webapp


# Install dependencies
ADD ./webapp/requirements.txt /tmp/requirements.txt
RUN pip3 install --upgrade pip
RUN pip3 install -qr /tmp/requirements.txt


# Run the app.  CMD is required to run on Heroku
# $PORT is set by Heroku			
CMD gunicorn --bind 0.0.0.0:$PORT wsgi
