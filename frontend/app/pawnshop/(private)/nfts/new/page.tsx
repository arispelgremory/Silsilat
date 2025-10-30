'use client'

import { CreateNFTForm } from '@/components/nft/create-nft-form'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

export default function NewNFTPage() {
  const router = useRouter()

  return (
    <div className="space-y-6">
        <div className="flex items-center gap-4">
            <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/pawnshop/nfts')}
            >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to NFT List
            </Button>
            <h1 className="text-3xl font-bold">Create New NFT</h1>
        </div>

        <CreateNFTForm />
    </div>
  )
}