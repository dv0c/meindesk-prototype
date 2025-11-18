// components/templates/simple/index.tsx
import Navbar from './navbar'

export default function SimpleTemplate({ tenant }: { tenant: any }) {
  return (
    <>
      <Navbar tenant={tenant} />
    </>
  )
}
