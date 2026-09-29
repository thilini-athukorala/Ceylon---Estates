import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
// proxy /api to the Express server during development
export default defineConfig({ plugins:[react()], server:{ proxy:{ '/api':'http://localhost:5000' } } })
