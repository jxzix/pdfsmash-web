/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_BACKEND_URL: process.env.NEXT_PUBLIC_BACKEND_URL,
    NEXT_PUBLIC_STRIPE_PAYMENT_LINK: process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK,
  },
}
module.exports = nextConfig
