
import { useState, useEffect } from 'react';

export function TestimonialsSection() {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  const testimonials = [
    {
      name: 'Sarah Chen',
      role: 'CTO, TechCorp',
      avatar: 'https://readdy.ai/api/search-image?query=professional%20asian%20woman%20executive%20in%20modern%20office%20setting%2C%20confident%20business%20leader%20portrait%2C%20clean%20corporate%20headshot%20with%20soft%20lighting&width=100&height=100&seq=avatar-001&orientation=squarish',
      quote: 'VISIOS transformed our entire data infrastructure. The AI-driven insights have increased our operational efficiency by 300% and reduced costs significantly.',
      rating: 5,
      company: 'TechCorp'
    },
    {
      name: 'Michael Rodriguez',
      role: 'Head of Innovation, GlobalBank',
      avatar: 'https://readdy.ai/api/search-image?query=professional%20hispanic%20businessman%20in%20suit%2C%20confident%20executive%20portrait%2C%20modern%20corporate%20headshot%20with%20professional%20lighting&width=100&height=100&seq=avatar-002&orientation=squarish',
      quote: 'The neural interface technology exceeded all our expectations. We\'ve seen unprecedented improvements in customer service automation and fraud detection.',
      rating: 5,
      company: 'GlobalBank'
    },
    {
      name: 'Dr. Emily Watson',
      role: 'Research Director, MedTech Solutions',
      avatar: 'https://readdy.ai/api/search-image?query=professional%20woman%20doctor%20in%20white%20coat%2C%20confident%20medical%20professional%20portrait%2C%20clean%20healthcare%20setting%20with%20soft%20lighting&width=100&height=100&seq=avatar-003&orientation=squarish',
      quote: 'VISIOS\' AI Vision Pro has revolutionized our diagnostic capabilities. Patient outcomes have improved dramatically with 95% accuracy in early detection.',
      rating: 5,
      company: 'MedTech Solutions'
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [testimonials.length]);

  return (
    <section className="relative py-24">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-light text-white mb-6">
            What Our <span className="text-purple-400">Clients</span> Say
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Trusted by industry leaders worldwide
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="relative overflow-hidden">
            <div 
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${currentTestimonial * 100}%)` }}
            >
              {testimonials.map((testimonial, index) => (
                <div key={index} className="w-full flex-shrink-0">
                  <div className="bg-gray-900/50 backdrop-blur-md rounded-2xl p-8 md:p-12 border border-gray-700/50 text-center">
                    <div className="flex justify-center mb-6">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <i key={i} className="ri-star-fill text-yellow-400 text-xl mx-1"></i>
                      ))}
                    </div>

                    <blockquote className="text-xl md:text-2xl text-gray-300 leading-relaxed mb-8 font-light">
                      "{testimonial.quote}"
                    </blockquote>

                    <div className="flex items-center justify-center space-x-4">
                      <img
                        src={testimonial.avatar}
                        alt={testimonial.name}
                        className="w-16 h-16 rounded-full object-cover border-2 border-purple-500/30"
                      />
                      <div className="text-left">
                        <div className="text-white font-semibold text-lg">
                          {testimonial.name}
                        </div>
                        <div className="text-gray-400">
                          {testimonial.role}
                        </div>
                        <div className="text-purple-400 text-sm">
                          {testimonial.company}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation Dots */}
          <div className="flex justify-center space-x-3 mt-8">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentTestimonial(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 cursor-pointer ${
                  currentTestimonial === index
                    ? 'bg-purple-500'
                    : 'bg-gray-600 hover:bg-gray-500'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
