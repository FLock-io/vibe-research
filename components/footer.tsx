import { siteConfig } from "@/config/site";

export function Footer() {
  return (
    <footer className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            <p>
              © {new Date().getFullYear()} FLock.io. Data sourced from{" "}
              <a
                href={siteConfig.scholarUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                Google Scholar
              </a>
            </p>
          </div>
          
          <div className="flex items-center gap-6 text-sm">
            <a
              href={siteConfig.mainSiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
              Main Site
            </a>
            <a
              href={`${siteConfig.mainSiteUrl}/team`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
              Team
            </a>
            <a
              href="/status"
              className="text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
              Status
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

