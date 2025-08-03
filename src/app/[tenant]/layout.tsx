import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "AccessWash Customer Portal",
  description: "Manage your water service account online",
}

export default function TenantLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: { tenant: string }
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      {children}
    </div>
  )
}