import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export function Testimonials() {
  const testimonials = [
    {
      name: "Ahmad Razif",
      role: "Business Owner",
      avatar: "/placeholder.svg?height=40&width=40",
      content:
        "The process was incredibly smooth. I received financing for my business expansion within 24 hours of submitting my gold jewelry. The Shariah-compliant approach gave me peace of mind.",
    },
    {
      name: "Nurul Huda",
      role: "Entrepreneur",
      avatar: "/placeholder.svg?height=40&width=40",
      content:
        "I was impressed by the transparency and professionalism. The AI valuation was fair, and I appreciated being able to track my jewelry's status through the NFT system.",
    },
    {
      name: "Tan Wei Ming",
      role: "Jewelry Collector",
      avatar: "/placeholder.svg?height=40&width=40",
      content:
        "As someone who values both my jewelry collection and ethical financing, Silsilat provided the perfect solution. The repayment terms were flexible and the service was excellent.",
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {testimonials.map((testimonial, index) => (
        <Card key={index} className="bg-white border-gold/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-1 mb-4">
              {[...Array(5)].map((_, i) => (
                <svg
                  key={i}
                  className="h-5 w-5 fill-current text-brightGold"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                </svg>
              ))}
            </div>
            <p className="text-darkOlive italic">&quot;{testimonial.content}&quot;</p>
          </CardContent>
          <CardFooter className="border-t border-gold/10 pt-4">
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
                <AvatarFallback className="bg-darkOlive text-ivory">{testimonial.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold text-deepGreen">{testimonial.name}</p>
                <p className="text-sm text-darkOlive">{testimonial.role}</p>
              </div>
            </div>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}
