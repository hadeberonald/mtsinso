import FinanceApplicationPage from '@/components/FinanceApplicationPage'

interface Props {
  searchParams: {
    vehicleId?: string
    vehicleDetails?: string
    price?: string
  }
}

export const metadata = {
  title: 'Finance Application — IC Cars',
  description: 'Apply for vehicle finance. NCR-compliant pre-approval with instant assessment.',
}

export default function FinanceApplyPage({ searchParams }: Props) {
  const vehiclePrice = searchParams.price ? parseFloat(searchParams.price) : undefined

  return (
    <FinanceApplicationPage
      vehicleId={searchParams.vehicleId}
      vehicleDetails={searchParams.vehicleDetails
        ? decodeURIComponent(searchParams.vehicleDetails)
        : undefined}
      vehiclePrice={vehiclePrice}
    />
  )
}