import { Suspense } from "react";
import AkuntanDetailClient from "./AkuntanDetailClient";

// Force dynamic rendering karena menggunakan useSearchParams
export const dynamic = 'force-dynamic';

export default function Page() {
  return (
    <Suspense fallback={<div className="p-6">Memuat data...</div>}>
      <AkuntanDetailClient />
    </Suspense>
  );
}
