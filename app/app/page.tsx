// app/page.tsx
import { redirect } from 'next/navigation'

export default function Page() {
  // Always redirect to your chosen default route:
  return redirect('/platform/dashboard')
}