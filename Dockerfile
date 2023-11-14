# GitHub Pages use Ruby 2.7.4 as its dependency (https://pages.github.com/versions/)
FROM ruby:2.7.4

WORKDIR /app
COPY Gemfile* ./
RUN bundle install

CMD ["/bin/bash", "-c", \
     "bundle && bundle exec jekyll serve --livereload --host 0.0.0.0"]
