// client/src/pages/Home.jsx
import React from 'react';
import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-blue-50 dark:from-gray-900 dark:to-blue-950">
      {/* Navigation */}
      <nav className="border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">MI</span>
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">MadeInIndia</span>
            </div>
            <div className="flex items-center gap-4">
              <Link 
                to="/login" 
                className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-medium transition-colors"
              >
                Sign in
              </Link>
              <Link 
                to="/signup" 
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-6 py-2 rounded-full font-medium transition-all duration-200 hover:shadow-lg"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="text-center lg:text-left">
              <h1 className="text-4xl lg:text-6xl font-extrabold leading-tight text-gray-900 dark:text-white">
                Connect, Share &{' '}
                <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Celebrate
                </span>
              </h1>
              <p className="mt-6 text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
                A social network built by Indians, for Indians. Share moments, follow friends, 
                discover trends, and find local places — all with a fast, clean interface.
              </p>

              {/* Features List */}
              <ul className="mt-8 space-y-4 text-gray-700 dark:text-gray-300">
                {[
                  '🎯 Real-time feed & notifications',
                  '📸 Posts with images & location tags',
                  '💬 Follow users, comment, like, and repost',
                  '🔒 Simple, privacy-respecting architecture'
                ].map((feature, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                    {feature}
                  </li>
                ))}
              </ul>

              {/* CTA Buttons */}
              <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link
                  to="/signup"
                  className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                  Create Your Account
                </Link>
                <Link 
                  to="/login" 
                  className="inline-flex items-center justify-center px-8 py-4 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-indigo-500 dark:hover:border-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-400 font-semibold rounded-2xl transition-all duration-200"
                >
                  Already have an account?
                </Link>
              </div>

              {/* Tech Stack */}
              <div className="mt-12">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Built with modern technologies</p>
                <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
                  {['React', 'Tailwind', 'Redux', 'Node.js', 'MongoDB', 'Express'].map((tech) => (
                    <span 
                      key={tech}
                      className="px-3 py-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 rounded-full text-sm font-medium"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Content - Example Posts */}
            <div className="relative">
              <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-6 lg:p-8 border border-gray-200 dark:border-gray-700">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                  <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Trending in India
                </h3>

                <div className="space-y-6">
                  {[
                    {
                      username: '@rajan',
                      name: 'Rajan Patel',
                      content: 'Exploring the street food lanes of Ahmedabad — must try the khandvi! 🍛',
                      tags: ['#StreetFood', '#Ahmedabad'],
                      likes: 42,
                      comments: 8
                    },
                    {
                      username: '@neha',
                      name: 'Neha Sharma',
                      content: 'Shared a quick recipe video — dal with a twist. Perfect for busy weeknights! 👩‍🍳',
                      tags: ['#HomeCooking', '#IndianFood'],
                      likes: 89,
                      comments: 15
                    },
                    {
                      username: '@milanb',
                      name: 'Milan B.',
                      content: 'Launching my first open-source project today 🚀 — MadeInIndia social app. So excited!',
                      tags: ['#OpenSource', '#Tech'],
                      likes: 156,
                      comments: 23
                    }
                  ].map((post, index) => (
                    <div 
                      key={index}
                      className="p-4 rounded-xl bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-700 dark:to-gray-800 border border-gray-100 dark:border-gray-600 transition-all duration-200 hover:shadow-md"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-indigo-400 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                          {post.name.charAt(0)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-gray-900 dark:text-white">{post.name}</span>
                            <span className="text-gray-500 dark:text-gray-400 text-sm">{post.username}</span>
                          </div>
                          <p className="mt-2 text-gray-700 dark:text-gray-300">{post.content}</p>
                          <div className="flex flex-wrap gap-2 mt-3">
                            {post.tags.map((tag, tagIndex) => (
                              <span 
                                key={tagIndex}
                                className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-xs"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                          <div className="flex items-center gap-4 mt-3 text-sm text-gray-500 dark:text-gray-400">
                            <span>❤️ {post.likes}</span>
                            <span>💬 {post.comments}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Floating Elements */}
              <div className="absolute -top-4 -right-4 w-8 h-8 bg-yellow-400 rounded-full animate-bounce"></div>
              <div className="absolute -bottom-4 -left-4 w-6 h-6 bg-green-400 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">
              Why Choose MadeInIndia?
            </h2>
            <p className="mt-4 text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Experience social networking designed with Indian users in mind
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: '📍',
                title: 'Local Discovery',
                description: 'Tag locations and find posts near you using OpenStreetMap data. Discover hidden gems in your city.',
                gradient: 'from-green-400 to-blue-500'
              },
              {
                icon: '🔒',
                title: 'Privacy First',
                description: 'Choose who sees your posts and control your profile easily. Your data stays with you.',
                gradient: 'from-purple-400 to-pink-500'
              },
              {
                icon: '⚡',
                title: 'Fast & Modern',
                description: 'Built with React, Tailwind and optimized for mobile and desktop. Lightning fast experience.',
                gradient: 'from-orange-400 to-red-500'
              }
            ].map((feature, index) => (
              <div 
                key={index}
                className="group relative bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2"
              >
                <div className={`w-16 h-16 bg-gradient-to-r ${feature.gradient} rounded-2xl flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  {feature.description}
                </p>
                
                {/* Hover effect border */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 opacity-0 group-hover:opacity-5 transition-opacity duration-300"></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">MI</span>
              </div>
              <span className="text-xl font-bold">MadeInIndia</span>
            </div>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Connecting Indians across the globe. Share your stories, discover local treasures, 
              and celebrate our diverse culture together.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-6 text-gray-400">
              <a href="#" className="hover:text-white transition-colors">About</a>
              <a href="#" className="hover:text-white transition-colors">Privacy</a>
              <a href="#" className="hover:text-white transition-colors">Terms</a>
              <a href="#" className="hover:text-white transition-colors">Contact</a>
              <a href="#" className="hover:text-white transition-colors">Help</a>
            </div>
            <p className="mt-8 text-gray-500 text-sm">
              © 2024 MadeInIndia. Built with ❤️ for India.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}