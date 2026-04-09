
import React from 'react';

const FeaturesSection: React.FC = () => {
  const features = [
    {
      icon: 'ri-cloud-line',
      title: 'Cloud Infrastructure',
      description: 'Scalable cloud solutions that grow with your startup, from MVP to enterprise scale.',
      color: 'bg-blue-500'
    },
    {
      icon: 'ri-brain-line',
      title: 'AI & Machine Learning',
      description: 'Integrate powerful AI capabilities to automate processes and gain insights.',
      color: 'bg-purple-500'
    },
    {
      icon: 'ri-shield-check-line',
      title: 'Enterprise Security',
      description: 'Bank-level security protocols to protect your data and user information.',
      color: 'bg-green-500'
    },
    {
      icon: 'ri-speed-line',
      title: 'High Performance',
      description: 'Lightning-fast applications with 99.9% uptime and global CDN distribution.',
      color: 'bg-orange-500'
    },
    {
      icon: 'ri-team-line',
      title: 'Team Collaboration',
      description: 'Built-in tools for seamless team collaboration and project management.',
      color: 'bg-indigo-500'
    },
    {
      icon: 'ri-line-chart-line',
      title: 'Analytics & Insights',
      description: 'Real-time analytics and business intelligence to drive data-driven decisions.',
      color: 'bg-pink-500'
    }
  ];

  return (
    <section id="features" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Everything You Need to Scale
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Our comprehensive platform provides all the tools and services your startup needs 
            to build, launch, and scale successfully in today's competitive market.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
              <div className={`w-16 h-16 ${feature.color} rounded-2xl flex items-center justify-center mb-6`}>
                <i className={`${feature.icon} text-white text-2xl`}></i>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">{feature.title}</h3>
              <p className="text-gray-600 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <button className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors whitespace-nowrap cursor-pointer shadow-lg">
            Explore All Features
          </button>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
