# CartNova implementation and verification

The application is implemented. Local source checks, **39 unit/HTTP tests**, and **31 Playwright tests** passed. A separate unmocked browser run fetched **20 FakeStoreAPI products with HTTP 200**, compared live prices and totals, confirmed bag persistence after reload, completed simulated checkout, verified image loading and widths 1440/768/390/320px, and reported zero JavaScript runtime errors.

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
| 29 | Browser testing, documentation and actual screenshots | Complete locally |
| 30 | Verified CI/CD, free deployment and production checks | Pending deployment |

## Deployment status

The initial GitHub Actions verification succeeded. The complete Pages verification/deployment workflow and actual production verification are the remaining release work. The intended address is `https://gloria-mbilinyi.github.io/cartnova-datheon/`; it has not yet been claimed as a verified deployment in this record.

## Boundaries

Checkout is a local simulation. No payment, real order, customer-data backend, stock reservation, delivery promise, or persistent customer profile exists. Browsing depends on the external FakeStoreAPI and image service. Browser storage can be cleared or blocked. See the README for calculation rules, privacy behavior, and test commands.
