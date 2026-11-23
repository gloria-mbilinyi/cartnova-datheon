# CartNova

Datheon Internship — Task 4, by Gloria Beneth Mbilinyi.

Repository: [gloria-mbilinyi/cartnova-datheon](https://github.com/gloria-mbilinyi/cartnova-datheon).

## Development status

The project foundation is initialized. The full CartNova Task 4 master brief and milestone plan have not yet been supplied in this chat or its attachments. Feature implementation and production deployment will follow that brief when it is available.

## Run locally

Install [Node.js](https://nodejs.org/) 24 or later, then run:

```sh
npm run dev
```

Open `http://127.0.0.1:4373`. No dependencies, API keys, or paid services are required for this foundation.

## Verify

```sh
npm run check
npm test
npm run build
```

The checks validate JavaScript syntax and local HTML asset references. Automated tests exercise the preview server over HTTP, including missing files, traversal attempts, and restricted repository files. The build creates `dist/` using an explicit public-file allowlist for future static deployment.

## Structure

```text
assets/icons/       Application icon
css/                Responsive application styles
js/                 Browser JavaScript entry point
scripts/            Source validation, local preview, static build
tests/              Automated Node.js tests
docs/               Requirements and implementation status
index.html          Semantic HTML entry point
```

`dist/`, installed dependencies, and local test artifacts are ignored. The preview server binds only to the local computer and serves only public application files.

## Deployment

This foundation produces static files compatible with free GitHub Pages hosting. Production deployment is pending the functional requirements, completed implementation, and browser verification. No live storefront or checkout is available yet.
