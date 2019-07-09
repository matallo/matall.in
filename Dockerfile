FROM jekyll/jekyll:latest
MAINTAINER Carlos Matallín Civera <matallo@gmail.com>

ENV GEM_HOME="/usr/local/bundle"
ENV PATH $GEM_HOME/bin:$GEM_HOME/gems/bin:$PATH

RUN mkdir /matall.in
WORKDIR /matall.in
COPY Gemfile /matall.in/Gemfile
COPY Gemfile.lock /matall.in/Gemfile.lock
RUN gem install bundler -v '2.0.1'
RUN bundle install --path vendor/bundle
COPY package.json /matall.in/package.json
COPY yarn.lock /matall.in/yarn.lock
RUN npm install -g yarn
RUN yarn global add gulp-cli
RUN yarn install
COPY . /matall.in

COPY docker-entrypoint.sh /usr/bin/
RUN chmod +x /usr/bin/docker-entrypoint.sh
ENTRYPOINT ["docker-entrypoint.sh"]
EXPOSE 9000

CMD ["yarn", "start"]
