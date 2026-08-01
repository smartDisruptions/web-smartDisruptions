import { getPublishedPosts, getCategories, toSummary } from '@/lib/posts';
import ContentList from './ContentList';

// Server shell: reads the post store (filesystem, server-only) and hands the
// client list just the card fields. Post bodies stay out of the browser
// bundle — six full articles is ~35KB the index never renders.
export default function ContentIndex() {
  return (
    <ContentList
      posts={getPublishedPosts().map(toSummary)}
      categories={getCategories()}
    />
  );
}
