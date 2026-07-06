# RiverCity Courier

This workspace contains a Next.js frontend and a Node.js/MongoDB backend.

## Getting Started

Run the backend and frontend in separate terminals:

```bash
cd Back-end
npm install
npm run dev
```

```bash
cd Front-end
npm install
npm run dev
```

The frontend expects `BACKEND_API_URL` to point at the backend API, for example:

```bash
BACKEND_API_URL=http://localhost:4000/api
```

The backend expects:

```bash
PORT=4000
MONGODB_URI=mongodb://127.0.0.1:27017/rivercitycourier
MONGODB_DB_NAME=rivercitycourier
FRONTEND_ORIGIN=http://localhost:3000
```

## Frontend

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

- `Back-end/` - Express API and MongoDB connection
- `app/` - Next.js app directory
  - `layout.tsx` - Root layout
  - `page.tsx` - Home page
  - `globals.css` - Global styles
- `public/` - Static assets
- `package.json` - Project dependencies

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
