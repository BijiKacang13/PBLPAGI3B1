import { Suspense } from "react";
import AkuntanDetailClient from "./AkuntanDetailClient";

export default function Page() {
  return (
    <Suspense fallback={<div className="p-6">Memuat data...</div>}>
      <AkuntanDetailClient />
    </Suspense>
  );
}
