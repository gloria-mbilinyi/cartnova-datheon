# CartNova implementation and verification

The application is implemented and deployed. Local source checks, **40 unit/HTTP tests**, and **31 Playwright tests** passed, as did the complete GitHub Actions verification/deployment workflow. All 31 browser regression tests also passed against production. A separate unmocked production browser run fetched **20 FakeStoreAPI products with HTTP 200**, compared live prices and totals, confirmed bag persistence after reload, completed simulated checkout, verified image loading and widths 1440/768/390/320px, and reported zero JavaScript runtime errors.

Actual screenshots and the live capture record are under [assets/screenshots](../assets/screenshots/). No regression fixtures are used in the production application.

## Milestones

| # | Milestone | Status |
| --- | --- | --- |
| 01 | Inspect existing repository, verify Gloria authentication, initialize and push | Complete |
| 02 | Semantic HTML structure | Complete |
| 03 | Design tokens and typography | Complete |
| 04 | Responsive navigation | Complete |
| 05 | Hero and storefront sections | Complete |
| 06 | Responsive product grid | Complete |
| 07 | API transport, cancellation, timeout and error handling | Complete |
| 08 | Product response validation and normalization | Complete |
| 09 | Safe product cards and image fallback | Complete |
| 10 | Categories and combined Clothing | Complete |
| 11 | Composable search | Complete |
| 12 | All requested sorting options | Complete |
| 13 | Product details dialog | Complete |
| 14 | Central application state and derived selectors | Complete |
| 15 | Add to cart and badge updates | Complete |
| 16 | Remove cart lines | Complete |
| 17 | Quantity changes and 1–99 boundary policy | Complete |
| 18 | Validated versioned localStorage persistence | Complete |
| 19 | Responsive slide-out cart drawer | Complete |
| 20 | Integer-cent subtotal calculation | Complete |
| 21 | Rounded demo tax and shipping thresholds | Complete |
| 22 | Simulated checkout form and shared totals | Complete |
| 23 | Required field validation and helpful errors | Complete |
| 24 | Local confirmation and cart clearing after validation | Complete |
| 25 | Loading, empty, failure, retry and cross-tab states | Complete |
| 26 | Theme preference and responsive polish | Complete |
| 27 | Keyboard focus, Escape, reduced motion and accessibility | Complete |
| 28 | Unit and regression tests | Complete |
| 29 | Browser testing, documentation and actual screenshots | Complete |
| 30 | Verified CI/CD, free deployment and production checks | Complete |

## Deployment status

**Verified live site:** https://gloria-mbilinyi.github.io/cartnova-datheon/

The [successful release workflow](https://github.com/gloria-mbilinyi/cartnova-datheon/actions/runs/45127295508) verified 40 unit/HTTP tests and 31 browser tests before deploying commit `9bfede7f4fd371b38e79e91b7367909508f1092e`. The separate production check verified that exact commit through `build-info.json` on 2026-11-23 at 06:56 UTC. Its record is [production-evidence.json](production-evidence.json).

That live run compared the first product's $109.95 price and a two-product bag totaling $142.83, then completed the checkout simulation and verified cart clearing. A separate deterministic regression run against the HTTPS site passed 31/31 tests. Additional documentation/screenshot changes are verified by subsequent workflow runs linked from the repository Actions page.

CI initially blocked a 320px overflow on Linux. Narrow navigation was corrected and the complete rerun passed; no failed verification was allowed to deploy.

## Boundaries

Checkout is a local simulation. No payment, real order, customer-data backend, stock reservation, delivery promise, or persistent customer profile exists. Browsing depends on the external FakeStoreAPI and image service. Browser storage can be cleared or blocked. See the README for calculation rules, privacy behavior, and test commands.
