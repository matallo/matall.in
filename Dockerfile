FROM jekyll/jekyll:latest
MAINTAINER Carlos Matallín Civera <matallo@gmail.com>

RUN apk update && apk upgrade && \
    echo @edge http://nl.alpinelinux.org/alpine/edge/community >> /etc/apk/repositories && \
    echo @edge http://nl.alpinelinux.org/alpine/edge/main >> /etc/apk/repositories && \
    apk add --no-cache \
    chromium@edge=~73.0.3683.103 \
    nss@edge \
    freetype@edge \
    freetype-dev@edge \
    harfbuzz@edge \
    ttf-freefont@edge \
    automake \
    autoconf \
    nasm \
    && rm -rf /var/cache/* \
    && mkdir /var/cache/apk

ENV GEM_HOME="/usr/local/bundle"
ENV PATH $GEM_HOME/bin:$GEM_HOME/gems/bin:$PATH
ENV PUPPETEER_EXECUTABLE_PATH /usr/bin/chromium-browser
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD true
ENV APP_HOME /matall.in

RUN mkdir $APP_HOME
WORKDIR $APP_HOME
RUN gem install bundler
RUN npm install -g yarn
RUN yarn global add gulp-cli
COPY Gemfile* $APP_HOME/
RUN bundle install --path vendor/bundle
COPY package.json $APP_HOME/
COPY yarn.lock $APP_HOME/
RUN yarn install
COPY . $APP_HOME

COPY docker-entrypoint.sh /usr/bin/
RUN chmod +x /usr/bin/docker-entrypoint.sh
ENTRYPOINT ["docker-entrypoint.sh"]
EXPOSE 9000

CMD ["yarn", "build"]
