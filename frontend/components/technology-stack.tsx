import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Database, Globe, Lock, Zap, Code } from "lucide-react"

export function TechnologyStack() {
  const technologies = [
    {
      name: "Hedera Hashgraph",
      description: "NFT, HTS Token Service",
      icon: <Zap className="h-8 w-8 text-blue-600" />,
      category: "Blockchain",
    },
    {
      name: "React / Next.js",
      description: "UI Frontend",
      icon: <Code className="h-8 w-8 text-blue-500" />,
      category: "Frontend",
    },
    {
      name: "Node.js / Python",
      description: "API & backend",
      icon: <Database className="h-8 w-8 text-green-600" />,
      category: "Backend",
    },
    {
      name: "PostgreSQL / Firebase",
      description: "Metadata & off-chain data",
      icon: <Database className="h-8 w-8 text-orange-600" />,
      category: "Database",
    },
    {
      name: "IPFS / HFS",
      description: "SAG document storage",
      icon: <Globe className="h-8 w-8 text-purple-600" />,
      category: "Storage",
    },
    {
      name: "OAuth2 / WalletConnect",
      description: "Secure login",
      icon: <Lock className="h-8 w-8 text-red-600" />,
      category: "Security",
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {technologies.map((tech, index) => (
        <Card key={index} className="border-gold/20 hover:shadow-lg transition-shadow">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="p-4 bg-softBeige rounded-full">{tech.icon}</div>
            </div>
            <CardTitle className="text-deepGreen">{tech.name}</CardTitle>
            <CardDescription>{tech.description}</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <span className="inline-block px-3 py-1 bg-gold/20 text-gold text-sm rounded-full">{tech.category}</span>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
