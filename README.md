# Subro App

## What changed
- Added `api/index.js` to make the existing Express API deployable on Vercel.
- Added `vercel.json` so `/api/*` requests are routed to the Node serverless function.
- Fixed upload document links in `public/claim_view.js` to use `/api/uploads/:filename`.
- Added `serverless-http` to `package.json`.
- Added `netlify.toml` to publish the frontend static files from `public/` for Netlify.

## Deploying to Vercel
1. Push this repository to GitHub.
2. Import the repo into Vercel.
3. Set the following environment variables in Vercel:
   - `DB_HOST`
   - `DB_USER`
   - `DB_PASSWORD`
   - `DB_NAME`
   - `JWT_SECRET`
   - `ALLOW_REGISTRATION=true` (if you want registration to work)

### Notes
- The backend requires an external MySQL database.
- File upload storage on Vercel is ephemeral. Uploaded files may not persist across function invocations.

## Deploying static frontend to Netlify
- Netlify can serve the static frontend from `public/` using `netlify.toml`.
- Netlify does not support the Node API backend in this repo without additional serverless function conversion.

## Running locally
1. Install dependencies:
   ```bash
   npm install
   ```
2. Create a `.env` file with database values and `JWT_SECRET`.
3. Start locally:
   ```bash
   npm start
   ```
4. Open `http://localhost:3000`.

## Important
This app is built as a full-stack Node/Express application. Vercel is suitable for the API if you provide an external database. Netlify is only suitable for the frontend static portion as-is.

## API Endpoints
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| POST | /api/auth/register | Register a new user | No |
| POST | /api/auth/login | Login and get JWT | No |
| POST | /api/claims | Create a new claim | Yes |
| GET | /api/claims | List all claims | Yes |
| GET | /api/claims/:id | Get single claim + docs/responses | Yes |
| POST | /api/claims/:id/respond | Add a response (negotiation) | Yes |
| POST | /api/complaints | Submit a complaint | Yes |
| GET | /api/complaints | List user’s complaints | Yes |
| GET | /api/complaints/:id | Get single complaint | Yes (owner/admin) |
| PUT | /api/complaints/:id | Update complaint status (admin) | Admin only |

Method	Endpoint	Description	Auth Required
POST	/api/auth/register	Register a new user	No
POST	/api/auth/login	Login and get JWT	No
POST	/api/claims	Create a new claim	Yes
GET	/api/claims	List all claims	Yes
GET	/api/claims/:id	Get single claim + docs/responses	Yes
POST	/api/claims/:id/respond	Add a response (negotiation)	Yes
POST	/api/complaints	Submit a complaint	Yes
GET	/api/complaints	List user’s complaints	Yes
GET	/api/complaints/:id	Get single complaint	Yes (owner/admin)
PUT	/api/complaints/:id	Update complaint status (admin)	Admin only
🤝 Contributing
Fork the repository

Create a feature branch (git checkout -b feature/amazing)

Commit your changes (git commit -m 'Add some amazing feature')

Push to the branch (git push origin feature/amazing)

Open a Pull Request

📄 License
This project is licensed under the MIT License – see the LICENSE file for details.

📧 Contact
For questions or support, please contact: info@subroinsurance.com

Built with ❤️ for insurance professionals.

=======
# Subro App

## What changed
- Added `api/index.js` to make the existing Express API deployable on Vercel.
- Added `vercel.json` so `/api/*` requests are routed to the Node serverless function.
- Fixed upload document links in `public/claim_view.js` to use `/api/uploads/:filename`.
- Added `serverless-http` to `package.json`.
- Added `netlify.toml` to publish the frontend static files from `public/` for Netlify.

## Deploying to Vercel
1. Push this repository to GitHub.
2. Import the repo into Vercel.
3. Set the following environment variables in Vercel:
   - `DB_HOST`
   - `DB_USER`
   - `DB_PASSWORD`
   - `DB_NAME`
   - `JWT_SECRET`
   - `ALLOW_REGISTRATION=true` (if you want registration to work)

### Notes
- The backend requires an external MySQL database.
- File upload storage on Vercel is ephemeral. Uploaded files may not persist across function invocations.

## Deploying static frontend to Netlify
- Netlify can serve the static frontend from `public/` using `netlify.toml`.
- Netlify does not support the Node API backend in this repo without additional serverless function conversion.

## Running locally
1. Install dependencies:
   ```bash
   npm install
   ```
2. Create a `.env` file with database values and `JWT_SECRET`.
3. Start locally:
   ```bash
   npm start
   ```
4. Open `http://localhost:3000`.

## Important
This app is built as a full-stack Node/Express application. Vercel is suitable for the API if you provide an external database. Netlify is only suitable for the frontend static portion as-is.
>>>>>>> 14a2ea5 (Add Vercel API function, deployment configs, and fix upload routes)
