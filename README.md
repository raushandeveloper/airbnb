# Airbnb Clone

A full-stack Airbnb-style booking application built with Node.js, Express, EJS, and MongoDB — allowing hosts to list homes and guests to browse and reserve them.

**Live Demo:** [airbnb-sooty-eight.vercel.app](https://airbnb-sooty-eight.vercel.app)

---

## Features

- 🏠 Host dashboard — add, edit, and delete home listings
- 🔐 User authentication (signup/login) with session-based auth
- 📸 Image and PDF uploads via Cloudinary (cloud storage)
- 🗺️ Browse and reserve listed homes
- 💅 Responsive UI styled with Tailwind CSS
- ☁️ Deployed as a serverless app on Vercel

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Node.js, Express.js |
| Templating | EJS |
| Database | MongoDB (Mongoose ODM) |
| Sessions | express-session + connect-mongodb-session |
| File Uploads | Multer + Cloudinary |
| Styling | Tailwind CSS |
| Deployment | Vercel (serverless functions) |

---

## Project Structure

```
airbnb/
├── app.js                  # App entry point
├── vercel.json              # Vercel serverless config
├── controllers/             # Route handlers (auth, host, store, errors)
├── models/                  # Mongoose schemas (Home, User)
├── routes/                  # Express routers
├── utils/                   # Helper utilities (path resolution, etc.)
├── views/                   # EJS templates
│   ├── auth/
│   ├── host/
│   └── store/
├── public/                  # Static assets (CSS, images)
└── package.json
```

---

## Getting Started (Local Setup)

### Prerequisites
- Node.js (v18+ recommended)
- A MongoDB Atlas account (or local MongoDB instance)
- A Cloudinary account (free tier works)

### 1. Clone the repository
```bash
git clone https://github.com/raushandeveloper/airbnb.git
cd airbnb
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment variables
Create a `.env` file in the project root:
```env
MONGO_URI=your_mongodb_connection_string
SESSION_SECRET=your_session_secret
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

### 4. Run the app locally
```bash
npm start
```
This runs the Express server (via `nodemon`) alongside the Tailwind CSS watcher.
The app will be available at `http://localhost:3001`.

---

## Deployment (Vercel)

This project is configured for serverless deployment on Vercel:

- `vercel.json` routes all requests through `app.js` and explicitly includes the `views/` and `public/` folders (required since EJS templates aren't traced by Vercel's default bundler).
- File uploads (photos and PDFs) are stored on **Cloudinary**, since Vercel's serverless filesystem is read-only except for the temporary `/tmp` directory.
- MongoDB connection is cached across function invocations to avoid reconnecting on every request.

To deploy your own copy:
1. Push the repo to GitHub
2. Import the project into Vercel
3. Add the environment variables listed above under **Project Settings → Environment Variables**
4. Deploy 🚀

---

## Known Limitations

- Uploaded files rely on Cloudinary; there is no local fallback in production.
- Session store is MongoDB-backed, so a valid `MONGO_URI` is required for login to work.

---

## License

ISC
