import BaseAppLayout from '../../BaseAppLayout';
import WebsiteResearcherSidebar from './WebsiteResearcherSidebar';

export default function WebsiteResearcherLayout() {
  return (
    <BaseAppLayout
      title="Website Researcher"
      sidebar={<WebsiteResearcherSidebar />}
    />
  );
}
