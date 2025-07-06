# Predicta ETH Cannes

This is a Next.js project template created for ETH Global Cannes hackathon.

## Features

- ⚡ **Next.js 14** with App Router
- 🎨 **Tailwind CSS** for styling
- 📝 **TypeScript** for type safety
- 🧩 **Modern UI Components** with custom Button and Card components
- 🎯 **ESLint** for code quality
- 📱 **Responsive Design** with mobile-first approach

## Getting Started

### Prerequisites

Make sure you have Node.js 18+ installed on your machine.

### Installation

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Available Scripts

- `npm run dev` - Starts the development server
- `npm run build` - Builds the app for production
- `npm run start` - Runs the built app in production mode
- `npm run lint` - Runs ESLint for code quality checks

## Project Structure

```
src/
  app/                  # App Router pages
    layout.tsx         # Root layout
    page.tsx          # Home page
  components/          # Reusable components
    ui/               # UI components
      Button.tsx      # Custom button component
      Card.tsx        # Custom card component
  styles/             # Global styles
    globals.css       # Global CSS with Tailwind
```

## Customization

- **Colors**: Edit the CSS variables in `src/styles/globals.css`
- **Components**: Add new components in `src/components/`
- **Pages**: Add new pages in `src/app/`
- **Styling**: Customize Tailwind config in `tailwind.config.js`

## Tech Stack

- [Next.js](https://nextjs.org/) - React framework
- [TypeScript](https://www.typescriptlang.org/) - Type safety
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS
- [ESLint](https://eslint.org/) - Code linting

## Deployment

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out the [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.

---

Built for ETH Global Cannes 🚀