import { siteConfig } from "@/config/site";

export default function AboutPage() {
  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                About FLock Research
              </span>
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Advancing the frontier of decentralized AI and privacy-preserving machine learning
            </p>
          </div>

          {/* Mission */}
          <section className="mb-12 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-gray-800 dark:via-indigo-900/20 dark:to-purple-900/20 rounded-lg p-8 border border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-bold mb-4">Our Mission</h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              FLock.io is at the forefront of federated learning and decentralized AI research. 
              We believe in democratizing AI by enabling collaborative machine learning while 
              preserving privacy and data sovereignty. Our research spans cutting-edge topics 
              including blockchain-based federated learning, privacy-preserving techniques, 
              incentive mechanisms, and efficient distributed training algorithms.
            </p>
          </section>

          {/* Research Areas */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Research Areas</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg border border-gray-200 dark:border-gray-700">
                <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">Privacy-Preserving ML</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Developing techniques for secure aggregation, differential privacy, and 
                  encrypted computation in federated learning systems.
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg border border-gray-200 dark:border-gray-700">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">Blockchain Integration</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Leveraging blockchain technology for transparent, verifiable, and 
                  decentralized federated learning networks.
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg border border-gray-200 dark:border-gray-700">
                <div className="w-12 h-12 bg-pink-100 dark:bg-pink-900/30 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-pink-600 dark:text-pink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">Incentive Mechanisms</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Designing game-theoretic incentive structures to encourage participation 
                  and ensure fair contribution in federated networks.
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg border border-gray-200 dark:border-gray-700">
                <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">Efficient Training</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Optimizing federated learning for heterogeneous devices, reducing 
                  communication overhead, and accelerating convergence.
                </p>
              </div>
            </div>
          </section>

          {/* Publications */}
          <section className="mb-12 bg-white dark:bg-gray-800 rounded-lg p-8 shadow-lg border border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-bold mb-4">Publications</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Our research has been published at top-tier venues including NeurIPS, ICML, ICLR, 
              and CVPR. We maintain an active presence in the academic community and regularly 
              contribute to advancing the state of the art in federated learning and decentralized AI.
            </p>
            <a
              href={siteConfig.scholarUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-medium hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl"
            >
              View on Google Scholar
            </a>
          </section>

          {/* About This Site */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">About This Site</h2>
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                This research visualization platform automatically aggregates and presents 
                FLock's academic contributions. The site features:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 mb-4">
                <li>Interactive citation network visualization</li>
                <li>Semantic topic exploration and clustering</li>
                <li>AI-powered research assistant for Q&A</li>
                <li>Automatic synchronization with Google Scholar</li>
                <li>Venue-based filtering and sorting</li>
              </ul>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Data is automatically refreshed from our{" "}
                <a
                  href={siteConfig.scholarUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  Google Scholar profile
                </a>{" "}
                to ensure the latest research is always available.
              </p>
            </div>
          </section>

          {/* Contact */}
          <section className="text-center">
            <h2 className="text-2xl font-bold mb-4">Get in Touch</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-6">
              Interested in collaborating or learning more about our research?
            </p>
            <a
              href={siteConfig.mainSiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-8 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg font-medium hover:bg-gray-800 dark:hover:bg-gray-100 transition-all shadow-lg hover:shadow-xl"
            >
              Visit FLock.io
            </a>
          </section>
        </div>
      </div>
    </div>
  );
}

