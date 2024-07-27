# StuartSul.github.io_src

Source code for `StuartSul.github.io` (`stuartsul.com`).

## Develop

Simply use the Dockerfile provided as a dev environment.

Build with the following command:

```bash
docker build -t jekyll .
```

Run the environment with the following command:

```bash
docker run --rm -p 4000:4000 -p 35729:35729 --name jekyll -v "$PWD":/app jekyll
```

Now, the website will be accessible at `0.0.0.0:4000`.

## Deploy

Run the following command:

```bash
docker build -t jekyll .
docker run --rm --name jekyll -v "$PWD":/app jekyll /bin/bash -c "cd /app && bundle && bundle exec jekyll build"
```

Now, the build artifact will be available at `./_site`.

## CI/CD

This repository automatically pushes the build artifacts to GitHub Pages repository through GitHub Actions. Details available at `.github/workflows/build-deploy.yaml`.

# Special Thanks

Even though I wrote most of the HTML/CSS, the following helped me greatly.

- Dr. Tae Jun Ham's personal webpage ([https://taejunham.github.io/](https://taejunham.github.io/))
- Resume template by Joel Glovier ([https://github.com/jglovier/resume-template](https://github.com/jglovier/resume-template))
