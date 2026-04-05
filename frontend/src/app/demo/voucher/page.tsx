"use client"

import { OxxoVoucher } from "@/components/OxxoVoucher"

export default function VoucherDemoPage() {
    return (
        <div className="bg-zinc-100 min-h-screen">
            <OxxoVoucher
                amount={1250.00}
                reference="4152313498765432"
                clientName="ALBERTO RODRIGUEZ"
                cardNumber="1234 5678 9012 3456"
            />
        </div>
    )
}
