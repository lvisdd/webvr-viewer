#!/usr/bin/env python
# -*- coding:utf-8 -*-

from flask import Flask
from flask import abort, jsonify, Response, render_template, request

app = Flask(__name__)
# app.config['JSON_AS_ASCII'] = False

# @app.route('/')
# def hello():
#     return 'Hello world!'

@app.route('/')
def home():
  return render_template('index.html')

@app.route("/favicon.ico")
def favicon():
    return app.send_static_file("favicon.ico")

if __name__ == '__main__':
  app.run(host='0.0.0.0')
