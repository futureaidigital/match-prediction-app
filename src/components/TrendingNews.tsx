import { useNewsByLeague } from '@/hooks/useNews';
import { NewsArticle } from '@/services/api';

interface TrendingNewsProps {
  leagueId: number;
  limit?: number;
}

function formatTimeAgo(publishedAt: string): string {
  const now = new Date();
  const published = new Date(publishedAt);
  const diffMs = now.getTime() - published.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'Yesterday';

  return published.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
}

function getCategoryLabel(article: NewsArticle): string {
  if (article.news_category) {
    return article.news_category.charAt(0).toUpperCase() + article.news_category.slice(1);
  }
  const type = article.news_type || '';
  if (type === 'live_blog') return 'Live Update';
  if (type === 'article') return 'News';
  return 'News';
}

function getCategoryColor(label: string): string {
  const l = label.toLowerCase();
  if (l.includes('transfer')) return '#0d1a67';
  if (l.includes('injury')) return '#e74c3c';
  if (l.includes('live')) return '#27ae60';
  if (l.includes('tactical') || l.includes('insight')) return '#8b5cf6';
  if (l.includes('preview')) return '#f39c12';
  if (l.includes('lineup')) return '#0891b2';
  if (l.includes('stats')) return '#ec4899';
  return '#7c8a9c';
}

export function TrendingNews({ leagueId, limit = 8 }: TrendingNewsProps) {
  const { data: newsResponse, isLoading } = useNewsByLeague(leagueId, limit);
  // API may return { articles: [...] } directly or wrapped in { data: { articles: [...] } }
  const articles: NewsArticle[] = newsResponse?.data?.articles || (newsResponse as any)?.articles || [];

  const font = { fontFamily: 'Montserrat, sans-serif' } as const;

  if (isLoading) {
    return (
      <div className="w-[358px] md:w-[460px] mx-auto md:mx-0" style={font}>
        <div
          className="rounded-[12px] overflow-hidden p-[8px]"
          style={{ background: 'linear-gradient(180deg, #091143 0%, #172ba9 100%)' }}
        >
          <div className="flex items-center justify-between px-2 py-[10px]">
            <div className="h-6 bg-white/20 rounded w-36 animate-pulse" />
            <div className="w-5 h-5 bg-white/20 rounded animate-pulse" />
          </div>
          <div className="bg-white rounded-[10px] p-4 space-y-4">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="flex gap-3 animate-pulse">
                <div className="flex-1">
                  <div className="h-3 bg-gray-200 rounded w-20 mb-2" />
                  <div className="h-4 bg-gray-200 rounded w-full mb-1" />
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                </div>
                <div className="w-[70px] h-[70px] bg-gray-200 rounded-[8px] shrink-0" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (articles.length === 0) {
    return (
      <div className="w-[358px] md:w-[460px] mx-auto md:mx-0" style={font}>
        <div
          className="rounded-[12px] overflow-hidden p-[8px]"
          style={{ background: 'linear-gradient(180deg, #091143 0%, #172ba9 100%)' }}
        >
          <div className="flex items-center justify-between px-2 py-[10px]">
            <h2 className="text-[18px] font-semibold text-white" style={{ letterSpacing: '-2%' }}>Trending News</h2>
          </div>
          <div className="bg-white rounded-[10px] p-8 text-center">
            <p className="text-[#7c8a9c] font-medium text-sm">No news available</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-[358px] md:w-[460px] mx-auto md:mx-0" style={font}>
      <div
        className="rounded-[12px] overflow-hidden p-[8px]"
        style={{ background: 'linear-gradient(180deg, #091143 0%, #172ba9 100%)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-2 py-[10px]">
          <h2 className="text-[18px] font-semibold text-white" style={{ letterSpacing: '-2%' }}>Trending News</h2>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="7" y1="17" x2="17" y2="7" />
            <polyline points="7 7 17 7 17 17" />
          </svg>
        </div>

        {/* White content area */}
        <div className="bg-white rounded-[10px] p-[16px] flex flex-col gap-[16px]">
          {/* Article list */}
          <div className="flex flex-col">
            {articles.map((article, i) => {
              const category = getCategoryLabel(article);
              const categoryColor = getCategoryColor(category);
              const timeAgo = formatTimeAgo(article.published_at);

              return (
                <a
                  key={article._id}
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex gap-[12px] py-[12px] hover:bg-[#f7f8fa] -mx-2 px-2 rounded-[8px] transition-colors ${i > 0 ? 'border-t border-[#f0f0f0]' : ''}`}
                >
                  {/* Text content */}
                  <div className="flex-1 min-w-0 flex flex-col gap-[4px]">
                    {/* Category + time */}
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold" style={{ color: categoryColor }}>{category}</span>
                      <span className="text-[11px] font-medium text-[#7c8a9c]">{timeAgo}</span>
                    </div>
                    {/* Title */}
                    <h3 className="text-[14px] font-bold text-[#0a0a0a] leading-[1.3] line-clamp-2">{article.title}</h3>
                  </div>
                  {/* Image */}
                  {article.image_url && (
                    <div className="w-[70px] h-[70px] rounded-[8px] overflow-hidden shrink-0 bg-[#f7f8fa]">
                      <img src={article.image_url} alt="" className="w-full h-full object-cover" />
                    </div>
                  )}
                </a>
              );
            })}
          </div>

          {/* See more button */}
          <button className="w-full h-[40px] border-[1.5px] border-[#0d1a67] text-[#0d1a67] text-[14px] font-medium rounded-[8px] hover:bg-[#0d1a67] hover:text-white transition-colors">
            See more
          </button>
        </div>
      </div>
    </div>
  );
}
